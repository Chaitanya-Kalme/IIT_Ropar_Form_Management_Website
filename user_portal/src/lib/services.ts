import api from "./api";
import { mockApi, type FormDefinition, type Submission, type UserProfile, type Comment } from "./mockApi";

// Set to true to use mock data, false when backend is ready
const USE_MOCK = true;

export const formsService = {
  getRecent: async (): Promise<Submission[]> => {
    if (USE_MOCK) return mockApi.getRecentSubmissions();
    const { data } = await api.get("/forms/recent");
    return data;
  },

  getAll: async (): Promise<FormDefinition[]> => {
    if (USE_MOCK) return mockApi.getForms();
    const { data } = await api.get("/forms");
    return data;
  },

  getById: async (formId: string): Promise<FormDefinition | undefined> => {
    if (USE_MOCK) return mockApi.getFormById(formId);
    const { data } = await api.get(`/forms/${formId}`);
    return data;
  },

  submit: async (payload: Record<string, unknown>) => {
    if (USE_MOCK) return mockApi.submitForm(payload);
    const { data } = await api.post("/forms/submit", payload);
    return data;
  },

  getStatus: async (submissionId: string) => {
    if (USE_MOCK) return mockApi.getSubmissionStatus(submissionId);
    const { data } = await api.get(`/forms/${submissionId}/status`);
    return data;
  },

  getComments: async (submissionId: string): Promise<Comment[]> => {
    if (USE_MOCK) return mockApi.getComments(submissionId);
    const { data } = await api.get(`/forms/${submissionId}/comments`);
    return data;
  },
};

export const historyService = {
  getAll: async (): Promise<Submission[]> => {
    if (USE_MOCK) return mockApi.getHistory();
    const { data } = await api.get("/history");
    return data;
  },
};

export const userService = {
  login: async (email: string, password: string) => {
    if (USE_MOCK) return mockApi.login(email, password);
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) return mockApi.getProfile();
    const { data } = await api.get("/user/profile");
    return data;
  },
};
