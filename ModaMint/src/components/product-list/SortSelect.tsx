import React from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

const SortSelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="default">Mặc định</option>
      <option value="az">A-Z</option>
      <option value="za">Z-A</option>
      <option value="price-asc">Giá tăng dần</option>
      <option value="price-desc">Giá giảm dần</option>
    </select>
  );
};

export default SortSelect;
