import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobForm from "../components/JobForm";
import Toast from "../components/Toast";
import { createJob } from "../services/api";

const PostJobPage = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setToast(null);
    try {
      const result = await createJob(formData);
      setToast({ message: "Job posted successfully! 🎉 Redirecting...", type: "success" });
      // Give user time to read the success message before redirecting
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      // Show specific error message from server if available
      const message =
        err.message && err.message !== "Failed to fetch"
          ? err.message
          : "Failed to post job. Please check your connection and try again.";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page form-page">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="form-page-header">
        <h1 className="page-title">Post a New Job</h1>
        <p className="page-subtitle">Fill in the details below to publish your job listing</p>
      </div>

      <div className="form-card">
        <JobForm onSubmit={handleSubmit} loading={loading} submitLabel="🚀 Post Job" />
      </div>
    </div>
  );
};

export default PostJobPage;
