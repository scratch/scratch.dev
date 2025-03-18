import React from "react";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 font-mono">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
