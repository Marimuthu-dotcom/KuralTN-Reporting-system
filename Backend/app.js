// Backend/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsOptions } from './config/cors.js';
import { query, testConnection, getDBStatus } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Essential middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder for public uploaded images
app.use('/uploads/public', express.static(path.resolve(__dirname, 'uploads/public')));

// Helper to handle database queries safely
function handleDbError(res, err, context) {
  console.error(`[API Error - ${context}]:`, err.message);
  return res.status(503).json({
    status: 'error',
    message: 'Database is currently unavailable',
  });
}

// 1. Health & Database Check
app.get('/api/health', async (_req, res) => {
  const connected = await testConnection();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'healthy' : 'degraded',
    database: getDBStatus(),
    system: 'KuralTN Minimal API',
    timestamp: new Date().toISOString(),
  });
});

// 2. Districts
app.get('/api/districts', async (_req, res) => {
  try {
    const districts = await query('SELECT * FROM districts ORDER BY name ASC');
    res.json({ status: 'success', data: districts });
  } catch (err) {
    handleDbError(res, err, 'GET /api/districts');
  }
});

app.get('/api/districts/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM districts WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'District not found' });
    }
    res.json({ status: 'success', data: rows[0] });
  } catch (err) {
    handleDbError(res, err, 'GET /api/districts/:id');
  }
});

// 3. Categories & Wards
app.get('/api/wards/categories', async (_req, res) => {
  try {
    const categories = await query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC');
    res.json({ status: 'success', data: categories });
  } catch (err) {
    handleDbError(res, err, 'GET /api/wards/categories');
  }
});

app.get('/api/wards', async (_req, res) => {
  try {
    const wards = await query(
      `SELECT w.*, lb.name AS local_body_name, lb.district_id, d.name AS district_name
       FROM wards w
       LEFT JOIN local_bodies lb ON w.local_body_id = lb.id
       LEFT JOIN districts d ON lb.district_id = d.id
       ORDER BY w.ward_number ASC`
    );
    res.json({ status: 'success', data: wards });
  } catch (err) {
    handleDbError(res, err, 'GET /api/wards');
  }
});

app.get('/api/wards/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT w.*, lb.name AS local_body_name, lb.district_id, d.name AS district_name
       FROM wards w
       LEFT JOIN local_bodies lb ON w.local_body_id = lb.id
       LEFT JOIN districts d ON lb.district_id = d.id
       WHERE w.id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'Ward not found' });
    }
    res.json({ status: 'success', data: rows[0] });
  } catch (err) {
    handleDbError(res, err, 'GET /api/wards/:id');
  }
});

app.get('/api/wards/:id/members', async (req, res) => {
  try {
    const members = await query(
      `SELECT wm.id, wm.ward_id, wm.is_verified, wm.joined_at, u.id AS user_id, u.full_name, u.avatar_url, u.role
       FROM ward_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.ward_id = ?`,
      [req.params.id]
    );
    res.json({ status: 'success', data: members });
  } catch (err) {
    handleDbError(res, err, 'GET /api/wards/:id/members');
  }
});

