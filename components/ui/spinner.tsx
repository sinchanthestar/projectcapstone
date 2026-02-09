import * as React from "react";

type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: number; // px
};

export function Spinner({ size = 20, className = "", ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}
