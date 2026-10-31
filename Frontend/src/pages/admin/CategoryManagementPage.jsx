// Frontend/src/pages/admin/CategoryManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PlusCircle, FileText } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', estimated_sla_days: 7, default_priority: 'MEDIUM' });

  const loadCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    try {
      await adminService.addCategory(newCat);
      setNewCat({ name: '', estimated_sla_days: 7, default_priority: 'MEDIUM' });
      setShowAddForm(false);
      await loadCategories();
      alert('Category created successfully!');
    } catch (err) {
      alert('Failed to add category');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Complaint Categories' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717]">Grievance Categories & SLA Windows</h1>
          <p className="text-xs text-[#737373] mt-1">
            Standard civic classifications and estimated Citizen Charter resolution targets
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel Form' : 'Add New Category'}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <Input
            label="Category Name"
            required
            placeholder="e.g. Park Maintenance & Green Cover"
            value={newCat.name}
            onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated SLA (Days)"
              type="number"
              value={newCat.estimated_sla_days}
              onChange={(e) => setNewCat({ ...newCat, estimated_sla_days: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
                Default Severity
              </label>
              <select
                value={newCat.default_priority}
                onChange={(e) => setNewCat({ ...newCat, default_priority: e.target.value })}
                className="w-full text-sm rounded-lg border border-[#E7E5E4] p-2.5 bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Category
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="xs">{c.default_priority}</Badge>
              <span className="text-xs font-bold text-[#15803D]">~{c.estimated_sla_days} Days SLA</span>
            </div>
            <h3 className="text-sm font-bold text-[#171717]">{c.name}</h3>
            <p className="text-xs text-[#737373]">{c.description || 'Standard municipal category'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
