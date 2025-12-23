import React from 'react';

/**
 * A simple wrapper applied to every page in the demo project. Feel free to
 * replace this with your own layout – the scratch CLI will automatically detect
 * the component and wrap each MDX page with it during the build.
 */
export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-white prose max-w-2xl mx-auto px-6 py-8">
      <div className="not-prose flex justify-center gap-4 mb-4">
        <a href="https://github.com/scratch/scratch" target="_blank" rel="noopener noreferrer" className="opacity-30 hover:opacity-100 transition-opacity">
          <img src="/github-mark.svg" alt="GitHub" className="w-6 h-6" />
        </a>
        <a href="https://x.com/koomen" target="_blank" rel="noopener noreferrer" className="opacity-30 hover:opacity-100 transition-opacity">
          <img src="/x-logo.svg" alt="X" className="w-6 h-6" />
        </a>
      </div>
      {children}
      <footer className="text-center text-gray-400 text-sm mt-16 pb-8">
        Released under the MIT License
        <br />
        Copyright 2025 Pete Koomen
      </footer>
    </div>
  );
}
