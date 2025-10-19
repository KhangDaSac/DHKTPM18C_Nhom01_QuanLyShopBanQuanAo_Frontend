import React from "react";
import { Button } from "antd";

interface Props {
  value: number;
  onChange: (val: number) => void;
}

const QuantitySelector: React.FC<Props> = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <Button onClick={() => onChange(Math.max(1, value - 1))}>-</Button>
    <span className="w-8 text-center">{value}</span>
    <Button onClick={() => onChange(value + 1)}>+</Button>
  </div>
);

export default QuantitySelector;
