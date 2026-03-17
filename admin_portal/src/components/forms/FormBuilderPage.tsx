'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GripVertical, Trash2, Plus, X, ChevronUp, ChevronDown,
  FileText, Hash, Phone, Mail, MapPin, Building, BookOpen, Calendar,
  Upload, CheckSquare, Circle, List, Type, AlignLeft, Settings,
  Eye, Zap, Info, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  FormFieldType,
  MockForm,
  MockFormField,
  getFormById,
} from '@/data/mockData';
import styles from '@/styles/CreateFormPage.module.css';

interface VerifierLevel {
  id: string;
  role: string;
}

const QUICK_FIELDS: { label: string; type: FormFieldType; icon: React.ReactNode; placeholder?: string }[] = [
  { label: 'Name', type: 'text', icon: <FileText size={14} />, placeholder: 'Enter full name' },
  { label: 'Age', type: 'number', icon: <Hash size={14} />, placeholder: 'Enter age' },
  { label: 'Mobile', type: 'tel', icon: <Phone size={14} />, placeholder: 'Enter mobile number' },
  { label: 'Email', type: 'email', icon: <Mail size={14} />, placeholder: 'Enter email address' },
  { label: 'Address', type: 'textarea', icon: <MapPin size={14} />, placeholder: 'Enter full address' },
  { label: 'Department', type: 'text', icon: <Building size={14} />, placeholder: 'Enter department' },
  { label: 'Roll Number', type: 'text', icon: <BookOpen size={14} />, placeholder: 'Enter roll number' },
];

const VERIFIER_ROLES = ['Caretaker', 'HOD', 'Dean', 'Faculty', 'Admin'];

