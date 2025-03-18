import React from "react";

export default function h1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-4xl font-bold mb-8">{children}</h1>;
}
