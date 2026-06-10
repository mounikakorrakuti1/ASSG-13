import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchRecruiterStats, deleteJob, updateJob } from "../services/api";
import JobForm from "../components/JobForm";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

const JOB_TYPE_COLORS = {
  "Full Time": "badge-fulltime",
  "Part Time": "badge-parttime",
  Contract: "badge-contract",
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

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

  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditSubmit = async (formData) => {
    setEditLoading(true);
    try {
      await updateJob(editingJob._id, formData);
      setToast({ message: "Job updated successfully ✅", type: "success" });
      setEditingJob(null);
      loadStats(); // refresh list
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
