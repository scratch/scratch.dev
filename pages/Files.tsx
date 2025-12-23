import React from "react";

interface FileNode {
  name: string;
  depth: number;
  isLast: boolean;
  parentIsLast: boolean[];
}

function parseTree(text: string): FileNode[] {
  const lines = text.trim().split("\n");
  const nodes: FileNode[] = [];

  // Stack of { depth, isLast } for each open folder level
  const stack: { depth: number; isLast: boolean }[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Find where the actual filename starts
    const nameMatch = line.match(/[^\s│|├└─]/);
    if (!nameMatch) continue;

    const nameStart = nameMatch.index!;
    const prefix = line.slice(0, nameStart);
    const name = line.slice(nameStart).trim();

    if (!name) continue;

    const isLast = prefix.includes("└");
    const hasBranch = prefix.includes("├") || prefix.includes("└");

    // Count │ to know how many non-last ancestors
    const pipeCount = (prefix.match(/[│|]/g) || []).length;

    let depth: number;

    if (!hasBranch && prefix.length === 0) {
      // Root item
      depth = 0;
      stack.length = 0;
    } else {
      // Pop stack until we find the right parent level
      // pipeCount tells us how many ancestors are still "open" (not last)
      while (stack.length > 0) {
        const openCount = stack.filter((s) => !s.isLast).length;
        if (openCount <= pipeCount) break;
        stack.pop();
      }

      depth = stack.length + 1;
    }

    // Update stack
    if (isLast) {
      // Pop items at this depth or deeper
      while (stack.length >= depth) {
        stack.pop();
      }
    }

    // Build parentIsLast array from stack
    const parentIsLast = stack.map((s) => s.isLast);

    const isFolder = name.endsWith("/") || !name.includes(".");

    nodes.push({
      name,
      depth,
      isLast,
      parentIsLast,
    });

    // If this is a folder, push to stack for potential children
    if (isFolder) {
      stack.push({ depth, isLast });
    }
  }

  return nodes;
}

function FileRow({ node }: { node: FileNode }) {
  const isFolder = node.name.endsWith("/") || !node.name.includes(".");

  return (
    <div className="flex items-stretch h-7 font-mono text-sm">
      {/* Render vertical lines for each parent level */}
      {node.parentIsLast.map((parentLast, i) => (
        <div key={i} className="w-5 flex-shrink-0 relative">
          {!parentLast && (
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-300" />
          )}
        </div>
      ))}

      {/* Render the branch for this node */}
      {node.depth > 0 && (
        <div className="w-5 flex-shrink-0 relative">
          {/* Vertical line (full height if not last, half if last) */}
          <div
            className={`absolute left-2 w-px bg-gray-300 ${
              node.isLast ? "top-0 h-1/2" : "top-0 bottom-0"
            }`}
          />
          {/* Horizontal line */}
          <div className="absolute left-2 top-1/2 w-3 h-px bg-gray-300" />
        </div>
      )}

      {/* File/folder name */}
      <span className={`flex items-center ${isFolder ? "text-gray-700" : "text-gray-600"}`}>
        {node.name}
      </span>
    </div>
  );
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (!children) return "";

  if (Array.isArray(children)) {
    return children.map(extractText).join("\n");
  }

  if (typeof children === "object" && "props" in children) {
    const el = children as React.ReactElement;
    // If it's a <p> tag or similar, extract and add newline
    if (el.type === "p" || el.type === "br") {
      return extractText(el.props.children) + "\n";
    }
    return extractText(el.props.children);
  }

  return "";
}

export default function Files({ children }: { children: React.ReactNode }) {
  const text = extractText(children);
  const nodes = parseTree(text);

  return (
    <div className="not-prose my-6 py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
      {nodes.map((node, i) => (
        <FileRow key={i} node={node} />
      ))}
    </div>
  );
}
