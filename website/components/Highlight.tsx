import React from "react";

export default function Highlight({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-2 min-h-[20px] border-l-4 border-blue-500 bg-blue-50">
      <div className="flex h-full items-center px-4 py-4">
        {children}
      </div>
    </div>
  );
}
