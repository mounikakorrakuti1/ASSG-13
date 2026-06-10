import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="page">
      <div className="empty-state notfound-state">
        <div className="empty-icon" style={{ fontSize: "5rem" }}>🚧</div>
        <h1 style={{ fontSize: "4rem", margin: "0.25rem 0" }}>404</h1>
        <h3>Page Not Found</h3>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">← Go Home</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
