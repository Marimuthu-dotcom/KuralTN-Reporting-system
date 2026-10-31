// Backend/tests/wardAuthorization.test.js
import test from 'node:test';
import assert from 'node:assert';
import { complaintService } from '../services/complaintService.js';
import { initDB } from '../config/db.js';

test('Ward Authorization Rules', async (t) => {
  initDB();

  await t.test('Same-ward citizen can support complaint in their ward', async () => {
    const userInWard43 = {
      id: 'user-citizen-anand',
      role: 'CITIZEN',
      ward_id: 'ward-43-thoothukudi',
      full_name: 'Anand Kumar',
    };
    // comp-001 is in Ward 43
    const result = await complaintService.supportComplaint(userInWard43, 'comp-001');
    assert.ok(typeof result.supported === 'boolean');
  });

  await t.test('Cross-ward support is rejected with 403', async () => {
    const userInWard45 = {
      id: 'user-citizen-priya',
      role: 'CITIZEN',
      ward_id: 'ward-45-thoothukudi',
      full_name: 'Priya Natarajan',
    };
    // comp-001 is in Ward 43
    await assert.rejects(
      async () => {
        await complaintService.supportComplaint(userInWard45, 'comp-001');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.match(err.message, /another ward/i);
        return true;
      }
    );
  });

  await t.test('Cross-ward comment is rejected with 403', async () => {
    const userInWard45 = {
      id: 'user-citizen-priya',
      role: 'CITIZEN',
      ward_id: 'ward-45-thoothukudi',
      full_name: 'Priya Natarajan',
    };
    await assert.rejects(
      async () => {
        await complaintService.addComment(userInWard45, 'comp-001', 'Test cross-ward comment');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );
  });
});