// 4. Ward Announcements & Community Messages
app.get('/api/wards/:id/announcements', async (req, res) => {
  try {
    const rows = await query(
      'SELECT * FROM ward_announcements WHERE ward_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) {
    handleDbError(res, err, 'GET /api/wards/:id/announcements');
  }
});

app.get('/api/wards/:id/messages', async (req, res) => {
  try {
    const rows = await query(
      'SELECT * FROM messages WHERE ward_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) {
    handleDbError(res, err, 'GET /api/wards/:id/messages');
  }
});

app.post('/api/wards/:id/messages', async (req, res) => {
  try {
    const { sender_user_id, sender_name, sender_role, message_text, complaint_ref_link } = req.body;
    if (!message_text) {
      return res.status(400).json({ status: 'error', message: 'Message text is required' });
    }
    const id = `msg-${Date.now()}`;
    await query(
      `INSERT INTO messages (id, ward_id, sender_user_id, sender_name, sender_role, message_text, complaint_ref_link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.params.id,
        sender_user_id || 'user-citizen-anand',
        sender_name || 'Citizen Member',
        sender_role || 'CITIZEN',
        message_text,
        complaint_ref_link || null,
      ]
    );
    const created = await query('SELECT * FROM messages WHERE id = ?', [id]);
    res.status(201).json({ status: 'success', data: created[0] });
  } catch (err) {
    handleDbError(res, err, 'POST /api/wards/:id/messages');
  }
});

// 5. Complaints (List, Detail, Create, Comments)
app.get('/api/complaints', async (req, res) => {
  try {
    const { search, district_id, ward_id, category_id, status, sortBy, page = 1, limit = 20 } = req.query;
    const conditions = ['c.is_public = TRUE'];
    const params = [];

    if (district_id) {
      conditions.push('c.district_id = ?');
      params.push(district_id);
    }
    if (ward_id) {
      conditions.push('c.ward_id = ?');
      params.push(ward_id);
    }
    if (category_id) {
      conditions.push('c.category_id = ?');
      params.push(category_id);
    }
    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(c.title LIKE ? OR c.description LIKE ? OR c.reference_id LIKE ? OR c.address_text LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const orderClause =
      sortBy === 'most_supported'
        ? 'ORDER BY c.supports_count DESC, c.created_at DESC'
        : 'ORDER BY c.created_at DESC';

    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offsetNum = Math.max(0, (parseInt(page, 10) - 1) * limitNum);

    const rows = await query(
      `SELECT c.*, cat.name AS category_name, w.ward_name, w.councillor_name, d.name AS district_name, lb.name AS local_body_name
       FROM complaints c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN wards w ON c.ward_id = w.id
       LEFT JOIN districts d ON c.district_id = d.id
       LEFT JOIN local_bodies lb ON c.local_body_id = lb.id
       WHERE ${conditions.join(' AND ')}
       ${orderClause}
       LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );

    res.json({
      status: 'success',
      data: rows,
      pagination: { total: rows.length, page: parseInt(page, 10) || 1, limit: limitNum },
    });
  } catch (err) {
    handleDbError(res, err, 'GET /api/complaints');
  }
});

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.*, cat.name AS category_name, w.ward_name, w.councillor_name, d.name AS district_name, lb.name AS local_body_name
       FROM complaints c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN wards w ON c.ward_id = w.id
       LEFT JOIN districts d ON c.district_id = d.id
       LEFT JOIN local_bodies lb ON c.local_body_id = lb.id
       WHERE c.id = ? OR c.reference_id = ?`,
      [req.params.id, req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'Complaint not found' });
    }
    const complaint = rows[0];
    const [images, status_history, comments, deadlines] = await Promise.all([
      query('SELECT * FROM complaint_images WHERE complaint_id = ?', [complaint.id]),
      query('SELECT * FROM complaint_status_history WHERE complaint_id = ? ORDER BY created_at ASC', [complaint.id]),
      query(
        `SELECT cc.*, u.full_name AS author_name, u.role AS author_role
         FROM complaint_comments cc
         LEFT JOIN users u ON cc.user_id = u.id
         WHERE cc.complaint_id = ?
         ORDER BY cc.created_at ASC`,
        [complaint.id]
      ),
      query('SELECT * FROM complaint_deadlines WHERE complaint_id = ? AND is_active = TRUE', [complaint.id]),
    ]);

    res.json({
      status: 'success',
      data: {
        ...complaint,
        images,
        status_history,
        comments,
        active_deadline: deadlines[0] || null,
      },
    });
  } catch (err) {
    handleDbError(res, err, 'GET /api/complaints/:id');
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { title, description, category_id, ward_id, address_text, landmark, priority, latitude, longitude, user_id } = req.body;
    if (!title || !description || !category_id || !ward_id || !address_text) {
      return res.status(400).json({ status: 'error', message: 'Missing required complaint fields' });
    }

    const wards = await query(
      `SELECT w.id, w.local_body_id, lb.district_id
       FROM wards w
       JOIN local_bodies lb ON w.local_body_id = lb.id
       WHERE w.id = ?`,
      [ward_id]
    );

    const wardInfo = wards[0] || { local_body_id: 'lb-thoothukudi-corp', district_id: 'dist-thoothukudi' };
    const id = `comp-${Date.now()}`;
    const reference_id = `CIV-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;

    await query(
      `INSERT INTO complaints
        (id, reference_id, title, description, category_id, user_id, ward_id, district_id, local_body_id, latitude, longitude, address_text, landmark, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)`,
      [
        id,
        reference_id,
        title,
        description,
        category_id,
        user_id || 'user-citizen-anand',
        ward_id,
        wardInfo.district_id,
        wardInfo.local_body_id,
        latitude || null,
        longitude || null,
        address_text,
        landmark || null,
        priority || 'MEDIUM',
      ]
    );

    const created = await query('SELECT * FROM complaints WHERE id = ?', [id]);
    res.status(201).json({ status: 'success', data: created[0] });
  } catch (err) {
    handleDbError(res, err, 'POST /api/complaints');
  }
});

app.get('/api/complaints/:id/comments', async (req, res) => {
  try {
    const rows = await query(
      `SELECT cc.*, u.full_name AS author_name, u.role AS author_role
       FROM complaint_comments cc
       LEFT JOIN users u ON cc.user_id = u.id
       WHERE cc.complaint_id = ?
       ORDER BY cc.created_at ASC`,
      [req.params.id]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) {
    handleDbError(res, err, 'GET /api/complaints/:id/comments');
  }
});

app.post('/api/complaints/:id/comments', async (req, res) => {
  try {
    const { comment_text, user_id, ward_id } = req.body;
    if (!comment_text) {
      return res.status(400).json({ status: 'error', message: 'Comment text is required' });
    }
    const id = `comm-${Date.now()}`;
    await query(
      'INSERT INTO complaint_comments (id, complaint_id, user_id, ward_id, comment_text) VALUES (?, ?, ?, ?, ?)',
      [id, req.params.id, user_id || 'user-citizen-anand', ward_id || 'ward-43-thoothukudi', comment_text]
    );
    const created = await query('SELECT * FROM complaint_comments WHERE id = ?', [id]);
    res.status(201).json({ status: 'success', data: created[0] });
  } catch (err) {
    handleDbError(res, err, 'POST /api/complaints/:id/comments');
  }
});

// 6. Notifications & Official Contacts
app.get('/api/notifications', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20');
    res.json({ status: 'success', data: rows });
  } catch (err) {
    handleDbError(res, err, 'GET /api/notifications');
  }
});

app.get('/api/official-contacts', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM official_escalation_contacts ORDER BY portal_name ASC');
    res.json({ status: 'success', data: rows });
  } catch (err) {
    handleDbError(res, err, 'GET /api/official-contacts');
  }
});

app.get('/api/admin/official-contacts', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM official_escalation_contacts ORDER BY portal_name ASC');
    res.json({ status: 'success', data: rows });
  } catch (err) {
    handleDbError(res, err, 'GET /api/admin/official-contacts');
  }
});

// Minimal 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Minimal global error handler
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Server Error]:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

export default app;
