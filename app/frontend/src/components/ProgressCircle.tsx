interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProgressCircle({ 
  value, 
  size = 120, 
  strokeWidth = 8,
  label 
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };
  
  const color = getColor(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {value}
          </span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </div>
  );
}
