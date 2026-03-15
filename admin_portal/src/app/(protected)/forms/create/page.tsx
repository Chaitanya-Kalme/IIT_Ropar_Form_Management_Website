'use client';

import React, { useState } from 'react';
import {
  GripVertical, Edit2, Trash2, Plus, X, ChevronUp, ChevronDown,
  FileText, Hash, Phone, Mail, MapPin, Building, BookOpen, Calendar,
  Upload, CheckSquare, Circle, List, Type, AlignLeft, Settings,
  Eye, Code, Zap, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import styles from '@/styles/CreateFormPage.module.css';

type FieldType = 'text' | 'number' | 'date' | 'file' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'email' | 'tel';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  isCustom?: boolean;
}

interface VerifierLevel {
  id: string;
  role: string;
}

const QUICK_FIELDS: { label: string; type: FieldType; icon: React.ReactNode; placeholder?: string }[] = [
  { label: 'Name', type: 'text', icon: <FileText size={14} />, placeholder: 'Enter full name' },
  { label: 'Age', type: 'number', icon: <Hash size={14} />, placeholder: 'Enter age' },
  { label: 'Mobile', type: 'tel', icon: <Phone size={14} />, placeholder: 'Enter mobile number' },
  { label: 'Email', type: 'email', icon: <Mail size={14} />, placeholder: 'Enter email address' },
  { label: 'Address', type: 'textarea', icon: <MapPin size={14} />, placeholder: 'Enter full address' },
  { label: 'Department', type: 'text', icon: <Building size={14} />, placeholder: 'Enter department' },
  { label: 'Roll Number', type: 'text', icon: <BookOpen size={14} />, placeholder: 'Enter roll number' },
];

const VERIFIER_ROLES = ['Caretaker', 'HOD', 'Dean', 'Faculty', 'Admin'];

