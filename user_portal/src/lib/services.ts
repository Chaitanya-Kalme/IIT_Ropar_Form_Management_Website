import { mockApi, type FormDefinition, type Submission, type UserProfile, type Comment } from "./mockApi";

// Set to true to use mock data, false when backend is ready
const USE_MOCK = true;

const apiGet = async (path: string) => {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

const apiPost = async (path: string, body: unknown) => {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export const formsService = {
  getRecent: async (): Promise<Submission[]> => {
    if (USE_MOCK) return mockApi.getRecentSubmissions();
    return apiGet("/forms/recent");
  },

  getAll: async (): Promise<FormDefinition[]> => {
    if (USE_MOCK) return mockApi.getForms();
    return apiGet("/forms");
  },

  getById: async (formId: string): Promise<FormDefinition | undefined> => {
    if (USE_MOCK) return mockApi.getFormById(formId);
    return apiGet(`/forms/${formId}`);
  },

  submit: async (payload: Record<string, unknown>) => {
    if (USE_MOCK) return mockApi.submitForm(payload);
    return apiPost("/forms/submit", payload);
  },

  getStatus: async (submissionId: string) => {
    if (USE_MOCK) return mockApi.getSubmissionStatus(submissionId);
    return apiGet(`/forms/${submissionId}/status`);
  },

  getComments: async (submissionId: string): Promise<Comment[]> => {
    if (USE_MOCK) return mockApi.getComments(submissionId);
    return apiGet(`/forms/${submissionId}/comments`);
  },
};

export const historyService = {
  getAll: async (): Promise<Submission[]> => {
    if (USE_MOCK) return mockApi.getHistory();
    return apiGet("/history");
  },
};

export const userService = {
  login: async (email: string, password: string) => {
    if (USE_MOCK) return mockApi.login(email, password);
    return apiPost("/auth/login", { email, password });
  },

  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) return mockApi.getProfile();
    return apiGet("/user/profile");
  },
};
