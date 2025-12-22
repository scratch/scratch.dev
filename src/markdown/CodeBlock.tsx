import React, { useState, useRef } from 'react';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CodeBlock({ children, className, style, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (!preRef.current) return;

    const code = preRef.current.textContent || '';
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter out background styles from Shiki to let CSS control it
  const filteredStyle = style ? Object.fromEntries(
    Object.entries(style).filter(([key]) =>
      !key.toLowerCase().includes('background')
    )
  ) : undefined;

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="copy-button"
        aria-label="Copy code"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre ref={preRef} className={className} style={filteredStyle} {...props}>
        {children}
      </pre>
    </div>
  );
}
