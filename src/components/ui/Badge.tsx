import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span {...props} className={`inline-block px-2 py-1 text-xs font-semibold rounded ${className}`}>
      {children}
    </span>
  );
}
