'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building, Check, ImagePlus, Loader2, Mail, Phone, Shield, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getMemberById } from '@/data/mockData';

const roles = ['Caretaker', 'HOD', 'Dean', 'Faculty', 'Admin'];
const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Humanities',
  'Academic Affairs',
  'Administration',
  'Hostel Affairs',
];

interface MemberFormPageProps {
  mode: 'add' | 'edit';
  memberId?: string;
}

export function MemberFormPage({ mode, memberId }: MemberFormPageProps) {
  const member = memberId ? getMemberById(memberId) : undefined;
  const [form, setForm] = useState({
    name: member?.name ?? '',
    email: member?.email ?? '',
    role: member?.role ?? '',
    department: member?.department ?? '',
    phone: member?.phone ?? '',
  });
  const [avatarPreview, setAvatarPreview] = useState(member?.avatar ?? '');
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm({
      name: member?.name ?? '',
      email: member?.email ?? '',
      role: member?.role ?? '',
      department: member?.department ?? '',
      phone: member?.phone ?? '',
    });
    setAvatarPreview(member?.avatar ?? '');
  }, [member]);

  const validate = () => {
    const nextErrors: Partial<typeof form> = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Invalid email format';
    if (!form.role) nextErrors.role = 'Role is required';
    if (!form.department) nextErrors.department = 'Department is required';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    else if (!/^[\+\d\s-]{10,}$/.test(form.phone)) nextErrors.phone = 'Invalid phone number';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSuccess(true);
    toast.success(mode === 'edit' ? `Member "${form.name}" updated successfully` : `Member "${form.name}" added successfully`);
  };

  return (
    <div className="space-y-6 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        {mode === 'edit' && member && (
          <Link href={`/members/all/${member.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3A8A] dark:text-blue-400 mb-3">
            Back to member dashboard
          </Link>
        )}
        <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {mode === 'edit' ? `Edit ${member?.name ?? 'Member'}` : 'Add Member'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {mode === 'edit' ? 'Update the frontend member profile details.' : 'Add a new staff member to the verification system'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
              {avatarPreview ? (
                <img src={avatarPreview} alt={form.name || 'Member preview'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1E3A8A] dark:text-blue-300">
                  <UserPlus size={28} />
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white">Member Details</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {mode === 'edit' ? 'Change contact and assignment details' : 'Fill in the information below to add a new member'}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <ImagePlus size={14} className="text-[#1E3A8A]" /> Member Photo
            </label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-blue-300 dark:border-blue-700 rounded-2xl bg-blue-50/60 dark:bg-blue-900/10 text-sm text-[#1E3A8A] dark:text-blue-300 cursor-pointer hover:bg-blue-100/70 dark:hover:bg-blue-900/20 transition-colors">
              <ImagePlus size={16} />
              Upload member photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setAvatarPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <User size={14} className="text-[#1E3A8A]" /> Member Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm((prev) => ({ ...prev, name: e.target.value })); setErrors((prev) => ({ ...prev, name: undefined })); }}
              placeholder="e.g., Dr. Suresh Kumar"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Mail size={14} className="text-[#1E3A8A]" /> Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm((prev) => ({ ...prev, email: e.target.value })); setErrors((prev) => ({ ...prev, email: undefined })); }}
              placeholder="e.g., suresh.kumar@iitrpr.ac.in"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Shield size={14} className="text-[#1E3A8A]" /> Role *
            </label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setForm((prev) => ({ ...prev, role })); setErrors((prev) => ({ ...prev, role: undefined })); }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all ${form.role === role ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/20' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#1E3A8A]'}`}
                >
                  {role}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Building size={14} className="text-[#1E3A8A]" /> Department *
            </label>
            <select
              value={form.department}
              onChange={(e) => { setForm((prev) => ({ ...prev, department: e.target.value })); setErrors((prev) => ({ ...prev, department: undefined })); }}
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white appearance-none ${errors.department ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'}`}
            >
              <option value="">Select department...</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Phone size={14} className="text-[#1E3A8A]" /> Phone Number *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => { setForm((prev) => ({ ...prev, phone: e.target.value })); setErrors((prev) => ({ ...prev, phone: undefined })); }}
              placeholder="e.g., +91 98765 43210"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white ${errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving || success}
              className={`w-full flex items-center justify-center gap-2 py-3 text-white font-semibold text-sm rounded-xl transition-all shadow-lg ${success ? 'bg-green-500 shadow-green-500/20' : 'bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed'}`}
            >
              {success ? (
                <><Check size={18} className="animate-bounce" /> {mode === 'edit' ? 'Member Updated' : 'Member Added'} Successfully!</>
              ) : saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving Member...</>
              ) : (
                <><UserPlus size={16} /> {mode === 'edit' ? 'Save Member Changes' : 'Save Member'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
