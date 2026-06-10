import { useState, useEffect, useCallback, useRef } from "react";
import { fetchJobs } from "../services/api";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

const JOB_TYPES = ["", "Full Time", "Part Time", "Contract"];
const SORT_OPTIONS = [
  { value: "", label: "Newest First" },
  { value: "salary_desc", label: "Salary: High → Low" },
  { value: "salary_asc", label: "Salary: Low → High" },
];

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [location, setLocation] = useState("");
const [company, setCompany] = useState("");
const [minSalary, setMinSalary] = useState("");
const [maxSalary, setMaxSalary] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  // Use a ref to track the current request so stale responses are ignored
  const requestIdRef = useRef(0);

  const loadJobs = useCallback(
    async (currentPage) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError("");
      try {
        const data = await fetchJobs({
  search: debouncedSearch,
  jobType,
  sortBy,
  page: currentPage,
  limit: 9,
  location,
  company,
  minSalary,
  maxSalary,
});
        // Ignore if a newer request has already been fired
        if (requestId !== requestIdRef.current) return;
        setJobs(data.data ?? []);
        setPages(data.pages ?? 1);
        setTotal(data.total ?? 0);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.message || "Failed to load jobs. Make sure the backend is running.");
        setJobs([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [
  debouncedSearch,
  jobType,
  sortBy,
  location,
  company,
  minSalary,
  maxSalary
]
  );

  // When filters change, reset to page 1 and reload
  useEffect(() => {
  setPage(1);
  loadJobs(1);
}, [
  debouncedSearch,
  jobType,
  sortBy,
  location,
  company,
  minSalary,
  maxSalary
]);// eslint-disable-line react-hooks/exhaustive-deps

  // When page changes (from Pagination), reload with that page
  useEffect(() => {
    loadJobs(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
  setSearch("");
  setJobType("");
  setSortBy("");

  setLocation("");
  setCompany("");
  setMinSalary("");
  setMaxSalary("");
};

  const hasFilters =
  search ||
  jobType ||
  sortBy ||
  location ||
  company ||
  minSalary ||
  maxSalary;

  return (
    <div className="page home-page">
      {/* Hero */}
      <div className="hero">
        <h1 className="hero-title">
          Find Your <span className="hero-accent">Dream Job</span>
        </h1>
        <p className="hero-subtitle">
          {total > 0
            ? `Explore ${total} opportunit${total === 1 ? "y" : "ies"} posted by top companies`
            : "Explore opportunities posted by top companies"}
        </p>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="filter-group">
        <input
  type="text"
  placeholder="Location"
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  className="filter-select"
/>

<input
  type="text"
  placeholder="Company"
  value={company}
  onChange={(e) => setCompany(e.target.value)}
  className="filter-select"
/>

<input
  type="number"
  placeholder="Min Salary"
  value={minSalary}
  onChange={(e) => setMinSalary(e.target.value)}
  className="filter-select"
/>

<input
  type="number"
  placeholder="Max Salary"
  value={maxSalary}
  onChange={(e) => setMaxSalary(e.target.value)}
  className="filter-select"
/>
          <select
            className="filter-select"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            aria-label="Filter by job type"
          >
            <option value="">All Types</option>
            {JOB_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort jobs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="results-info">
          {total === 0
            ? "No jobs found"
            : `Showing ${jobs.length} of ${total} job${total !== 1 ? "s" : ""}`}
          {jobType && ` · ${jobType}`}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <Loader message="Fetching jobs..." />
      ) : error ? (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Could not load jobs</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => loadJobs(page)}>
            Try Again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>No Jobs Found</h3>
          <p>
            {hasFilters
              ? "Try adjusting your search or filters."
              : "No job postings yet. Be the first to post one!"}
          </p>
          {hasFilters && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default HomePage;
