import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`card-enter rounded-xl bg-white p-5 shadow ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
