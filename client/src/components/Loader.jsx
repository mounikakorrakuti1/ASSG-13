const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="loader-wrapper">
      <div className="spinner"></div>
      <p className="loader-text">{message}</p>
    </div>
  );
};

export default Loader;
