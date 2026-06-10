import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchCandidateProfile,
  updateCandidateProfile,
  fetchSavedJobs,
  unsaveJob,
} from "../services/api";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";

// ─── Constants ────────────────────────────────────────────────────────────────
const JOB_TYPE_COLORS = {
  "Full Time": "badge-fulltime",
  "Part Time": "badge-parttime",
  Contract: "badge-contract",
};

const TABS = [
  { id: "profile", label: "👤 Profile" },
  { id: "saved", label: "🔖 Saved Jobs" },
];

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ profile, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    experience: "",
    skills: "",
  });

  // Sync form whenever profile loads/changes
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        location: profile.location || "",
        experience: profile.experience || "",
        skills: (profile.skills || []).join(", "),
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCandidateProfile({
        name: form.name,
        location: form.location,
        experience: form.experience,
        skills: form.skills, // backend accepts comma-separated string
      });
      setToast({ message: "Profile updated successfully ✅", type: "success" });
      setEditing(false);
      onSaved(); // refresh parent
    } catch (err) {
      setToast({ message: err.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <Loader message="Loading profile…" />;

  return (
    <div className="candidate-tab-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="profile-card">
        {/* Header row */}
        <div className="profile-card-header">
          <div className="profile-avatar">{profile.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-header-info">
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-email">✉️ {profile.email}</p>
            <span className="profile-role-badge">🎓 Job Seeker</span>
          </div>
          {!editing && (
            <button className="btn btn-outline btn-sm profile-edit-btn" onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          /* ── Edit Form ───────────────────────────────────────────────── */
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={50}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Hyderabad, Andhra Pradesh"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Skills
                <span className="form-hint"> — comma-separated, e.g. React, Node.js, MongoDB</span>
              </label>
              <input
                className="form-input"
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, Python…"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience / Bio</label>
              <textarea
                className="form-input form-textarea"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
                placeholder="Brief summary of your work experience, education, or career goals…"
              />
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* ── Read-only view ──────────────────────────────────────────── */
          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">📍 Location</span>
              <span className="profile-detail-value">
                {profile.location || <em className="text-muted">Not set</em>}
              </span>
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-label">🛠️ Skills</span>
              <span className="profile-detail-value">
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="skills-tag-list">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <em className="text-muted">No skills added yet</em>
                )}
              </span>
            </div>

            <div className="profile-detail-row profile-detail-row--block">
              <span className="profile-detail-label">📝 Experience / Bio</span>
              <p className="profile-detail-value profile-experience">
                {profile.experience || <em className="text-muted">No experience info added yet</em>}
              </p>
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-label">📋 Member Since</span>
              <span className="profile-detail-value">
                {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Saved Jobs Tab ───────────────────────────────────────────────────────────
const SavedJobsTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingJob, setRemovingJob] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSavedJobs();
      setJobs(data.data);
    } catch (err) {
      setError(err.message || "Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRemoveConfirm = async () => {
    setRemoveLoading(true);
    try {
      await unsaveJob(removingJob._id);
      setToast({ message: `"${removingJob.title}" removed from saved jobs 🗑️`, type: "success" });
      setRemovingJob(null);
      load();
    } catch (err) {
      setToast({ message: err.message || "Failed to remove job", type: "error" });
    } finally {
      setRemoveLoading(false);
    }
  };

  if (loading) return <Loader message="Loading saved jobs…" />;

  return (
    <div className="candidate-tab-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {removingJob && (
        <ConfirmModal
          message={`Remove "${removingJob.title}" at ${removingJob.company} from your saved jobs?`}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemovingJob(null)}
        />
      )}

      <div className="section-header" style={{ marginBottom: "16px" }}>
        <h2 className="section-title">Saved Jobs</h2>
        <span className="section-count">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={load}>Retry</button>
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔖</div>
          <p>You haven&apos;t saved any jobs yet.</p>
          <Link to="/" className="btn btn-primary">Browse Jobs</Link>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="saved-jobs-list">
          {jobs.map((job) => (
            <div key={job._id} className="saved-job-card">
              <div className="saved-job-main">
                <div className="saved-job-title-row">
                  <Link to={`/jobs/${job._id}`} className="job-title-link saved-job-title">
                    {job.title}
                  </Link>
                  <span className={`job-type-badge ${JOB_TYPE_COLORS[job.jobType] || "badge-fulltime"}`}>
                    {job.jobType}
                  </span>
                </div>
                <p className="saved-job-meta">
                  🏢 {job.company} &nbsp;·&nbsp; 📍 {job.location} &nbsp;·&nbsp;
                  💰 ₹{Number(job.salary).toLocaleString("en-IN")}/yr
                </p>
                <p className="saved-job-desc">
                  {job.description?.slice(0, 120)}{job.description?.length > 120 ? "…" : ""}
                </p>
              </div>
              <div className="saved-job-actions">
                <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">
                  View Job
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setRemovingJob(job)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const CandidateDashboard = ({ defaultTab = "profile" }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await fetchCandidateProfile();
      setProfile(data.data);
    } catch {
      // silently fail — ProfileTab will show skeleton
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Keep tab in sync when defaultTab prop changes (e.g. /candidate/saved-jobs route)
  useEffect(() => { setActiveTab(defaultTab); }, [defaultTab]);

  return (
    <div className="page candidate-dashboard-page">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Candidate Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.name}</strong>
          </p>
        </div>
        <Link to="/" className="btn btn-primary">
          🔍 Browse Jobs
        </Link>
      </div>

      {/* ── Quick-stat strip ──────────────────────────────────────────────── */}
      <div className="stat-cards candidate-stat-strip">
        <div className="stat-card">
          <div className="stat-icon">🛠️</div>
          <div className="stat-info">
            <span className="stat-value">{profile?.skills?.length ?? "—"}</span>
            <span className="stat-label">Skills Listed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔖</div>
          <div className="stat-info">
            <span className="stat-value">{profile?.savedJobs?.length ?? "—"}</span>
            <span className="stat-label">Saved Jobs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-info">
            <span className="stat-value" style={{ fontSize: "1rem" }}>
              {profile?.location || "—"}
            </span>
            <span className="stat-label">Location</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="candidate-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`candidate-tab-btn${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <ProfileTab
          profile={profileLoading ? null : profile}
          onSaved={loadProfile}
        />
      )}
      {activeTab === "saved" && <SavedJobsTab />}
    </div>
  );
};

export default CandidateDashboard;
