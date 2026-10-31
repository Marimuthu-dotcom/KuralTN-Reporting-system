// Backend/tests/accountability.test.js
import test from 'node:test';
import assert from 'node:assert';
import { accountabilityService } from '../services/accountabilityService.js';
import { complaintRepository } from '../repositories/complaintRepository.js';
import { initDB } from '../config/db.js';

test('Confidential Accountability Report Security', async (t) => {
  initDB();

  await t.test('Confidential reports never leak in public complaint feeds', () => {
    const { complaints } = complaintRepository.findAll();
    const hasAccountability = complaints.some((c) => c.reference_id?.startsWith('ACC-'));
    assert.strictEqual(hasAccountability, false);
  });

  await t.test('The reported councillor is strictly blocked from accessing the report', async () => {
    // acc-001 has reported_councillor_user_id = 'user-councillor-subramanian'
    const reportedCouncillor = {
      id: 'user-councillor-subramanian',
      role: 'WARD_COUNCILLOR',
    };

    await assert.rejects(
      async () => {
        await accountabilityService.getCaseDetails('acc-001', reportedCouncillor);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.match(err.message, /conflict of interest/i);
        return true;
      }
    );
  });

  await t.test('Authorized Independent Reviewer can retrieve case details and evidence', async () => {
    const reviewer = {
      id: 'user-reviewer-kalyani',
      role: 'ACCOUNTABILITY_REVIEWER',
    };
    const caseData = await accountabilityService.getCaseDetails('acc-001', reviewer);
    assert.strictEqual(caseData.case_reference_id, 'ACC-2026-00012');
    assert.ok(Array.isArray(caseData.history));
  });
});
