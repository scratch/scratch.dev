import React from "react";

export default function p({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 mb-6">{children}</p>;
}
