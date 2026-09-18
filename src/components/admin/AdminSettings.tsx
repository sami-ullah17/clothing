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
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Eye,
  RotateCcw,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateStoreSettings, showToast, adminUser } = useShop();

  const [formData, setFormData] = useState<StoreSettings>({
    ...settings,
    whatsappNumber: settings.whatsappNumber || '923291171812',
    whatsappNumbers: Array.isArray(settings.whatsappNumbers) && settings.whatsappNumbers.length > 0
      ? [...settings.whatsappNumbers]
      : [settings.whatsappNumber || '923291171812'],
    whatsappLabels: settings.whatsappLabels || {
      '923291171812': 'Pri-Boutique Official Line',
    },
    storeLogo: settings.storeLogo || '/pributeeq_logo.jpg',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSetPrimaryNumber = (num: string) => {
    handleChange('whatsappNumber', num);
    showToast(`Set ${num} as primary WhatsApp line`, 'info');
  };

  const handleAddWhatsAppLine = () => {
    const currentList = formData.whatsappNumbers || [formData.whatsappNumber];
    const newLineNum = '';
    const updatedList = [...currentList, newLineNum];
    setFormData(prev => ({
      ...prev,
      whatsappNumbers: updatedList,
      whatsappLabels: {
        ...(prev.whatsappLabels || {}),
        [newLineNum]: `Pri-Boutique Line ${updatedList.length}`,
      },
    }));
  };

  const handleUpdateWhatsAppLine = (index: number, newNumber: string, newLabel?: string) => {
    const currentList = [...(formData.whatsappNumbers || [formData.whatsappNumber])];
    const oldNum = currentList[index];
    currentList[index] = newNumber;

    const labels = { ...(formData.whatsappLabels || {}) };
    if (newLabel !== undefined) {
      labels[newNumber] = newLabel;
    } else if (labels[oldNum]) {
      labels[newNumber] = labels[oldNum];
      if (oldNum !== newNumber) delete labels[oldNum];
    }

    setFormData(prev => ({
      ...prev,
      whatsappNumbers: currentList,
      whatsappLabels: labels,
      whatsappNumber: index === 0 ? newNumber : prev.whatsappNumber,
    }));
  };

  const handleRemoveWhatsAppLine = (index: number) => {
    const currentList = [...(formData.whatsappNumbers || [formData.whatsappNumber])];
    if (currentList.length <= 1) {
      showToast('You must keep at least one active WhatsApp number for store orders.', 'error');
      return;
    }
    const removedNum = currentList[index];
    currentList.splice(index, 1);

    const labels = { ...(formData.whatsappLabels || {}) };
    delete labels[removedNum];

    setFormData(prev => ({
      ...prev,
      whatsappNumbers: currentList,
      whatsappLabels: labels,
      whatsappNumber: prev.whatsappNumber === removedNum ? currentList[0] : prev.whatsappNumber,
    }));
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
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            handleChange('storeLogo', data.url || base64Data);
            showToast('Store logo uploaded!', 'success');
          } else {
            handleChange('storeLogo', base64Data);
            showToast('Store logo updated!', 'success');
          }
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
                placeholder="Pri-Boutique"
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
                Brand Logo (Pri-Boutique Luxury Insignia)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-400/40 bg-neutral-950 flex-shrink-0 flex items-center justify-center shadow-md">
                  {formData.storeLogo ? (
                    <img
                      src={formData.storeLogo}
                      alt="Pri-Boutique Logo Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif-luxury text-amber-300 font-bold text-lg">PB</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.storeLogo || ''}
                      onChange={(e) => handleChange('storeLogo', e.target.value)}
                      placeholder="/pributeeq_logo.jpg"
                      className="flex-1 px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                    <label className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
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

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('storeLogo', '/pributeeq_logo.jpg');
                        showToast('Applied Pri-Boutique luxury designed logo!', 'success');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Apply Pri-Boutique Luxury Logo</span>
                    </button>
                    <span className="text-[11px] text-neutral-400">
                      High-resolution embroidery & gold crest designed for Pri-Boutique
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp & Contact Routing */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Ordering & Number Management</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage one or multiple boutique WhatsApp numbers for receiving customer orders
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleChange('whatsappNumber', '03291171812');
                handleUpdateWhatsAppLine(0, '03291171812', 'Pri-Boutique Official Line');
                showToast('Set primary number to 03291171812!', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>Set to 03291171812 (Pri-Boutique)</span>
            </button>
          </div>

          {/* Privacy & Masking Guarantee Notice */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <strong className="block font-bold">
                Customer Privacy & Number Masking Active:
              </strong>
              <p className="leading-relaxed text-emerald-900">
                Customers <strong>never see your raw phone number digits</strong> in the store. Instead,
                they see <strong>"Pri-Boutique"</strong> or your custom boutique desk name. When they click
                to place an order, it routes directly to the WhatsApp account specified below.
              </p>
            </div>
          </div>

          {/* Multiple Numbers List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Configured WhatsApp Lines ({formData.whatsappNumbers?.length || 1})
              </label>
              <button
                type="button"
                onClick={handleAddWhatsAppLine}
                className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Line</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(formData.whatsappNumbers || [formData.whatsappNumber]).map((num, idx) => {
                const clean = num.replace(/\D/g, '');
                const isPrimary = formData.whatsappNumber === num || (idx === 0 && !formData.whatsappNumber);
                const currentLabel = formData.whatsappLabels?.[num] || (idx === 0 ? 'Pri-Boutique Official Line' : `Pri-Boutique Line ${idx + 1}`);

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isPrimary
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-neutral-200 bg-neutral-50/80'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                          Phone / WhatsApp Number
                        </label>
                        <div className="relative">
                          <PhoneCall className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={num}
                            onChange={(e) => handleUpdateWhatsAppLine(idx, e.target.value)}
                            placeholder="03291171812 or 923291171812"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                          Customer-Facing Display Label
                        </label>
                        <input
                          type="text"
                          value={currentLabel}
                          onChange={(e) => handleUpdateWhatsAppLine(idx, num, e.target.value)}
                          placeholder="Pri-Boutique Official Line"
                          className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-end gap-2 pt-2 sm:pt-4">
                        {isPrimary ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold">
                            <Check className="w-3 h-3" />
                            <span>Primary Line</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryNumber(num)}
                            className="px-2.5 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-[11px] font-medium"
                          >
                            Set Primary
                          </button>
                        )}

                        {(formData.whatsappNumbers?.length || 1) > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWhatsAppLine(idx)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            aria-label="Remove line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-500">
              Format: 03291171812 or 923291171812. The owner can add multiple numbers for branch desks or customer support.
            </p>
          </div>

          {/* Boutique Physical Address */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Boutique Location / Physical Address *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Pakpattan, Punjab, Pakistan"
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Default: Pakpattan, Punjab, Pakistan
            </p>
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