const fieldTypeOptions: { value: FieldType; label: string; icon: React.ReactNode }[] = [
  { value: 'text', label: 'Text', icon: <Type size={14} /> },
  { value: 'number', label: 'Number', icon: <Hash size={14} /> },
  { value: 'date', label: 'Date', icon: <Calendar size={14} /> },
  { value: 'file', label: 'File Upload', icon: <Upload size={14} /> },
  { value: 'checkbox', label: 'Checkbox', icon: <CheckSquare size={14} /> },
  { value: 'radio', label: 'Radio', icon: <Circle size={14} /> },
  { value: 'select', label: 'Select / Dropdown', icon: <List size={14} /> },
  { value: 'textarea', label: 'Textarea', icon: <AlignLeft size={14} /> },
  { value: 'email', label: 'Email', icon: <Mail size={14} /> },
  { value: 'tel', label: 'Phone', icon: <Phone size={14} /> },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

interface CustomFieldFormProps {
  onAdd: (field: FormField) => void;
  onCancel: () => void;
}

function CustomFieldForm({ onAdd, onCancel }: CustomFieldFormProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [required, setRequired] = useState(false);

  const needsOptions = ['checkbox', 'radio', 'select'].includes(type);

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleAdd = () => {
    if (!label.trim()) {
      toast.error('Field label is required');
      return;
    }
    if (needsOptions && options.length === 0) {
      toast.error('Please add at least one option');
      return;
    }
    onAdd({
      id: generateId(),
      label: label.trim(),
      type,
      required,
      options: needsOptions ? options : undefined,
      isCustom: true,
    });
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-semibold text-[#1E3A8A] dark:text-blue-300 flex items-center gap-2">
        <Zap size={14} /> Add Custom Field
      </h4>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Field Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Passport No., CGPA..."
          className={styles.input}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Input Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {fieldTypeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`${styles.typeSelector} ${type === opt.value ? styles.typeSelectorActive : ''}`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {needsOptions && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Options</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOption()}
              placeholder="Type option name..."
              className={styles.input}
            />
            <button
              onClick={addOption}
              className="w-8 h-8 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center hover:bg-[#1e3a8a]/90 flex-shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt, i) => (
              <span key={i} className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                {opt}
                <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="checkbox" id="required" checked={required} onChange={e => setRequired(e.target.checked)} className="w-3.5 h-3.5" />
        <label htmlFor="required" className="text-xs text-gray-600 dark:text-gray-400">Required field</label>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleAdd}
          className="flex-1 py-2 bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3a8a]/90 transition-colors cursor-pointer"
        >
          Add to Form
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-xs text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CreateFormPage() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [verifiers, setVerifiers] = useState<VerifierLevel[]>([]);
  const [customVerifierInput, setCustomVerifierInput] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const addedLabels = new Set(fields.map(f => f.label));

  const addQuickField = (qf: typeof QUICK_FIELDS[0]) => {
    if (addedLabels.has(qf.label)) return;
    setFields(prev => [...prev, {
      id: generateId(),
      label: qf.label,
      type: qf.type,
      required: true,
      placeholder: qf.placeholder,
    }]);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const moveField = (idx: number, dir: 'up' | 'down') => {
    const newFields = [...fields];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= newFields.length) return;
    [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]];
    setFields(newFields);
  };

  const addVerifier = (role: string) => {
    if (verifiers.some(v => v.role === role)) {
      toast.error(`${role} already added as a verifier`);
      return;
    }
    setVerifiers(prev => [...prev, { id: generateId(), role }]);
  };

  const addCustomVerifier = () => {
    const customRole = customVerifierInput.trim();
    if (!customRole) {
      toast.error('Please enter a verifier name');
      return;
    }
    if (verifiers.some(v => v.role.toLowerCase() === customRole.toLowerCase())) {
      toast.error(`${customRole} already added as a verifier`);
      return;
    }
    setVerifiers(prev => [...prev, { id: generateId(), role: customRole }]);
    setCustomVerifierInput('');
    toast.success(`${customRole} added as verifier`);
  };

  const removeVerifier = (id: string) => {
    setVerifiers(prev => prev.filter(v => v.id !== id));
  };

  const handlePublish = async () => {
    if (!formTitle.trim()) { toast.error('Form title is required'); return; }
    if (fields.length === 0) { toast.error('Please add at least one field'); return; }
    if (verifiers.length === 0) { toast.error('Please add at least one verifier'); return; }
    setPublishing(true);
    await new Promise(r => setTimeout(r, 1500));
    setPublishing(false);
    toast.success('Form published successfully!');
    setFields([]);
    setFormTitle('');
    setFormDescription('');
    setDeadline('');
    setVerifiers([]);
  };

  const getFieldIcon = (type: FieldType) => {
    const icons: Record<FieldType, React.ReactNode> = {
      text: <Type size={12} />, number: <Hash size={12} />, date: <Calendar size={12} />,
      file: <Upload size={12} />, checkbox: <CheckSquare size={12} />, radio: <Circle size={12} />,
      select: <List size={12} />, textarea: <AlignLeft size={12} />, email: <Mail size={12} />, tel: <Phone size={12} />,
    };
    return icons[type] || <Type size={12} />;
  };

  const availableVerifiers = VERIFIER_ROLES.filter(r => !verifiers.some(v => v.role === r));

  return (
      <div className={`space-y-6 ${styles.page}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className={styles.pageHeader}>
        <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Create Form</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Build a new form with custom fields and verification flow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Toolbox */}
        <div className="lg:col-span-6 space-y-6">
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Quick Add Fields</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 mb-5">Click to add common fields</p>
            <div className="flex flex-wrap gap-3">
              {QUICK_FIELDS.map((qf) => {
                const added = addedLabels.has(qf.label);
                return (
                  <button
                    key={qf.label}
                    onClick={() => addQuickField(qf)}
                    disabled={added}
                    className={`${styles.quickChip} ${added ? styles.quickChipAdded : ''}`}
                  >
                    {qf.icon} {qf.label}
                    {added && <span className="text-green-500 ml-0.5">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Field */}
          <div className={styles.card}>
            <h3 className={`${styles.sectionTitle} mb-5`}>Custom Field</h3>
            {showCustomForm ? (
              <CustomFieldForm
                onAdd={(field) => { setFields(prev => [...prev, field]); setShowCustomForm(false); toast.success(`"${field.label}" field added`); }}
                onCancel={() => setShowCustomForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowCustomForm(true)}
                className={styles.addFieldBtn}
              >
                <Plus size={16} /> Add Custom Field
              </button>
            )}
          </div>

          {/* JSON Schema note */}
           {/* Metadata */}
          <div className={styles.card}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <Settings size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={styles.sectionTitle}>Form Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Form Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Hostel Leave Application"
                  className={styles.input}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of the form..."
                  className={styles.input}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Form Status</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isActive ? 'Active – accepting submissions' : 'Draft – not visible to users'}</p>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${isActive ? 'bg-[#22C55E]' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Verification Flow */}
          <div className={styles.card}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg">
                <Zap size={20} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className={styles.sectionTitle}>Verification Flow</h3>
            </div>

            {/* Current chain */}
            {verifiers.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  {verifiers.map((v, i) => (
                    <div key={v.id} className="flex items-center gap-3 mb-3 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className={styles.levelCircle}>
                          {i + 1}
                        </div>
                        {i < verifiers.length - 1 && (
                          <div className="w-0.5 h-6 bg-blue-200 dark:bg-blue-700 mt-1" />
                        )}
                      </div>
                      <div className={styles.verifierCard}>
                        <div>
                          <p className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-300">Level {i + 1}</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{v.role}</p>
                        </div>
                        <button onClick={() => removeVerifier(v.id)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableVerifiers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {verifiers.length === 0 ? 'Add 1st Level Verifier' : '+ Add Next Level Verifier'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {availableVerifiers.map(role => (
                    <button
                      key={role}
                      onClick={() => addVerifier(role)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] cursor-pointer transition-all"
                    >
                      <Plus size={11} /> {role}
                    </button>
                  ))}
                </div>

                {/* Custom Verifier Input */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customVerifierInput}
                    onChange={(e) => setCustomVerifierInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomVerifier()}
                    placeholder="Or enter custom verifier name..."
                    className={styles.input}
                  />
                  <button
                    onClick={addCustomVerifier}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-lg transition-all"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Info size={12} /> All verifier roles have been added
                </p>
                
                {/* Custom Verifier Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customVerifierInput}
                    onChange={(e) => setCustomVerifierInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomVerifier()}
                    placeholder="Add custom verifier name..."
                    className={styles.input}
                  />
                  <button
                    onClick={addCustomVerifier}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-lg transition-all"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={styles.publishBtn}
          >
            {publishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <FileText size={16} /> Publish Form
              </>
            )}
          </button>
          
          
        </div>

        {/* Center: Form Canvas */}
        <div className="lg:col-span-6">
          <div className={styles.card}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={styles.sectionTitle}>Form Canvas</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{fields.length} field{fields.length !== 1 ? 's' : ''} added</p>
              </div>
              {fields.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Eye size={12} /> Preview
                </div>
              )}
            </div>

            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className={styles.emptyIcon}>
                  <FileText size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No fields added yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Click chips on the left or add a custom field</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`group ${styles.fieldCard}`}
                  >
                    {/* Field actions overlay */}
                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-1 shadow-sm">
                      <button onClick={() => moveField(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer">
                        <ChevronUp size={13} />
                      </button>
                      <button onClick={() => moveField(idx, 'down')} disabled={idx === fields.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer ">
                        <ChevronDown size={13} />
                      </button>
                      <div className="w-px h-3 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                      <button onClick={() => removeField(field.id)} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Drag handle */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-grab transition-opacity">
                      <GripVertical size={14} className="text-gray-400" />
                    </div>

                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={styles.fieldBadge}>
                          {getFieldIcon(field.type)}
                          {field.type}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{field.label}</span>
                        {field.required && <span className="text-red-500 text-xs">*</span>}
                        {field.isCustom && (
                          <span className={styles.customTag}>custom</span>
                        )}
                      </div>

                      {field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          className={styles.input}
                          readOnly
                        />
                      ) : field.type === 'file' ? (
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-3 text-center">
                          <Upload size={16} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Drag & drop or click to upload</p>
                          <p className="text-xs text-gray-300 mt-0.5">PDF, JPG, PNG up to 5MB</p>
                        </div>
                      ) : field.options ? (
                        <div className="flex flex-wrap gap-1.5">
                          {field.options.map((opt, oi) => (
                            <span key={oi} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                              {field.type === 'checkbox' ? <CheckSquare size={11} className="text-gray-400" /> : <Circle size={11} className="text-gray-400" />}
                              {opt}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          className={styles.input}
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Form Settings */}
        
      </div>
    </div>
  );
}
