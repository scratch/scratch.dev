import React from "react";
import { Helmet } from "react-helmet";

export default function PageWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <>
      <Helmet>
        {title && <title>{title}</title>}
      </Helmet>
      <div className="min-h-screen bg-white font-sans">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {children}
        </div>
      </div>
    </>
  );
}
