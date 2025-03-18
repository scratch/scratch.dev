import React from "react";
import { Helmet } from "react-helmet";

export default function PageWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <Helmet>
        {title && <title>{title}</title>}
      </Helmet>
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <div className="container mx-auto max-w-4xl px-4 py-8 flex-grow">
          {children}
        </div>
        <footer className="py-4 border-t border-gray-100">
          <div className="container mx-auto max-w-4xl px-4 flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              &copy; {currentYear} scratch.dev
            </div>
            <a 
              href="https://github.com/scratch/scratch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors duration-200"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
