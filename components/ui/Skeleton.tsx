import type { CSSProperties, HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  circle?: boolean;
}

export function Skeleton({
  width,
  height,
  circle = false,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`skeleton${circle ? " skeleton_circle" : ""}${className ? ` ${className}` : ""}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
