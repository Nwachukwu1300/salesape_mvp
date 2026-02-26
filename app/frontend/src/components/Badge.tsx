interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  className = "",
  style,
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    primary: "text-white",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant] || ""} ${className}`}
      style={
        variant === "primary"
          ? { ...(style || {}), backgroundColor: "#f724de" }
          : style
      }
      {...props}
    >
      {children}
    </span>
  );
}
