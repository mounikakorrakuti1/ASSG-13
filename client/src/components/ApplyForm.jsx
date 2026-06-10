import { useState } from "react";

const EMPTY = { fullName: "", email: "", phone: "" };

const ApplyForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$|^\+?[1-9]\d{7,14}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(form);
  };

  return (
    <form className="apply-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="fullName">Full Name *</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className={`form-input ${errors.fullName ? "input-error" : ""}`}
          placeholder="Your full name"
          value={form.fullName}
          onChange={handleChange}
        />
        {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">Email Address *</label>
        <input
          id="email"
          name="email"
          type="email"
          className={`form-input ${errors.email ? "input-error" : ""}`}
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error-msg">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="phone">Phone Number *</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={`form-input ${errors.phone ? "input-error" : ""}`}
          placeholder="10-digit mobile number"
          value={form.phone}
          onChange={handleChange}
        />
        {errors.phone && <span className="error-msg">{errors.phone}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? (
          <span className="btn-loading">
            <span className="btn-spinner"></span> Submitting...
          </span>
        ) : (
          "Submit Application 🚀"
        )}
      </button>
    </form>
  );
};

export default ApplyForm;
