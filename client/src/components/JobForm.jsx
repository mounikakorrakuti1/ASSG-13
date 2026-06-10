import { useState } from "react";

const EMPTY_FORM = {
  title: "",
  company: "",
  location: "",
  jobType: "",
  salary: "",
  description: "",
};

// Normalise initialData so salary is always a string in the input (avoids
// React controlled/uncontrolled component warning when editing an existing job).
const normalise = (data) => ({
  ...EMPTY_FORM,
  ...data,
  salary: data?.salary !== undefined && data?.salary !== "" ? String(data.salary) : "",
});

const JobForm = ({ initialData, onSubmit, loading, submitLabel = "Post Job" }) => {
  const [form, setForm] = useState(() => normalise(initialData));
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Job title is required";
    else if (form.title.trim().length > 100) newErrors.title = "Job title cannot exceed 100 characters";

    if (!form.company.trim()) newErrors.company = "Company name is required";
    else if (form.company.trim().length > 100) newErrors.company = "Company name cannot exceed 100 characters";

    if (!form.location.trim()) newErrors.location = "Location is required";

    if (!form.jobType) newErrors.jobType = "Job type is required";

    if (form.salary === "" || form.salary === null || form.salary === undefined) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(Number(form.salary)) || Number(form.salary) < 0) {
      newErrors.salary = "Salary must be a valid non-negative number";
    }

    if (!form.description.trim()) newErrors.description = "Job description is required";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({ ...form, title: form.title.trim(), company: form.company.trim(), location: form.location.trim(), description: form.description.trim(), salary: Number(form.salary) });
  };

  return (
    <form className="job-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="title">Job Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-input ${errors.title ? "input-error" : ""}`}
            placeholder="e.g. Frontend Developer"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
          />
          {errors.title && <span className="error-msg">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="company">Company Name *</label>
          <input
            id="company"
            name="company"
            type="text"
            className={`form-input ${errors.company ? "input-error" : ""}`}
            placeholder="e.g. Infosys Ltd."
            value={form.company}
            onChange={handleChange}
            maxLength={100}
          />
          {errors.company && <span className="error-msg">{errors.company}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="location">Location *</label>
          <input
            id="location"
            name="location"
            type="text"
            className={`form-input ${errors.location ? "input-error" : ""}`}
            placeholder="e.g. Hyderabad, Telangana"
            value={form.location}
            onChange={handleChange}
          />
          {errors.location && <span className="error-msg">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="jobType">Job Type *</label>
          <select
            id="jobType"
            name="jobType"
            className={`form-input form-select ${errors.jobType ? "input-error" : ""}`}
            value={form.jobType}
            onChange={handleChange}
          >
            <option value="">-- Select Job Type --</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
          </select>
          {errors.jobType && <span className="error-msg">{errors.jobType}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="salary">Annual Salary (₹) *</label>
        <input
          id="salary"
          name="salary"
          type="number"
          className={`form-input ${errors.salary ? "input-error" : ""}`}
          placeholder="e.g. 600000"
          value={form.salary}
          onChange={handleChange}
          min="0"
          step="1"
        />
        {errors.salary && <span className="error-msg">{errors.salary}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Job Description *</label>
        <textarea
          id="description"
          name="description"
          className={`form-input form-textarea ${errors.description ? "input-error" : ""}`}
          placeholder="Describe the role, responsibilities, and requirements..."
          value={form.description}
          onChange={handleChange}
          rows={6}
        />
        {errors.description && <span className="error-msg">{errors.description}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? (
          <span className="btn-loading">
            <span className="btn-spinner"></span> Saving...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
};

export default JobForm;
