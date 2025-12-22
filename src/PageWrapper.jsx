import React from "react";

/**
 * A simple wrapper applied to every page in the demo project. Feel free to
 * replace this with your own layout – the scratch CLI will automatically detect
 * the component and wrap each MDX page with it during the build.
 */
export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 scratch-prose max-w-2xl mx-auto px-6 py-8">
      {children}
      <footer className="text-center text-gray-400 text-sm mt-16 pb-8">
        Released under the MIT License
        <br />
        Copyright 2025 Pete Koomen
      </footer>
    </div>
  );
}
