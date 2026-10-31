import React, { useState, useEffect } from 'react';
import { Upload, X, MapPin, AlertCircle, Camera } from 'lucide-react';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useWard } from '../../hooks/useWard';
import { useLanguage } from '../../hooks/useLanguage';
import { departmentService } from '../../services/departmentService';
import { AnimatedCamera, AnimatedPin, AnimatedShield } from '../common/AnimatedIcons';

export function ComplaintForm({ onSubmit, isLoading = false, defaultWardId }) {
  const { wards, categories } = useWard();
  const { t, getCategoryTitle, isTamil } = useLanguage();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentService.getDepartments()
      .then((data) => setDepartments(data || []))
      .catch((err) => console.error('Failed to load departments in form:', err));
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    ward_id: defaultWardId || '',
    address_text: '',
    landmark: '',
    priority: 'MEDIUM',
    latitude: '',
    longitude: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const selectedDept = departments.find(
    (d) => d.category_ids && d.category_ids.includes(formData.category_id)
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      alert(isTamil ? 'அதிகபட்சம் 5 புகைப்படங்கள் மட்டுமே பதிவேற்றலாம்.' : 'You can upload up to 5 photographs.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setFilePreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.category_id) {
      newErrors.category_id = isTamil ? 'பிரச்சனை வகையைத் தேர்ந்தெடுக்கவும்' : 'Please select a grievance category';
    }
    if (!formData.ward_id) {
      newErrors.ward_id = isTamil ? 'பாதிக்கப்பட்ட வார்டைத் தேர்ந்தெடுக்கவும்' : 'Please select the affected ward';
    }
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      newErrors.title = isTamil ? 'தலைப்பு குறைந்தது 5 எழுத்துகள் இருக்க வேண்டும்' : 'Title must be at least 5 characters';
    }
    if (!formData.description.trim() || formData.description.trim().length < 15) {
      newErrors.description = isTamil ? 'பிரச்சனையை விரிவாக விளக்குங்கள் (குறைந்தது 15 எழுத்துகள்)' : 'Please provide detailed description (at least 15 characters)';
    }
    if (!formData.address_text.trim() || formData.address_text.trim().length < 5) {
      newErrors.address_text = isTamil ? 'தெரு அல்லது இடத்தின் முகவரி தேவை' : 'Specific street address is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        data.append(key, val);
      }
    });

    selectedFiles.forEach((file) => {
      data.append('images', file);
    });

    onSubmit(data);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(isTamil ? 'உங்கள் பிரவுசரில் ஜி.பி.எஸ் வசதி இல்லை.' : 'Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleInputChange('latitude', pos.coords.latitude.toFixed(6));
        handleInputChange('longitude', pos.coords.longitude.toFixed(6));
        alert(isTamil ? 'ஜி.பி.எஸ் இருப்பிடம் தானாகக் கண்டறியப்பட்டது!' : 'GPS coordinates captured successfully!');
      },
      () => {
        handleInputChange('latitude', '8.804210');
        handleInputChange('longitude', '78.134800');
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Quick Pills */}
      <div>
        <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-2">
          {t('selectCategory')} <span className="text-[#B91C1C]">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-2">
          {categories.map((c) => {
            const isSelected = formData.category_id === c.id;
            const title = getCategoryTitle(c.id, c.name);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleInputChange('category_id', c.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#F97316] bg-orange-50 text-[#F97316] ring-2 ring-[#F97316]/20 font-bold shadow-xs'
                    : 'border-[#E7E5E4] bg-white text-[#171717] hover:bg-neutral-50'
                }`}
              >
                <span className="text-xs leading-snug line-clamp-2">{title}</span>
                <span className="text-[10px] text-[#737373] mt-1">~{c.estimated_sla_days} {isTamil ? 'நாள்' : 'days'}</span>
              </button>
            );
          })}
        </div>
        {errors.category_id && <p className="text-xs text-[#B91C1C] font-semibold">{errors.category_id}</p>}

        {/* Civic Middleware Routing Preview */}
        {selectedDept && (
          <div className="mt-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg shrink-0">🛡️</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-800">
                    {isTamil ? 'அமைப்பின் வழித்தடம் (Civic Middleware):' : 'Civic Governance Routing:'}
                  </span>
                  <span className="font-bold text-[#171717] truncate">
                    {isTamil ? 'கவுன்சிலர் சரிபார்ப்பு ➔ துறைக்கு அனுப்புதல்' : 'Councillor Verification ➔ Department Proceed'}
                  </span>
                </div>
                <div className="text-[11px] text-[#737373] mt-0.5">
                  {isTamil
                    ? `உங்கள் வார்டு கவுன்சிலர் சரிபார்த்து "Proceed" பொத்தானை அழுத்திய பிறகே இப்புகார் ${selectedDept.name_ta}-க்கு அனுப்பப்படும்.`
                    : `Grievance will be routed to your Ward Councillor first for verification, who will click "Proceed" to transmit to ${selectedDept.name}.`}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-amber-900 border border-amber-300">
                Target: {selectedDept.code}
              </span>
              <div className="text-[10px] text-[#15803D] font-bold mt-0.5">
                SLA: ~{selectedDept.sla_standard_days} {isTamil ? 'நாட்கள்' : 'Days'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ward Selection */}
      <Select
        label={t('selectWard')}
        required
        placeholder={isTamil ? 'வார்டைத் தேர்வு செய்க' : 'Select ward'}
        value={formData.ward_id}
        options={wards.map((w) => ({
          value: w.id,
          label: `${w.ward_name} (Ward ${w.ward_number}) - ${w.district_name}`,
        }))}
        onChange={(e) => handleInputChange('ward_id', e.target.value)}
        error={errors.ward_id}
      />

      {/* Title */}
      <Input
        label={t('problemTitle')}
        required
        placeholder={t('problemTitlePlaceholder')}
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={errors.title}
      />

      {/* Description */}
      <Textarea
        label={t('problemDesc')}
        required
        rows={3}
        placeholder={t('problemDescPlaceholder')}
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={errors.description}
      />

      {/* Address & Landmark */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('streetAddress')}
          required
          placeholder={t('streetAddressPlaceholder')}
          value={formData.address_text}
          onChange={(e) => handleInputChange('address_text', e.target.value)}
          error={errors.address_text}
        />

        <Input
          label={t('landmark')}
          placeholder={t('landmarkPlaceholder')}
          value={formData.landmark}
          onChange={(e) => handleInputChange('landmark', e.target.value)}
        />
      </div>

      {/* GPS Location & Map button */}
      <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#171717]">
            <AnimatedPin className="w-4 h-4 text-[#F97316]" />
            <span>{t('gpsCoordinates')}</span>
          </div>
          <button
            type="button"
            onClick={handleDetectLocation}
            className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('detectGps')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Latitude (e.g. 8.804210)"
            value={formData.latitude}
            onChange={(e) => handleInputChange('latitude', e.target.value)}
          />
          <Input
            placeholder="Longitude (e.g. 78.134800)"
            value={formData.longitude}
            onChange={(e) => handleInputChange('longitude', e.target.value)}
          />
        </div>
      </div>

      {/* Photo attachments with Big Tap Area & Animated Camera */}
      <div>
        <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-2">
          {t('uploadPhotos')}
        </label>

        <div className="border-2 border-dashed border-[#E7E5E4] rounded-2xl p-6 text-center hover:border-[#F97316] hover:bg-orange-50/20 transition-all cursor-pointer">
          <input
            type="file"
            id="complaint-images-input"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="complaint-images-input" className="cursor-pointer block">
            <AnimatedCamera className="mx-auto w-10 h-10 text-[#F97316] mb-2" />
            <p className="text-sm font-bold text-[#171717]">
              {t('clickToUpload')}
            </p>
            <p className="text-xs text-[#737373] mt-1">
              {t('uploadHint')}
            </p>
          </label>
        </div>

        {filePreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
            {filePreviews.map((src, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-[#E7E5E4] aspect-square group bg-neutral-100"
              >
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute top-1 right-1 p-1 bg-neutral-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Governance Notice */}
      <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-[#171717] flex items-start gap-2.5">
        <AnimatedShield className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('governanceNotice')}
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto text-base py-3 px-8 shadow-sm"
          isLoading={isLoading}
        >
          {t('submitGrievanceBtn')}
        </Button>
      </div>
    </form>
  );
}