const fieldTypeOptions: { value: FormFieldType; label: string; icon: React.ReactNode }[] = [
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

function buildFormState(form?: MockForm) {
  return {
    formTitle: form?.name ?? '',
    formDescription: form?.description ?? '',
    deadline: form?.deadline ?? '',
    isActive: form?.status === 'Active' || !form,
    fields: form?.fields ?? [],
    verifiers: (form?.verificationFlow ?? []).map((role) => ({ id: generateId(), role })),
  };
}

interface CustomFieldFormProps {
  onAdd: (field: MockFormField) => void;
  onCancel: () => void;
}

function CustomFieldForm({ onAdd, onCancel }: CustomFieldFormProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FormFieldType>('text');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [required, setRequired] = useState(false);

  const needsOptions = ['checkbox', 'radio', 'select'].includes(type);

  const addOption = () => {
    if (newOption.trim()) {
      setOptions((current) => [...current, newOption.trim()]);
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
          {fieldTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={`${styles.typeSelector} ${type === option.value ? styles.typeSelectorActive : ''}`}
            >
              {option.icon} {option.label}
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
              type="button"
              onClick={addOption}
              className="w-8 h-8 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center hover:bg-[#1e3a8a]/90 flex-shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {options.map((option, index) => (
              <span key={index} className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                {option}
                <button type="button" onClick={() => setOptions(options.filter((_, idx) => idx !== index))} className="text-gray-400 hover:text-red-500">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="checkbox" id="required" checked={required} onChange={(e) => setRequired(e.target.checked)} className="w-3.5 h-3.5" />
        <label htmlFor="required" className="text-xs text-gray-600 dark:text-gray-400">Required field</label>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 py-2 bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3a8a]/90 transition-colors cursor-pointer"
        >
          Add to Form
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-xs text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface FormBuilderPageProps {
  mode: 'create' | 'edit';
  formId?: string;
}

export function FormBuilderPage({ mode, formId }: FormBuilderPageProps) {
  const router = useRouter();
  const editingForm = formId ? getFormById(formId) : undefined;
  const initialState = buildFormState(editingForm);

  const [fields, setFields] = useState<MockFormField[]>(initialState.fields);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [formTitle, setFormTitle] = useState(initialState.formTitle);
  const [formDescription, setFormDescription] = useState(initialState.formDescription);
  const [deadline, setDeadline] = useState(initialState.deadline);
  const [isActive, setIsActive] = useState(initialState.isActive);
  const [verifiers, setVerifiers] = useState<VerifierLevel[]>(initialState.verifiers);
  const [customVerifierInput, setCustomVerifierInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextState = buildFormState(editingForm);
    setFields(nextState.fields);
    setFormTitle(nextState.formTitle);
    setFormDescription(nextState.formDescription);
    setDeadline(nextState.deadline);
    setIsActive(nextState.isActive);
    setVerifiers(nextState.verifiers);
  }, [editingForm]);

  const addedLabels = new Set(fields.map((field) => field.label));

  const pageTitle = mode === 'edit' ? `Edit ${editingForm?.name ?? 'Form'}` : 'Create Form';
  const pageSubtitle =
    mode === 'edit'
      ? 'Update the dummy form configuration, fields, and verification flow.'
      : 'Build a new form with custom fields and verification flow.';

  const addQuickField = (quickField: typeof QUICK_FIELDS[number]) => {
    if (addedLabels.has(quickField.label)) return;
    setFields((current) => [
      ...current,
      {
        id: generateId(),
        label: quickField.label,
        type: quickField.type,
        required: true,
        placeholder: quickField.placeholder,
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields((current) => current.filter((field) => field.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const next = [...fields];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFields(next);
  };

  const addVerifier = (role: string) => {
    if (verifiers.some((verifier) => verifier.role === role)) {
      toast.error(`${role} already added as a verifier`);
      return;
    }
    setVerifiers((current) => [...current, { id: generateId(), role }]);
  };

  const addCustomVerifier = () => {
    const value = customVerifierInput.trim();
    if (!value) {
      toast.error('Please enter a verifier name');
      return;
    }
    if (verifiers.some((verifier) => verifier.role.toLowerCase() === value.toLowerCase())) {
      toast.error(`${value} already added as a verifier`);
      return;
    }
    setVerifiers((current) => [...current, { id: generateId(), role: value }]);
    setCustomVerifierInput('');
    toast.success(`${value} added as verifier`);
  };

  const removeVerifier = (id: string) => {
    setVerifiers((current) => current.filter((verifier) => verifier.id !== id));
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error('Form title is required');
      return;
    }
    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }
    if (verifiers.length === 0) {
      toast.error('Please add at least one verifier');
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSaving(false);

    if (mode === 'edit' && editingForm) {
      toast.success(`${editingForm.name} updated in frontend demo state`);
      router.push(`/forms/available/${editingForm.id}`);
      return;
    }

    toast.success('Form published successfully');
    setFields([]);
    setFormTitle('');
    setFormDescription('');
    setDeadline('');
    setVerifiers([]);
  };

  const getFieldIcon = (type: FormFieldType) => {
    const icons: Record<FormFieldType, React.ReactNode> = {
      text: <Type size={12} />,
      number: <Hash size={12} />,
      date: <Calendar size={12} />,
      file: <Upload size={12} />,
      checkbox: <CheckSquare size={12} />,
      radio: <Circle size={12} />,
      select: <List size={12} />,
      textarea: <AlignLeft size={12} />,
      email: <Mail size={12} />,
      tel: <Phone size={12} />,
    };

    return icons[type];
  };

  const availableVerifiers = VERIFIER_ROLES.filter((role) => !verifiers.some((verifier) => verifier.role === role));

  return (
    <div className={`space-y-6 ${styles.page}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className={styles.pageHeader}>
        {mode === 'edit' && editingForm && (
          <button
            type="button"
            onClick={() => router.push(`/forms/available/${editingForm.id}`)}
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#1E3A8A] dark:text-blue-400 font-medium"
          >
            <ArrowLeft size={16} />
            Back to form dashboard
          </button>
        )}
        <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{pageTitle}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{pageSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Quick Add Fields</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 mb-5">Click to add common fields</p>
            <div className="flex flex-wrap gap-3">
              {QUICK_FIELDS.map((quickField) => {
                const added = addedLabels.has(quickField.label);
                return (
                  <button
                    key={quickField.label}
                    type="button"
                    onClick={() => addQuickField(quickField)}
                    disabled={added}
                    className={`${styles.quickChip} ${added ? styles.quickChipAdded : ''}`}
                  >
                    {quickField.icon} {quickField.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={`${styles.sectionTitle} mb-5`}>Custom Field</h3>
            {showCustomForm ? (
              <CustomFieldForm
                onAdd={(field) => {
                  setFields((current) => [...current, field]);
                  setShowCustomForm(false);
                  toast.success(`"${field.label}" field added`);
                }}
                onCancel={() => setShowCustomForm(false)}
              />
            ) : (
              <button type="button" onClick={() => setShowCustomForm(true)} className={styles.addFieldBtn}>
                <Plus size={16} /> Add Custom Field
              </button>
            )}
          </div>

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
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Hostel Leave Application" className={styles.input} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Brief description of the form..." className={styles.input} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={styles.input} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Form Status</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isActive ? 'Active - accepting submissions' : 'Draft - not visible to users'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${isActive ? 'bg-[#22C55E]' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg">
                <Zap size={20} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className={styles.sectionTitle}>Verification Flow</h3>
            </div>

            {verifiers.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  {verifiers.map((verifier, index) => (
                    <div key={verifier.id} className="flex items-center gap-3 mb-3 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className={styles.levelCircle}>{index + 1}</div>
                        {index < verifiers.length - 1 && <div className="w-0.5 h-6 bg-blue-200 dark:bg-blue-700 mt-1" />}
                      </div>
                      <div className={styles.verifierCard}>
                        <div>
                          <p className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-300">Level {index + 1}</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{verifier.role}</p>
                        </div>
                        <button type="button" onClick={() => removeVerifier(verifier.id)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">{verifiers.length === 0 ? 'Add 1st Level Verifier' : '+ Add Next Level Verifier'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableVerifiers.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => addVerifier(role)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] cursor-pointer transition-all"
                    >
                      <Plus size={11} /> {role}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Info size={12} /> Default verifier roles have all been added
              </p>
            )}

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customVerifierInput}
                onChange={(e) => setCustomVerifierInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomVerifier()}
                placeholder="Add custom verifier name..."
                className={styles.input}
              />
              <button
                type="button"
                onClick={addCustomVerifier}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-lg transition-all"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>

          <button type="button" onClick={handleSave} disabled={saving} className={styles.publishBtn}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'edit' ? 'Saving...' : 'Publishing...'}
              </>
            ) : (
              <>
                <FileText size={16} />
                {mode === 'edit' ? 'Save Form Changes' : 'Publish Form'}
              </>
            )}
          </button>
        </div>

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
                {fields.map((field, index) => (
                  <div key={field.id} className={`group ${styles.fieldCard}`}>
                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-1 shadow-sm">
                      <button type="button" onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer">
                        <ChevronUp size={13} />
                      </button>
                      <button type="button" onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer">
                        <ChevronDown size={13} />
                      </button>
                      <div className="w-px h-3 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                      <button type="button" onClick={() => removeField(field.id)} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-grab transition-opacity">
                      <GripVertical size={14} className="text-gray-400" />
                    </div>

                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className={styles.fieldBadge}>
                          {getFieldIcon(field.type)}
                          {field.type}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{field.label}</span>
                        {field.required && <span className="text-red-500 text-xs">*</span>}
                        {field.isCustom && <span className={styles.customTag}>custom</span>}
                      </div>

                      {field.type === 'textarea' ? (
                        <textarea placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`} className={styles.input} readOnly />
                      ) : field.type === 'file' ? (
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-3 text-center">
                          <Upload size={16} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Drag and drop or click to upload</p>
                          <p className="text-xs text-gray-300 mt-0.5">PDF, JPG, PNG up to 5MB</p>
                        </div>
                      ) : field.options ? (
                        <div className="flex flex-wrap gap-1.5">
                          {field.options.map((option, optionIndex) => (
                            <span key={optionIndex} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                              {field.type === 'checkbox' ? <CheckSquare size={11} className="text-gray-400" /> : <Circle size={11} className="text-gray-400" />}
                              {option}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <input type={field.type} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`} className={styles.input} readOnly />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
