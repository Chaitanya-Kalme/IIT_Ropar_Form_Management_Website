'use client';

import React, { useState } from 'react';
import { UserPlus, Loader2, Check, User, Mail, Phone, Building, Shield } from 'lucide-react';
import { toast } from 'sonner';

const roles = ['Caretaker', 'HOD', 'Dean', 'Faculty', 'Admin'];
const departments = [
  'Computer Science & Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Humanities & Social Sciences',
  'Academic Affairs',
  'Administration',
  'Hostel Affairs',
];

export default function AddMemberPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.role) newErrors.role = 'Role is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[\+\d\s-]{10,}$/.test(form.phone)) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setSaving(false);
    setSuccess(true);
    toast.success(`Member "${form.name}" added successfully!`);
    setTimeout(() => {
      setSuccess(false);
      setForm({ name: '', email: '', role: '', department: '', phone: '' });
      setErrors({});
    }, 2000);
  };

  const roleColors: Record<string, string> = {
    Caretaker: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300',
    HOD: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300',
    Dean: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300',
    Faculty: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300',
    Admin: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300',
  };

  return (
    <div className="space-y-6 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Add Member</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add a new staff member to the verification system</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] flex items-center justify-center">
            <UserPlus size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white">New Member Details</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in the information below to add a new member</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <User size={14} className="text-[#1E3A8A]" /> Member Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
              placeholder="e.g., Dr. Suresh Kumar"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white ${
                errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Mail size={14} className="text-[#1E3A8A]" /> Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: undefined })); }}
              placeholder="e.g., suresh.kumar@iitrpr.ac.in"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white ${
                errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Shield size={14} className="text-[#1E3A8A]" /> Role *
            </label>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setForm(p => ({ ...p, role })); setErrors(p => ({ ...p, role: undefined })); }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                    form.role === role
                      ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/20'
                      : roleColors[role] || 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#1E3A8A]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          {/* Department */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Building size={14} className="text-[#1E3A8A]" /> Department *
            </label>
            <select
              value={form.department}
              onChange={(e) => { setForm(p => ({ ...p, department: e.target.value })); setErrors(p => ({ ...p, department: undefined })); }}
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white appearance-none ${
                errors.department ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
              }`}
            >
              <option value="">Select department...</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Phone size={14} className="text-[#1E3A8A]" /> Phone Number *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: undefined })); }}
              placeholder="e.g., +91 98765 43210"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800 dark:text-white ${
                errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving || success}
              className={`w-full flex items-center justify-center gap-2 py-3 text-white font-semibold text-sm rounded-xl transition-all shadow-lg ${
                success
                  ? 'bg-green-500 shadow-green-500/20'
                  : 'bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed'
              }`}
            >
              {success ? (
                <><Check size={18} className="animate-bounce" /> Member Added Successfully!</>
              ) : saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving Member...</>
              ) : (
                <><UserPlus size={16} /> Save Member</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
