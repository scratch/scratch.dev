import React from "react";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
