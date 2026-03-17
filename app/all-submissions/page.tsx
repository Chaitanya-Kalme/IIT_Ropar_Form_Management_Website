'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { submissions } from '@/lib/data';
import Link from 'next/link';
import { Search, Eye, Download, ChevronDown, X, Filter } from 'lucide-react';
import { Suspense } from 'react';

const STATUSES = ['All', 'Pending', 'Accepted', 'Rejected', 'Expired'];
const FORM_TYPES = ['All', 'Certificate', 'Leave', 'Scholarship', 'Hostel', 'Research', 'Finance', 'Academic'];
const DEPARTMENTS = ['All', 'CSE', 'EE', 'ME', 'CH', 'PH'];

function SubmissionsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';
  const initialForm = searchParams.get('form') || '';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [formType, setFormType] = useState('All');
  const [dept, setDept] = useState('All');
  const [formSearch, setFormSearch] = useState(initialForm);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchSearch = !search || s.studentName.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === 'All' || s.status === status;
      const matchType = formType === 'All' || s.formType === formType;
      const matchDept = dept === 'All' || s.department === dept;
      const matchForm = !formSearch || s.formName.toLowerCase().includes(formSearch.toLowerCase());
      const subDate = new Date(s.submissionDate);
      const matchStart = !startDate || subDate >= new Date(startDate);
      const matchEnd = !endDate || subDate <= new Date(endDate);
      return matchSearch && matchStatus && matchType && matchDept && matchForm && matchStart && matchEnd;
    });
  }, [submissions, search, status, formType, dept, formSearch, startDate, endDate]);

  const hasFilters = search || status !== 'All' || formType !== 'All' || dept !== 'All' || formSearch || startDate || endDate;

  const exportCSV = () => {
    const csv = ['Student,Roll No,Form,Type,Dept,Date,Status,Verifier',
      ...filtered.map(s => `${s.studentName},${s.rollNo},${s.formName},${s.formType},${s.department},${s.submissionDate},${s.status},${s.currentVerifier}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'submissions.csv'; a.click();
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>All Submissions</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{filtered.length} of {submissions.length} submissions shown</p>
        </div>
        <div className="export-group">
          <button onClick={exportCSV} className="btn-outline"><Download className="w-4 h-4 text-green-500" /> Export CSV</button>
          <button className="btn-outline"><Download className="w-4 h-4 text-red-400" /> Export PDF</button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUSES.map(s => {
          const counts: Record<string, number> = {
            All: submissions.length,
            Pending: submissions.filter(x => x.status === 'Pending').length,
            Accepted: submissions.filter(x => x.status === 'Accepted').length,
            Rejected: submissions.filter(x => x.status === 'Rejected').length,
            Expired: submissions.filter(x => x.status === 'Expired').length,
          };
          const colors: Record<string, string> = { All: '#3B82F6', Pending: '#F59E0B', Accepted: '#22C55E', Rejected: '#EF4444', Expired: '#94A3B8' };
          const active = status === s;
          return (
            <button key={s} onClick={() => setStatus(s)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              style={{
                background: active ? `${colors[s]}18` : 'var(--card)',
                color: active ? colors[s] : 'var(--text-muted)',
                border: `1px solid ${active ? colors[s] + '40' : 'var(--border)'}`,
                cursor: 'pointer',
              }}>
              {s}
              <span className="px-1.5 py-0.5 rounded-md text-xs"
                style={{ background: active ? colors[s] + '25' : 'var(--bg)', color: active ? colors[s] : 'var(--text-muted)' }}>
                {counts[s]}
              </span>
            </button>
          );
        })}
        <div className="relative min-w-32">
            <select value={formType} onChange={e => setFormType(e.target.value)} className="form-input appearance-none pr-8 cursor-pointer">
              {FORM_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="relative min-w-28">
            <select value={dept} onChange={e => setDept(e.target.value)} className="form-input appearance-none pr-8 cursor-pointer">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
      </div>

      {/* Filters */}
      <div className="content-card mb-5">
        <div className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-44">
            
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or roll no..."
              className="form-input pl-9" />
          </div>
          <div className="relative flex-1 min-w-44"> 
              <div className="relative flex-1 min-w-44">
                
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input min-w-32" title="From date" />
              </div>
          </div>
          <div className="relative flex-1 min-w-44"> 
              <div className="relative flex-1 min-w-44">
                
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input min-w-32" title="To date" />
              </div>
          </div>
          
          
        </div>
      </div>

      {/* Table */}
      <div className="content-card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Form Name</th>
                <th>Department</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Current Verifier</th>
                <th>Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>No submissions match your filters</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `hsl(${s.studentName.charCodeAt(0) * 7},60%,50%)` }}>
                        {s.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.studentName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{s.formName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.formType}</p>
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: 'var(--bg)', color: 'var(--text)' }}>
                      {s.department}
                    </span>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span className={`badge badge-${s.status.toLowerCase()}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                      {s.status}
                    </span>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text)' }}>{s.currentVerifier}</td>
                  <td>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-bold" style={{ color: '#3B82F6' }}>L{s.currentLevel}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/{s.totalLevels}</span>
                    </div>
                  </td>
                  <td>
                    <Link href={`/form-details/${s.id}`}
                      className="flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: '#3B82F6', textDecoration: 'none' }}>
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t flex items-center justify-between text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <span>Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            <span>Page 1 of 1</span>
          </div>
        )}
      </div>
    </>
  );
}

export default function AllSubmissionsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>Loading submissions...</div>}>
        <SubmissionsContent />
      </Suspense>
    </DashboardLayout>
  );
}
