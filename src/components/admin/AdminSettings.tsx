import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { StoreSettings } from '../../types';
import {
  Settings,
  MessageCircle,
  Instagram,
  MapPin,
  FileText,
  DollarSign,
  Save,
  Check,
  Globe,
  Upload,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateStoreSettings, showToast, adminUser } = useShop();

  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const token = adminUser?.token || localStorage.getItem('pributeeq_admin_token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            image: base64Data,
            filename: file.name,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          handleChange('storeLogo', data.url);
          showToast('Store logo uploaded!', 'success');
        } else {
          handleChange('storeLogo', base64Data);
        }
      } catch (err) {
        handleChange('storeLogo', base64Data);
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateStoreSettings(formData);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Store Settings</h2>
        <p className="text-xs text-neutral-500">
          Configure store metadata, brand contact details, social links, and WhatsApp routing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Identity */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>Brand Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Brand / Store Name *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder="Pri-Buteeq"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={formData.storeTagline}
                onChange={(e) => handleChange('storeTagline', e.target.value)}
                placeholder="Contemporary Haute Couture & Luxury Pret"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Brand Description (Appears in Footer & About)
              </label>
              <textarea
                rows={2}
                value={formData.storeDescription}
                onChange={(e) => handleChange('storeDescription', e.target.value)}
                placeholder="Exclusive designer collection crafted with exceptional artisanal fabrics..."
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Store Logo (URL or Upload)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={formData.storeLogo || ''}
                  onChange={(e) => handleChange('storeLogo', e.target.value)}
                  placeholder="Paste direct image URL or upload below..."
                  className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                />
                <label className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="hidden"
                  />
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingLogo ? 'Uploading...' : 'Upload'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp & Contact Routing */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Ordering System Settings</span>
          </h3>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
            <strong>Critical Integration Note:</strong> When you update the WhatsApp number below,
            all product cards, details pages, cart checkouts, and customer inquiries will instantly
            route orders to this phone number.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Owner WhatsApp Number (with country code) *
              </label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="923001234567"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Format: 923001234567 or 03001234567 (Pakistan)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Store Location / Physical Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Pakpattan, Punjab, Pakistan"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Default: Pakpattan, Punjab, Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>Social Media Profiles</span>
          </h3>
          <p className="text-xs text-neutral-500">
            These links appear in the footer and contact sections and open in a new tab.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Instagram Profile Link
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/pributeeq"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                TikTok Profile Link
              </label>
              <input
                type="url"
                value={formData.tiktokUrl}
                onChange={(e) => handleChange('tiktokUrl', e.target.value)}
                placeholder="https://tiktok.com/@pributeeq"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Currency Display</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Default Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="PKR"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                placeholder="Rs."
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving Settings...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Store Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
