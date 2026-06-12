const BASE_URL = "/api";

// Read token from localStorage on every call (always fresh)
const getToken = () => localStorage.getItem("mjp-token");

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

// Authenticated fetch — attaches Bearer token when present
const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const fetchJobs = async ({
  search = "",
  jobType = "",
  sortBy = "",
  page = 1,
  limit = 9,
  location = "",
  company = "",
  minSalary = "",
  maxSalary = "",
} = {}) => {
  const params = new URLSearchParams();

if (search) params.append("search", search);
if (jobType) params.append("jobType", jobType);
if (sortBy) params.append("sortBy", sortBy);

if (location) params.append("location", location);
if (company) params.append("company", company);
if (minSalary) params.append("minSalary", minSalary);
if (maxSalary) params.append("maxSalary", maxSalary);

params.append("page", page);
params.append("limit", limit);
  const res = await fetch(`${BASE_URL}/jobs?${params.toString()}`);
  return handleResponse(res);
};

export const fetchJobById = async (id) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}`);
  return handleResponse(res);
};

export const createJob = async (jobData) => {
  const formData = new FormData();

  formData.append("title", jobData.title);
  formData.append("company", jobData.company);
  formData.append("location", jobData.location);
  formData.append("jobType", jobData.jobType);
  formData.append("salary", jobData.salary);
  formData.append("description", jobData.description);

  if (jobData.companyLogo) {
    formData.append("companyLogo", jobData.companyLogo);
  }

  const token = localStorage.getItem("mjp-token");

  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(res);
};
export const updateJob = async (id, jobData) => {
  const res = await authFetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(jobData),
  });
  return handleResponse(res);
};

export const deleteJob = async (id) => {
  const res = await authFetch(`${BASE_URL}/jobs/${id}`, { method: "DELETE" });
  return handleResponse(res);
};

// ─── Applications ──────────────────────────────────────────────────────────────
export const applyForJob = async (id, applicationData) => {

console.log(applicationData);  
const formData = new FormData();

  formData.append("fullName", applicationData.fullName);
  formData.append("email", applicationData.email);
  formData.append("phone", applicationData.phone);

  if (applicationData.resume) {
    formData.append("resume", applicationData.resume);
  }

  const res = await fetch(`${BASE_URL}/jobs/${id}/apply`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(res);
};

export const fetchApplications = async (id) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}/applications`);
  return handleResponse(res);
};

// ─── Recruiter ────────────────────────────────────────────────────────────────
export const fetchRecruiterStats = async () => {
  const res = await authFetch(`${BASE_URL}/recruiter/stats`);
  return handleResponse(res);
};

// ─── Candidate ────────────────────────────────────────────────────────────────
export const fetchCandidateProfile = async () => {
  const res = await authFetch(`${BASE_URL}/candidate/profile`);
  return handleResponse(res);
};

export const updateCandidateProfile = async (profileData) => {
  const res = await authFetch(`${BASE_URL}/candidate/profile`, {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  return handleResponse(res);
};

export const fetchSavedJobs = async () => {
  const res = await authFetch(`${BASE_URL}/candidate/saved-jobs`);
  return handleResponse(res);
};

export const saveJob = async (jobId) => {
  const res = await authFetch(`${BASE_URL}/candidate/saved-jobs/${jobId}`, {
    method: "POST",
  });
  return handleResponse(res);
};

export const unsaveJob = async (jobId) => {
  const res = await authFetch(`${BASE_URL}/candidate/saved-jobs/${jobId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};
