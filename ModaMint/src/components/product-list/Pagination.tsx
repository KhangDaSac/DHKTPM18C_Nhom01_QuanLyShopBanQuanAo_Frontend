import React from 'react';

type Props = {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
};

const Pagination: React.FC<Props> = ({ page, totalPages, onPage }) => {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button
        className="pagination__button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPage(Math.max(1, page - 1))}
      >
        «
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination__button ${p === page ? 'pagination__button--active' : ''}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="pagination__button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onPage(Math.min(totalPages, page + 1))}
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
