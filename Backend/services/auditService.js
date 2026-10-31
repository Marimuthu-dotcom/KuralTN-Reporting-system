// Backend/services/auditService.js
import { getDB, persistDB } from '../config/db.js';

export const auditService = {
  logAction({ actor_id, actor_role, action, resource_type, resource_id, ip_address, metadata }) {
    const db = getDB();
    const entry = {
      id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actor_id: actor_id || null,
      actor_role: actor_role || 'SYSTEM',
      action,
      resource_type,
      resource_id: resource_id || null,
      ip_address: ip_address || null,
      metadata_json: metadata ? JSON.stringify(metadata) : null,
      created_at: new Date().toISOString(),
    };

    db.audit_logs.unshift(entry);
    // Keep last 1000 logs
    if (db.audit_logs.length > 1000) db.audit_logs.pop();
    persistDB();
    return entry;
  },

  getAuditLogs(limit = 100) {
    const db = getDB();
    return db.audit_logs.slice(0, limit);
  },
};
