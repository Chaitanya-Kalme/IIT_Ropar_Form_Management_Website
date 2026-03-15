export const mockUsers = [
  { id: 'u1', name: 'Arjun Sharma', email: 'arjun.sharma@iitrpr.ac.in', authMethod: 'Google', registeredDate: '2024-08-01', formsSubmitted: 5 },
  { id: 'u2', name: 'Priya Patel', email: 'priya.patel@iitrpr.ac.in', authMethod: 'Email', registeredDate: '2024-08-05', formsSubmitted: 3 },
  { id: 'u3', name: 'Rahul Kumar', email: 'rahul.kumar@iitrpr.ac.in', authMethod: 'Google', registeredDate: '2024-08-10', formsSubmitted: 8 },
  { id: 'u4', name: 'Sneha Gupta', email: 'sneha.gupta@iitrpr.ac.in', authMethod: 'Email', registeredDate: '2024-08-12', formsSubmitted: 2 },
  { id: 'u5', name: 'Vikram Singh', email: 'vikram.singh@iitrpr.ac.in', authMethod: 'Google', registeredDate: '2024-08-15', formsSubmitted: 6 },
  { id: 'u6', name: 'Ananya Mishra', email: 'ananya.mishra@iitrpr.ac.in', authMethod: 'Email', registeredDate: '2024-08-18', formsSubmitted: 4 },
  { id: 'u7', name: 'Karan Verma', email: 'karan.verma@iitrpr.ac.in', authMethod: 'Google', registeredDate: '2024-09-01', formsSubmitted: 7 },
  { id: 'u8', name: 'Divya Nair', email: 'divya.nair@iitrpr.ac.in', authMethod: 'Email', registeredDate: '2024-09-05', formsSubmitted: 1 },
  { id: 'u9', name: 'Amit Joshi', email: 'amit.joshi@iitrpr.ac.in', authMethod: 'Google', registeredDate: '2024-09-10', formsSubmitted: 9 },
  { id: 'u10', name: 'Pooja Reddy', email: 'pooja.reddy@iitrpr.ac.in', authMethod: 'Email', registeredDate: '2024-09-15', formsSubmitted: 3 },
];

export const mockForms = [
  { id: 'f1', name: 'Hostel Leave Application', createdDate: '2024-08-01', status: 'Active', deadline: '2025-12-31', submissionsCount: 34 },
  { id: 'f2', name: 'NOC for Internship', createdDate: '2024-08-10', status: 'Active', deadline: '2025-06-30', submissionsCount: 21 },
  { id: 'f3', name: 'Fee Waiver Request', createdDate: '2024-08-20', status: 'Draft', deadline: '2025-03-31', submissionsCount: 0 },
  { id: 'f4', name: 'Sports Event Participation', createdDate: '2024-09-01', status: 'Active', deadline: '2025-02-28', submissionsCount: 15 },
  { id: 'f5', name: 'Lab Access Request', createdDate: '2024-09-15', status: 'Active', deadline: '2025-12-31', submissionsCount: 42 },
  { id: 'f6', name: 'Project Funding Application', createdDate: '2024-10-01', status: 'Draft', deadline: '2025-05-31', submissionsCount: 0 },
  { id: 'f7', name: 'Medical Leave Form', createdDate: '2024-10-10', status: 'Active', deadline: '2025-12-31', submissionsCount: 28 },
  { id: 'f8', name: 'Scholarship Application', createdDate: '2024-10-20', status: 'Active', deadline: '2025-01-31', submissionsCount: 19 },
];

export const mockSubmissions = [
  { id: 's1', user: 'Arjun Sharma', formName: 'Hostel Leave Application', dateSubmitted: '2025-02-20', status: 'Pending', verifierLevel: 'HOD', currentVerifier: 'HOD' },
  { id: 's2', user: 'Priya Patel', formName: 'NOC for Internship', dateSubmitted: '2025-02-21', status: 'Approved', verifierLevel: 'Dean', currentVerifier: 'Dean' },
  { id: 's3', user: 'Rahul Kumar', formName: 'Fee Waiver Request', dateSubmitted: '2025-02-22', status: 'Rejected', verifierLevel: 'Admin', currentVerifier: 'Admin' },
  { id: 's4', user: 'Sneha Gupta', formName: 'Sports Event Participation', dateSubmitted: '2025-02-23', status: 'Pending', verifierLevel: 'Caretaker', currentVerifier: 'Caretaker' },
  { id: 's5', user: 'Vikram Singh', formName: 'Lab Access Request', dateSubmitted: '2025-02-24', status: 'Approved', verifierLevel: 'Faculty', currentVerifier: 'Faculty' },
  { id: 's6', user: 'Ananya Mishra', formName: 'Medical Leave Form', dateSubmitted: '2025-02-25', status: 'Pending', verifierLevel: 'HOD', currentVerifier: 'HOD' },
  { id: 's7', user: 'Karan Verma', formName: 'Scholarship Application', dateSubmitted: '2025-02-26', status: 'Approved', verifierLevel: 'Dean', currentVerifier: 'Dean' },
  { id: 's8', user: 'Divya Nair', formName: 'Hostel Leave Application', dateSubmitted: '2025-02-27', status: 'Rejected', verifierLevel: 'Caretaker', currentVerifier: 'Caretaker' },
  { id: 's9', user: 'Amit Joshi', formName: 'NOC for Internship', dateSubmitted: '2025-03-01', status: 'Pending', verifierLevel: 'Faculty', currentVerifier: 'Faculty' },
  { id: 's10', user: 'Pooja Reddy', formName: 'Lab Access Request', dateSubmitted: '2025-03-02', status: 'Approved', verifierLevel: 'Admin', currentVerifier: 'Admin' },
];

