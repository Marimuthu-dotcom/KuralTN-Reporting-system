// Backend/repositories/complaintRepository.js
import { getDB, persistDB } from '../config/db.js';

export const complaintRepository = {
  findAll({
    district_id,
    local_body_id,
    ward_id,
    category_id,
    department_id,
    status,
    councillor_verified,
    department_received,
    search,
    sortBy = 'newest',
    page = 1,
    limit = 10,
  } = {}) {
    const db = getDB();
    let list = [...db.complaints];

    if (district_id) {
      list = list.filter((c) => c.district_id === district_id);
    }
    if (local_body_id) {
      list = list.filter((c) => c.local_body_id === local_body_id);
    }
    if (ward_id) {
      list = list.filter((c) => c.ward_id === ward_id);
    }
    if (category_id) {
      list = list.filter((c) => c.category_id === category_id);
    }
    if (department_id) {
      list = list.filter((c) => {
        if (c.department_id && c.department_id === department_id) return true;
        const dept = (db.departments || []).find((d) => d.id === department_id);
        return dept && dept.category_ids && dept.category_ids.includes(c.category_id);
      });
    }
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    if (councillor_verified !== undefined && councillor_verified !== null && councillor_verified !== '') {
      const isVerified = String(councillor_verified) === 'true';
      list = list.filter((c) => Boolean(c.councillor_verified) === isVerified);
    }
    if (department_received !== undefined && department_received !== null && department_received !== '') {
      const isReceived = String(department_received) === 'true';
      list = list.filter((c) => Boolean(c.department_received) === isReceived);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.reference_id || '').toLowerCase().includes(q) ||
          (c.address_text || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'most_supported') {
      list.sort((a, b) => (b.supports_count || 0) - (a.supports_count || 0));
    } else if (sortBy === 'most_commented') {
      list.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
    } else if (sortBy === 'recently_updated') {
      list.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paged = list.slice(startIndex, startIndex + limit);

    // Enrich
    const enriched = paged.map((c) => this.enrichComplaint(c, db));

    return { complaints: enriched, total };
  },

  findById(id) {
    const db = getDB();
    const c = db.complaints.find((x) => x.id === id || x.reference_id === id);
    if (!c) return null;
    return this.enrichComplaint(c, db, true);
  },

  enrichComplaint(c, db, includeRelations = false) {
    const category = db.categories.find((cat) => cat.id === c.category_id) || {};
    const ward = db.wards.find((w) => w.id === c.ward_id) || {};
    const localBody = db.local_bodies.find((lb) => lb.id === c.local_body_id) || {};
    const district = db.districts.find((d) => d.id === c.district_id) || {};
    const reporter = db.users.find((u) => u.id === c.user_id) || {};
    const images = db.complaint_images.filter((img) => img.complaint_id === c.id);
    const deadline = db.complaint_deadlines.find((d) => d.complaint_id === c.id && d.is_active);

    const department = (db.departments || []).find(
      (d) => d.id === c.department_id || (d.category_ids && d.category_ids.includes(c.category_id))
    ) || (db.departments || []).find((d) => d.id === 'dept-revenue') || null;

    const base = {
      ...c,
      category_name: category.name,
      category_icon: category.icon_name,
      ward_name: ward.ward_name,
      ward_number: ward.ward_number,
      councillor_name: ward.councillor_name,
      local_body_name: localBody.name,
      district_name: district.name,
      reporter_name: reporter.full_name,
      reporter_avatar: reporter.avatar_url,
      images,
      active_deadline: deadline || null,
      councillor_verified: Boolean(c.councillor_verified),
      councillor_verified_at: c.councillor_verified_at || null,
      councillor_notes: c.councillor_notes || null,
      councillor_user_id: c.councillor_user_id || null,
      department_received: Boolean(c.department_received),
      department_received_at: c.department_received_at || null,
      department_id: department ? department.id : c.department_id || null,
      department_name: department ? department.name : 'Municipal Administration',
      department_name_ta: department ? department.name_ta : 'நகராட்சி நிர்வாகம்',
      department_code: department ? department.code : 'MUNI',
      department: department
        ? {
            id: department.id,
            name: department.name,
            name_ta: department.name_ta,
            code: department.code,
            head_officer: department.head_officer,
            contact_phone: department.contact_phone,
            emergency_helpline: department.emergency_helpline,
            sla_standard_days: department.sla_standard_days,
            icon_name: department.icon_name,
          }
        : null,
    };

    if (includeRelations) {
      base.status_history = db.complaint_status_history
        .filter((sh) => sh.complaint_id === c.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      base.resolution_evidence = db.complaint_resolution_evidence.filter(
        (re) => re.complaint_id === c.id
      );

      base.official_updates = db.complaint_official_updates
        .filter((ou) => ou.complaint_id === c.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      base.deadline_history = db.complaint_deadline_history
        .filter((dh) => dh.complaint_id === c.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return base;
  },

  create(complaintData, images = []) {
    const db = getDB();
    
    // Idempotency duplicate submission guard: Return existing complaint if client_submission_id matches
    if (complaintData.client_submission_id) {
      const existing = db.complaints.find((c) => c.client_submission_id === complaintData.client_submission_id);
      if (existing) {
        return this.enrichComplaint(existing, db, true);
      }
    }

    const now = new Date().toISOString();
    const id = complaintData.id || `comp-${Date.now()}`;

    const dept = (db.departments || []).find(
      (d) => d.id === complaintData.department_id || (d.category_ids && d.category_ids.includes(complaintData.category_id))
    );

    const newComplaint = {
      id,
      client_submission_id: complaintData.client_submission_id || null,
      reference_id: complaintData.reference_id,
      title: complaintData.title,
      description: complaintData.description,
      category_id: complaintData.category_id,
      department_id: dept ? dept.id : complaintData.department_id || null,
      user_id: complaintData.user_id,
      ward_id: complaintData.ward_id,
      district_id: complaintData.district_id,
      local_body_id: complaintData.local_body_id,
      latitude: complaintData.latitude || null,
      longitude: complaintData.longitude || null,
      address_text: complaintData.address_text,
      landmark: complaintData.landmark || null,
      status: 'Pending Councillor Verification',
      councillor_verified: false,
      councillor_verified_at: null,
      councillor_notes: null,
      councillor_user_id: null,
      department_received: false,
      department_received_at: null,
      deadline_condition: 'NOT_APPLICABLE',
      verification_state: 'PENDING_PROPOSAL',
      priority: complaintData.priority || 'MEDIUM',
      supports_count: 0,
      comments_count: 0,
      is_public: true,
      created_at: now,
      updated_at: now,
    };

    db.complaints.unshift(newComplaint);

    // Initial status history
    db.complaint_status_history.push({
      id: `sh-${Date.now()}`,
      complaint_id: id,
      previous_status: null,
      new_status: 'Pending Councillor Verification',
      actor_id: complaintData.user_id,
      actor_role: 'CITIZEN',
      actor_name: complaintData.reporter_name || 'Citizen Reporter',
      reason: 'Grievance submitted by citizen. Sent to elected Ward Councillor for field verification and accountability proceed.',
      update_source: 'CITIZEN',
      created_at: now,
    });

    // Images
    images.forEach((img, idx) => {
      db.complaint_images.push({
        id: `img-${Date.now()}-${idx}`,
        complaint_id: id,
        image_url: img.url,
        caption: img.caption || 'Supporting photograph',
        is_primary: idx === 0,
        created_at: now,
      });
    });

    persistDB();
    return this.findById(id);
  },

  update(id, updates) {
    const db = getDB();
    const idx = db.complaints.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    db.complaints[idx] = {
      ...db.complaints[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    persistDB();
    return this.findById(id);
  },

  countAll() {
    return getDB().complaints.length;
  },

  findBySubmissionId(submissionId) {
    if (!submissionId) return null;
    const db = getDB();
    const c = db.complaints.find(
      (x) => x.client_submission_id === submissionId || x.id === submissionId || x.reference_id === submissionId
    );
    if (!c) return null;
    return this.enrichComplaint(c, db, true);
  },
};
