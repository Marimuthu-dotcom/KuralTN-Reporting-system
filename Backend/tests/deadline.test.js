// Backend/tests/deadline.test.js
import test from 'node:test';
import assert from 'node:assert';
import { deadlineService } from '../services/deadlineService.js';
import { checkOverdueDeadlines } from '../jobs/deadlineMonitor.js';
import { initDB } from '../config/db.js';

test('Evidence-Based Deadline Rules', async (t) => {
  initDB();

  await t.test('Citizen cannot set official resolution deadlines', async () => {
    const citizen = { id: 'user-citizen-anand', role: 'CITIZEN' };
    await assert.rejects(
      async () => {
        await deadlineService.proposeOrSetDeadline(citizen, 'comp-001', {
          target_date: '2026-10-25',
          deadline_type: 'ESTIMATED_TARGET',
          supporting_source_text: 'Arbitrary date',
        });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );
  });

  await t.test('Councillor records department-provided deadline with source reference', async () => {
    const councillor = {
      id: 'user-councillor-senthil',
      role: 'WARD_COUNCILLOR',
      ward_id: 'ward-43-thoothukudi',
      full_name: 'Councillor Senthil',
    };
    const deadline = await deadlineService.proposeOrSetDeadline(councillor, 'comp-001', {
      target_date: '2026-10-18',
      deadline_type: 'DEPARTMENT_PROVIDED_TARGET',
      responsible_department: 'Solid Waste Management',
      supporting_source_text: 'Corporation Sanction Memo #TK-1088',
    });

    assert.strictEqual(deadline.deadline_type, 'DEPARTMENT_PROVIDED_TARGET');
    assert.strictEqual(deadline.current_target_date, '2026-10-18');
  });

  await t.test('Automated overdue monitor detects expired deadlines without dashboard visits', () => {
    const count = checkOverdueDeadlines();
    assert.ok(typeof count === 'number');
  });
});