export const mockMembers = [
  { id: 'm1', name: 'Dr. Suresh Kumar', email: 'suresh.kumar@iitrpr.ac.in', role: 'HOD', department: 'Computer Science', phone: '+91 98765 43210' },
  { id: 'm2', name: 'Prof. Anita Singh', email: 'anita.singh@iitrpr.ac.in', role: 'Dean', department: 'Academic Affairs', phone: '+91 98765 43211' },
  { id: 'm3', name: 'Mr. Rajesh Verma', email: 'rajesh.verma@iitrpr.ac.in', role: 'Caretaker', department: 'Hostel Affairs', phone: '+91 98765 43212' },
  { id: 'm4', name: 'Dr. Meena Sharma', email: 'meena.sharma@iitrpr.ac.in', role: 'Faculty', department: 'Electrical Engineering', phone: '+91 98765 43213' },
  { id: 'm5', name: 'Mr. Anil Kumar', email: 'anil.kumar@iitrpr.ac.in', role: 'Admin', department: 'Administration', phone: '+91 98765 43214' },
  { id: 'm6', name: 'Dr. Pradeep Gupta', email: 'pradeep.gupta@iitrpr.ac.in', role: 'HOD', department: 'Mechanical Engineering', phone: '+91 98765 43215' },
  { id: 'm7', name: 'Prof. Kavita Rao', email: 'kavita.rao@iitrpr.ac.in', role: 'Faculty', department: 'Physics', phone: '+91 98765 43216' },
  { id: 'm8', name: 'Mr. Deepak Mishra', email: 'deepak.mishra@iitrpr.ac.in', role: 'Caretaker', department: 'Hostel Affairs', phone: '+91 98765 43217' },
];

export const mockActivityLogs = [
  { id: 'a1', timestamp: '2025-03-05 09:15:32', admin: 'Admin User', action: 'Approved Leave Application', target: 'Form #S1023' },
  { id: 'a2', timestamp: '2025-03-05 09:45:10', admin: 'Admin User', action: 'Created Hostel Leave Form', target: 'Form #F0012' },
  { id: 'a3', timestamp: '2025-03-04 14:22:05', admin: 'Dr. Suresh Kumar', action: 'Rejected Fee Waiver Request', target: 'Form #S1019' },
  { id: 'a4', timestamp: '2025-03-04 11:05:44', admin: 'Prof. Anita Singh', action: 'Edited NOC for Internship Form', target: 'Form #F0008' },
  { id: 'a5', timestamp: '2025-03-03 16:30:22', admin: 'Admin User', action: 'Added New Member', target: 'Mr. Deepak Mishra' },
  { id: 'a6', timestamp: '2025-03-03 13:15:00', admin: 'Dr. Suresh Kumar', action: 'Approved Medical Leave Form', target: 'Form #S1018' },
  { id: 'a7', timestamp: '2025-03-02 10:50:15', admin: 'Admin User', action: 'Deactivated Sports Event Form', target: 'Form #F0004' },
  { id: 'a8', timestamp: '2025-03-02 09:20:33', admin: 'Prof. Anita Singh', action: 'Exported Users List', target: 'CSV Export' },
  { id: 'a9', timestamp: '2025-03-01 15:45:00', admin: 'Admin User', action: 'Bulk Approved 5 Submissions', target: 'Forms #S1010-S1015' },
  { id: 'a10', timestamp: '2025-03-01 11:30:00', admin: 'Dr. Meena Sharma', action: 'Deleted Member Profile', target: 'Staff #M0022' },
  { id: 'a11', timestamp: '2025-02-28 14:10:22', admin: 'Admin User', action: 'Updated Form Settings', target: 'Form #F0007' },
  { id: 'a12', timestamp: '2025-02-27 09:00:05', admin: 'Mr. Anil Kumar', action: 'Reset User Password', target: 'User arjun.sharma' },
];

export const chartSubmissionsData = [
  { day: 'Mon', submissions: 12, approved: 8, rejected: 2 },
  { day: 'Tue', submissions: 19, approved: 14, rejected: 3 },
  { day: 'Wed', submissions: 8, approved: 5, rejected: 1 },
  { day: 'Thu', submissions: 27, approved: 20, rejected: 4 },
  { day: 'Fri', submissions: 22, approved: 17, rejected: 3 },
  { day: 'Sat', submissions: 6, approved: 4, rejected: 1 },
  { day: 'Sun', submissions: 3, approved: 2, rejected: 0 },
];

export const chartStatusData = [
  { name: 'Approved', value: 63, color: '#22C55E' },
  { name: 'Pending', value: 24, color: '#F59E0B' },
  { name: 'Rejected', value: 13, color: '#EF4444' },
];
