import React from 'react';

type Props = {
  value: number;
  label?: string;
};

const ProgressCircle: React.FC<Props> = ({ value, label }) => {
  return (
    <div className="progress-circle">
      <div className="progress-value">{value}</div>
      {label && <div className="progress-label">{label}</div>}
    </div>
  );
};

export default ProgressCircle;
