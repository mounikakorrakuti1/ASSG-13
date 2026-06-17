import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchRecruiterStats, fetchRecruiterAnalytics, fetchRecruiterActivity, deleteJob, updateJob } from "../services/api";
import JobForm from "../components/JobForm";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

const JOB_TYPE_COLORS = {
  "Full Time": "badge-fulltime",
  "Part Time": "badge-parttime",
  Contract: "badge-contract",
};

// Map activity entityType to an icon for the Recent Activity panel
const ACTIVITY_ICONS = {
  job: "📋",
  application: "📝",
  interview: "🗓️",
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Recent activity
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Edit modal
  const [editingJob, setEditingJob] = useState(null); // job object being edited
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deletingJob, setDeletingJob] = useState(null); // job object to delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRecruiterStats();
      setStats(data.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await fetchRecruiterAnalytics();
      setAnalytics(data.data);
    } catch {
      // non-fatal — cards will simply not render
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const data = await fetchRecruiterActivity();
      setActivity(data.data || []);
    } catch {
      // non-fatal
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadAnalytics();
    loadActivity();
  }, [loadStats, loadAnalytics, loadActivity]);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditSubmit = async (formData) => {
    setEditLoading(true);
    try {
      await updateJob(editingJob._id, formData);
      setToast({ message: "Job updated successfully ✅", type: "success" });
      setEditingJob(null);
      loadStats(); // refresh list
      loadAnalytics(); // refresh analytics too
    } catch (err) {
      setToast({ message: err.message || "Failed to update job", type: "error" });
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteJob(deletingJob._id);
      setToast({ message: "Job deleted successfully 🗑️", type: "success" });
      setDeletingJob(null);
      loadStats();
      loadAnalytics();
    } catch (err) {
      setToast({ message: err.message || "Failed to delete job", type: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loader message="Loading your dashboard..." />;

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Could not load dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadStats}>Retry</button>
        </div>
      </div>
    );
  }

  const { totalJobs, totalApplications, jobs } = stats;

  return (
    <div className="page dashboard-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete confirm modal */}
      {deletingJob && (
        <ConfirmModal
          message={`Delete "${deletingJob.title}" at ${deletingJob.company}? All its applications will also be removed.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingJob(null)}
        />
      )}

      {/* Edit modal */}
      {editingJob && (
        <div className="modal-overlay" onClick={() => !editLoading && setEditingJob(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ Edit Job</h2>
              <button
                className="modal-close"
                onClick={() => !editLoading && setEditingJob(null)}
                disabled={editLoading}
                aria-label="Close"
              >✕</button>
            </div>
            <div className="modal-body">
              <JobForm
                initialData={{
                  title: editingJob.title,
                  company: editingJob.company,
                  location: editingJob.location,
                  jobType: editingJob.jobType,
                  salary: String(editingJob.salary),
                  description: editingJob.description,
                }}
                onSubmit={handleEditSubmit}
                loading={editLoading}
                submitLabel="💾 Save Changes"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Recruiter Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, <strong>{user?.name}</strong></p>
        </div>
        <Link to="/post-job" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{totalJobs}</span>
            <span className="stat-label">Total Jobs Posted</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{totalApplications}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-value">
              {totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : "0"}
            </span>
            <span className="stat-label">Avg. Applications / Job</span>
          </div>
        </div>
      </div>

      {/* ── Analytics Section ───────────────────────────────────────── */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recruitment Analytics</h2>
        </div>

        {analyticsLoading ? (
          <Loader message="Loading analytics..." />
        ) : !analytics ? (
          <div className="empty-state small">
            <p>Analytics unavailable right now.</p>
          </div>
        ) : (
          <>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.totalJobs}</span>
                  <span className="stat-label">Total Jobs</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🟢</div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.activeJobs}</span>
                  <span className="stat-label">Active Jobs</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔴</div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.closedJobs}</span>
                  <span className="stat-label">Closed Jobs</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.totalApplicants}</span>
                  <span className="stat-label">Total Applicants</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.shortlisted}</span>
                  <span className="stat-label">Shortlisted</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.rejected}</span>
                  <span className="stat-label">Rejected</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.hired}</span>
                  <span className="stat-label">Hired</span>
                </div>
              </div>
            </div>

            {analytics.topPerformingJob && (
              <div className="empty-state small" style={{ marginTop: "12px" }}>
                <p>
                  🏆 Top performing job: <strong>{analytics.topPerformingJob.title}</strong>{" "}
                  ({analytics.topPerformingJob.applicationCount} applicant
                  {analytics.topPerformingJob.applicationCount !== 1 ? "s" : ""})
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Recent Activity Section ─────────────────────────────────── */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
        </div>

        {activityLoading ? (
          <Loader message="Loading activity..." />
        ) : activity.length === 0 ? (
          <div className="empty-state small">
            <div className="empty-icon">🕑</div>
            <p>No recent activity yet.</p>
          </div>
        ) : (
          <ul className="activity-list">
            {activity.map((item) => (
              <li key={item._id} className="activity-item">
                <span className="activity-icon">{ACTIVITY_ICONS[item.entityType] || "🔔"}</span>
                <div className="activity-info">
                  <p className="activity-message">{item.message}</p>
                  <span className="activity-time">
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "numeric", minute: "2-digit",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── My Jobs Table ─────────────────────────────────────────────── */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">My Job Listings</h2>
          <span className="section-count">{totalJobs} job{totalJobs !== 1 ? "s" : ""}</span>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>You haven&apos;t posted any jobs yet.</p>
            <Link to="/post-job" className="btn btn-primary">Post Your First Job</Link>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Salary (₹/yr)</th>
                  <th>Applications</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <tr key={job._id}>
                    <td className="td-index">{idx + 1}</td>
                    <td className="td-title">
                      <Link to={`/jobs/${job._id}`} className="job-title-link">
                        {job.title}
                      </Link>
                    </td>
                    <td>{job.company}</td>
                    <td>
                      <span className={`job-type-badge ${JOB_TYPE_COLORS[job.jobType] || "badge-fulltime"}`}>
                        {job.jobType}
                      </span>
                    </td>
                    <td>₹{Number(job.salary).toLocaleString("en-IN")}</td>
                    <td className="td-apps">
                      <span className="app-count-badge">{job.applicationCount}</span>
                    </td>
                    <td className="td-date">
                      {new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="td-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditingJob(job)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeletingJob(job)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default RecruiterDashboard;