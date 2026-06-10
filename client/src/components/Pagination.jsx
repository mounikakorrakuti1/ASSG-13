const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const nums = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      nums.push(i);
    }
    return nums;
  };

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ← Prev
      </button>

      {page > 3 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
          {page > 4 && <span className="page-ellipsis">…</span>}
        </>
      )}

      {getPageNumbers().map((num) => (
        <button
          key={num}
          className={`page-btn ${num === page ? "page-btn-active" : ""}`}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}

      {page < pages - 2 && (
        <>
          {page < pages - 3 && <span className="page-ellipsis">…</span>}
          <button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button>
        </>
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
