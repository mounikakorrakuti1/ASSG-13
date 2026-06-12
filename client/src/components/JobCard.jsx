import { Link } from "react-router-dom";

const JOB_TYPE_COLORS = {
  "Full Time": "badge-fulltime",
  "Part Time": "badge-parttime",
  Contract: "badge-contract",
};

const JobCard = ({ job }) => {
  const badgeClass = JOB_TYPE_COLORS[job.jobType] || "badge-fulltime";

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-company-avatar">
  {job.companyLogo ? (
    <img
      src={`http://localhost:5000${job.companyLogo}`}
      alt={job.company}
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  ) : (
    job.company.charAt(0).toUpperCase()
  )}
</div>
        <span className={`job-type-badge ${badgeClass}`}>{job.jobType}</span>
      </div>

      <div className="job-card-body">
        <h3 className="job-title">{job.title}</h3>
        <p className="job-company">{job.company}</p>

        <div className="job-meta">
          <span className="job-meta-item">
            <span className="meta-icon">📍</span> {job.location}
          </span>
          <span className="job-meta-item">
            <span className="meta-icon">💰</span> ₹{Number(job.salary).toLocaleString("en-IN")}/yr
          </span>
        </div>

        <p className="job-description-preview">
          {job.description.length > 100
            ? job.description.substring(0, 100) + "..."
            : job.description}
        </p>
      </div>

      <div className="job-card-footer">
        <span className="job-posted-date">
          {new Date(job.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
