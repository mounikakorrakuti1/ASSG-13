import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchJobById, deleteJob, applyForJob, fetchApplications, saveJob, unsaveJob, fetchCandidateProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ApplyForm from "../components/ApplyForm";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

const JOB_TYPE_COLORS = {
  "Full Time": "badge-fulltime",
  "Part Time": "badge-parttime",
  Contract: "badge-contract",
};

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [showApps, setShowApps] = useState(false);

  const [applyLoading, setApplyLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Save/bookmark state (jobseeker only)
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Check if job is already saved when page loads (jobseeker only)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "jobseeker") return;
    fetchCandidateProfile()
      .then((data) => {
        const savedIds = (data.data.savedJobs || []).map((j) =>
          typeof j === "object" ? j._id : j
        );
        setIsSaved(savedIds.includes(id));
      })
      .catch(() => {}); // silently ignore — save button still works
  }, [id, isAuthenticated, user]);

  const handleToggleSave = async () => {
    setSaveLoading(true);
    try {
      if (isSaved) {
        await unsaveJob(id);
        setIsSaved(false);
        setToast({ message: "Job removed from saved list", type: "success" });
      } else {
        await saveJob(id);
        setIsSaved(true);
        setToast({ message: "Job saved! View in your dashboard 🔖", type: "success" });
      }
    } catch (err) {
      setToast({ message: err.message || "Failed to update saved jobs", type: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const data = await fetchJobById(id);
        setJob(data.data);
      } catch (err) {
        setError(err.message || "Job not found");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteJob(id);
      setToast({ message: "Job deleted successfully", type: "success" });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setToast({ message: err.message || "Failed to delete job", type: "error" });
    } finally {
      setDeleteLoading(false);
      setShowConfirm(false);
    }
  };

  const handleApply = async (formData) => {
    setApplyLoading(true);
    try {
      await applyForJob(id, formData);
      setToast({ message: "Application submitted successfully! 🎉 We'll be in touch.", type: "success" });
      setShowApplyForm(false);
    } catch (err) {
      setToast({ message: err.message || "Failed to submit application", type: "error" });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleViewApplications = async () => {
    if (showApps) {
      setShowApps(false);
      return;
    }
    setAppsLoading(true);
    try {
      const data = await fetchApplications(id);
      setApplications(data.data);
      setShowApps(true);
    } catch (err) {
      setToast({ message: err.message || "Failed to load applications", type: "error" });
    } finally {
      setAppsLoading(false);
    }
  };

  if (loading) return <Loader message="Loading job details..." />;

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Job Not Found</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page detail-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showConfirm && (
        <ConfirmModal
          message={`Are you sure you want to delete "${job.title}" at ${job.company}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="detail-back">
        <Link to="/" className="back-link">← Back to Jobs</Link>
      </div>

      <div className="detail-layout">
        {/* Main Details */}
        <div className="detail-main">
          <div className="detail-header-card">
            <div className="detail-company-avatar">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="detail-header-info">
              <h1 className="detail-title">{job.title}</h1>
              <p className="detail-company">{job.company}</p>
              <div className="detail-meta-row">
                <span className="detail-meta-item">📍 {job.location}</span>
                <span className="detail-meta-item">💰 ₹{Number(job.salary).toLocaleString("en-IN")}/yr</span>
                <span className={`job-type-badge ${JOB_TYPE_COLORS[job.jobType] || "badge-fulltime"}`}>
                  {job.jobType}
                </span>
              </div>
              <p className="detail-posted">
                Posted on{" "}
                {new Date(job.createdAt).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="section-heading">Job Description</h2>
            <div className="detail-description">
              {job.description.split("\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Actions — role-aware */}
          <div className="detail-actions">
            {/* Apply: shown to candidates (logged-in non-recruiters) or guests */}
            {(!isAuthenticated || user?.role === "jobseeker") && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowApplyForm(!showApplyForm)}
              >
                {showApplyForm ? "✕ Close Form" : "📋 Apply Now"}
              </button>
            )}

            {/* Save/Unsave: jobseekers only */}
            {isAuthenticated && user?.role === "jobseeker" && (
              <button
                className={`btn btn-lg ${isSaved ? "btn-outline" : "btn-outline"}`}
                onClick={handleToggleSave}
                disabled={saveLoading}
                title={isSaved ? "Remove from saved jobs" : "Save this job"}
              >
                {saveLoading ? "…" : isSaved ? "🔖 Saved" : "🔖 Save Job"}
              </button>
            )}

            {/* Edit/Delete: only for the recruiter who posted this job */}
            {isAuthenticated && user?.role === "recruiter" && job.postedBy?._id === user._id && (
              <>
                <Link to={`/jobs/${id}/edit`} className="btn btn-outline btn-lg">
                  ✏️ Edit Job
                </Link>
                <button
                  className="btn btn-danger btn-lg"
                  onClick={() => setShowConfirm(true)}
                  disabled={deleteLoading}
                >
                  🗑️ Delete Job
                </button>
              </>
            )}

            {/* Recruiter viewing someone else's job */}
            {isAuthenticated && user?.role === "recruiter" && job.postedBy?._id !== user._id && (
              <p className="role-notice">👁️ You are viewing another recruiter&apos;s listing.</p>
            )}
          </div>

          {/* Apply Form */}
          {showApplyForm && (
            <div className="apply-form-section">
              <h2 className="section-heading">Submit Your Application</h2>
              <ApplyForm onSubmit={handleApply} loading={applyLoading} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-heading">Job Overview</h3>
            <ul className="sidebar-list">
              <li><span className="sidebar-label">Title</span><span>{job.title}</span></li>
              <li><span className="sidebar-label">Company</span><span>{job.company}</span></li>
              <li><span className="sidebar-label">Location</span><span>{job.location}</span></li>
              <li><span className="sidebar-label">Type</span><span>{job.jobType}</span></li>
              <li>
                <span className="sidebar-label">Salary</span>
                <span>₹{Number(job.salary).toLocaleString("en-IN")}</span>
              </li>
            </ul>
          </div>

          <div className="sidebar-card">
            <button
              className="btn btn-outline btn-full"
              onClick={handleViewApplications}
              disabled={appsLoading}
            >
              {appsLoading ? "Loading..." : showApps ? "Hide Applications" : "👥 View Applications"}
            </button>
          </div>
        </div>
      </div>

      {/* Applications Panel */}
      {showApps && (
        <div className="applications-panel">
          <h2 className="section-heading">
            Applications ({applications.length})
          </h2>
          {applications.length === 0 ? (
            <div className="empty-state small">
              <div className="empty-icon">📭</div>
              <p>No applications received yet.</p>
            </div>
          ) : (
            <div className="applications-table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
  <th>#</th>
  <th>Full Name</th>
  <th>Email</th>
  <th>Phone</th>
  <th>Resume</th>
  <th>Applied On</th>
</tr>
                </thead>
                <tbody>
                  {applications.map((app, idx) => (
                    <tr key={app._id}>
                      <td>{idx + 1}</td>
                      <td>{app.fullName}</td>
                      <td>
                        <a href={`mailto:${app.email}`} className="email-link">{app.email}</a>
                      </td>
                      <td>{app.phone}</td>
                      <td>
  {app.resumePath ? (
    <a
      href={`http://localhost:5000${app.resumePath}`}
      target="_blank"
      rel="noreferrer"
      className="btn btn-outline btn-sm"
    >
      View Resume
    </a>
  ) : (
    "No Resume"
  )}
</td>
                      <td>
                        {new Date(app.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
