import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchJobById, updateJob } from "../services/api";
import JobForm from "../components/JobForm";
import Loader from "../components/Loader";
import Toast from "../components/Toast";

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await fetchJobById(id);
        const job = data.data;
        setInitialData({
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          // Convert Number to string for the form input
          salary: String(job.salary),
          description: job.description,
        });
      } catch (err) {
        setError(err.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaveLoading(true);
    setToast(null);
    try {
      await updateJob(id, formData);
      setToast({ message: "Job updated successfully! ✅ Redirecting...", type: "success" });
      setTimeout(() => navigate(`/jobs/${id}`), 2000);
    } catch (err) {
      const message =
        err.message && err.message !== "Failed to fetch"
          ? err.message
          : "Failed to update job. Please check your connection and try again.";
      setToast({ message, type: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Loader message="Loading job data..." />;

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Could not load job</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page form-page">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="form-page-header">
        <Link to={`/jobs/${id}`} className="back-link">← Back to Job</Link>
        <h1 className="page-title">Edit Job Posting</h1>
        <p className="page-subtitle">Update the details of your job listing below</p>
      </div>

      <div className="form-card">
        {/* Only render JobForm once initialData is loaded (not null) */}
        {initialData && (
          <JobForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={saveLoading}
            submitLabel="💾 Save Changes"
          />
        )}
      </div>
    </div>
  );
};

export default EditJobPage;
