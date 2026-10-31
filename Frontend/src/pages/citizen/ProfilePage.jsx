// Frontend/src/pages/citizen/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Avatar } from '../../components/common/Avatar';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, MapPin, Building, Mail, Phone } from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line: user?.address_line || '',
    pincode: user?.pincode || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    try {
      const updated = await userService.updateProfile(formData);
      updateUser(updated);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: 'User Profile' }]} />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Avatar src={user?.avatar_url} name={user?.full_name} size="xl" />
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-xl font-bold text-[#171717]">{user?.full_name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge variant="primary">{user?.role?.replace(/_/g, ' ')}</Badge>
              {user?.is_ward_verified && (
                <Badge variant="success">Ward Resident Verified</Badge>
              )}
            </div>
            <p className="text-xs text-[#737373]">{user?.email}</p>
          </div>
        </div>

        {/* Registered Ward Card */}
        <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#F97316]">
            <Building className="w-4 h-4" />
            <span>Ward Jurisdiction Assignment</span>
          </div>
          <div className="font-semibold text-[#171717]">
            {user?.ward_name || `Ward ID: ${user?.ward_id || 'Not Assigned'}`}
          </div>
          <div className="text-[#737373]">
            Door No. / Address: {user?.address_line || 'Unspecified'} &bull; PIN: {user?.pincode || 'Tamil Nadu'}
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-200 text-[#15803D] rounded-lg text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
            Edit Contact Details
          </h3>

          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>

          <Input
            label="Street Address"
            value={formData.address_line}
            onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Save Profile Updates
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
