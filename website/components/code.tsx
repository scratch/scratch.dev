import React from "react";

export default function code({ children }: { children: React.ReactNode }) {
  return <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">{children}</code>;
}
