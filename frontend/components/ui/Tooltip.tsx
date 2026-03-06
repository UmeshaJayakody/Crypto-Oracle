"use client";

import { useState, ReactNode } from "react";

interface Props {
  content:  string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: Props) {
  const [show, setShow] = useState(false);

  const posClass = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className={`absolute ${posClass} z-50 whitespace-nowrap bg-oracle-card border border-oracle-border text-oracle-text text-xs font-mono px-2 py-1 rounded shadow-lg pointer-events-none`}>
          {content}
        </span>
      )}
    </span>
  );
}
