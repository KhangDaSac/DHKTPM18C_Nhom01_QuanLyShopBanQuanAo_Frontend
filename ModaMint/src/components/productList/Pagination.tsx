import React from 'react';

type Props = {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
};

const Pagination: React.FC<Props> = ({ page, totalPages, onPage }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      <button  disabled={page === 1} onClick={() => onPage(page - 1)}>«</button>
      {pages.map((p) => (
        <button key={p} onClick={() => onPage(p)} style={{ fontWeight: p === page ? 700 : 400,padding:'5px 10px',border:'1px solid #c3c3c3',borderRadius:4,backgroundColor: p === page ? '#ff6347' : '#fff',color: p === page ? '#fff' : '#000' }}>{p}</button>
      ))}
      <button disabled={page === totalPages} onClick={() => onPage(page + 1)}>»</button>
    </div>
  );
};

export default Pagination;
