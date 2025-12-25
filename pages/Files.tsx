import React, { useState, useRef, useEffect } from "react";

// Tree node structure from parsing
interface TreeNode {
  id: string;
  name: string;
  comment?: string;
  children: TreeNode[];
  startCollapsed: boolean;
}

// Flattened node for rendering
interface RenderNode {
  id: string;
  name: string;
  comment?: string;
  depth: number;
  isLast: boolean;
  parentIsLast: boolean[];
  isFolder: boolean;
  hasChildren: boolean;
}

function parseTree(text: string): TreeNode[] {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse lines - support both whitespace and dash-prefix for indentation
  const items = lines.map((line, index) => {
    const dashMatch = line.match(/^(-+)/);
    let name: string;
    let indent: number;
    let comment: string | undefined;

    if (dashMatch) {
      name = line.slice(dashMatch[1].length);
      indent = dashMatch[1].length;
    } else {
      name = line.trim();
      indent = line.length - line.trimStart().length;
    }

    // Check for # comment
    const commentMatch = name.match(/\s*#\s*(.*)$/);
    if (commentMatch) {
      comment = commentMatch[1].trim();
      name = name.slice(0, commentMatch.index).trim();
    }

    // Check for (collapsed) suffix
    const collapsedMatch = name.match(/\s*\(collapsed\)\s*$/i);
    const startCollapsed = !!collapsedMatch;
    if (collapsedMatch) {
      name = name.slice(0, collapsedMatch.index).trim();
    }

    return { name, indent, comment, startCollapsed, lineIndex: index };
  });

  // Normalize indents by subtracting the minimum
  const baseIndent = Math.min(...items.map((item) => item.indent));
  items.forEach((item) => (item.indent -= baseIndent));

  // Build tree using a stack
  const roots: TreeNode[] = [];
  const stack: { node: TreeNode; indent: number }[] = [];

  for (const { name, indent, comment, startCollapsed, lineIndex } of items) {
    const node: TreeNode = {
      id: `node-${lineIndex}`,
      name,
      comment,
      children: [],
      startCollapsed,
    };

    // Pop stack until we find the parent (item with smaller indent)
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ node, indent });
  }

  return roots;
}

function flattenTree(
  roots: TreeNode[],
  collapsedIds: Set<string>
): RenderNode[] {
  const result: RenderNode[] = [];

  function traverse(
    nodes: TreeNode[],
    depth: number,
    parentIsLast: boolean[]
  ): void {
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const isFolder = node.name.endsWith("/");
      const hasChildren = node.children.length > 0;

      result.push({
        id: node.id,
        name: node.name,
        comment: node.comment,
        depth,
        isLast,
        parentIsLast: [...parentIsLast],
        isFolder,
        hasChildren,
      });

      // Only traverse children if not collapsed
      if (hasChildren && !collapsedIds.has(node.id)) {
        traverse(node.children, depth + 1, [...parentIsLast, isLast]);
      }
    });
  }

  traverse(roots, 0, []);
  return result;
}

function getInitialCollapsed(roots: TreeNode[]): Set<string> {
  const collapsed = new Set<string>();

  function traverse(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.startCollapsed) {
        collapsed.add(node.id);
      }
      traverse(node.children);
    }
  }

  traverse(roots);
  return collapsed;
}

const ROW_HEIGHT = 28; // h-7 = 1.75rem = 28px

interface FileRowProps {
  node: RenderNode;
  isCollapsed: boolean;
  onToggle: () => void;
  animationState?: "entering" | "exiting" | "none";
  slideOffset?: number; // pixels to translate Y
  isSliding?: boolean;
  isHidden?: boolean;
}

function FileRow({
  node,
  isCollapsed,
  onToggle,
  animationState = "none",
  slideOffset = 0,
  isSliding = false,
  isHidden = false,
}: FileRowProps) {
  const isClickable = node.isFolder;
  const isDotfile = node.name.startsWith(".");

  const classes = ["flex", "items-center", "h-7", "font-mono", "text-sm"];

  if (animationState === "entering") classes.push("animate-fade-in");
  if (animationState === "exiting") classes.push("animate-fade-out");
  if (isSliding) classes.push("animate-slide");

  const style: React.CSSProperties = {};
  if (isSliding && slideOffset !== 0) {
    (style as Record<string, string>)["--slide-offset"] = `${slideOffset}px`;
  }
  if (isHidden) {
    style.opacity = 0;
  }

  return (
    <div className={classes.join(" ")} style={style}>
      {/* Left side: indent + caret + name */}
      <div
        className="flex items-center w-52 flex-shrink-0"
        style={{ paddingLeft: `${node.depth * 1}rem` }}
      >
        {/* Caret for folders */}
        {isClickable ? (
          <button
            onClick={onToggle}
            className="w-4 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-150 ${isCollapsed ? "" : "rotate-90"}`}
            >
              <path d="M2 1L6 4L2 7" />
            </svg>
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        <span
          className={`flex items-center ${
            isDotfile
              ? "text-gray-400"
              : node.isFolder
                ? "text-gray-500 font-bold"
                : "text-gray-600"
          } ${isClickable ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}
          onClick={isClickable ? onToggle : undefined}
        >
          {node.name}
        </span>
      </div>

      {/* Right side: comment */}
      {node.comment && (
        <span className="text-gray-400 font-normal whitespace-nowrap">
          {node.comment}
        </span>
      )}
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
    if (el.type === "p" || el.type === "br") {
      return extractText(el.props.children) + "\n";
    }
    return extractText(el.props.children);
  }

  return "";
}

interface FilesProps {
  content?: string;
  children?: React.ReactNode;
}

const ANIMATION_DURATION = 1000; // ms

type AnimationPhase =
  | "idle"
  | "expanding-slide" // items below sliding down
  | "expanding-fade" // new items fading in
  | "collapsing-fade" // items fading out
  | "collapsing-slide"; // items below sliding up

interface AnimationInfo {
  phase: AnimationPhase;
  toggledFolderId: string | null;
  enteringIds: Set<string>;
  exitingNodes: RenderNode[];
  itemCount: number; // number of items entering or exiting
}

const IDLE_ANIMATION: AnimationInfo = {
  phase: "idle",
  toggledFolderId: null,
  enteringIds: new Set(),
  exitingNodes: [],
  itemCount: 0,
};

export default function Files({ content, children }: FilesProps) {
  const text = content ?? extractText(children);
  const [tree] = useState(() => parseTree(text));
  const [collapsedIds, setCollapsedIds] = useState(() =>
    getInitialCollapsed(tree)
  );

  // Force re-render trigger
  const [, forceUpdate] = useState(0);

  // Store animation state in ref for synchronous access during render
  const animRef = useRef<AnimationInfo>(IDLE_ANIMATION);

  // Track previous state for detecting changes
  const prevStateRef = useRef<{
    collapsedIds: Set<string>;
    visibleIds: Set<string>;
  }>({
    collapsedIds: new Set(collapsedIds),
    visibleIds: new Set(),
  });

  const currentNodes = flattenTree(tree, collapsedIds);
  const currentVisibleIds = new Set(currentNodes.map((n) => n.id));

  // Initialize prev visible IDs on first render
  if (prevStateRef.current.visibleIds.size === 0) {
    prevStateRef.current.visibleIds = currentVisibleIds;
  }

  // Synchronously detect toggle and set up animation during render
  const prevCollapsed = prevStateRef.current.collapsedIds;
  const prevVisibleIds = prevStateRef.current.visibleIds;

  let toggledFolder: { id: string; expanded: boolean } | null = null;
  for (const id of collapsedIds) {
    if (!prevCollapsed.has(id)) {
      toggledFolder = { id, expanded: false };
      break;
    }
  }
  if (!toggledFolder) {
    for (const id of prevCollapsed) {
      if (!collapsedIds.has(id)) {
        toggledFolder = { id, expanded: true };
        break;
      }
    }
  }

  // If a toggle just happened and we're idle, start the animation synchronously
  if (toggledFolder && animRef.current.phase === "idle") {
    const allNodesFlat = flattenTree(tree, new Set());

    if (toggledFolder.expanded) {
      // Expanding: find entering nodes
      const entering = new Set<string>();
      for (const id of currentVisibleIds) {
        if (!prevVisibleIds.has(id)) {
          entering.add(id);
        }
      }

      if (entering.size > 0) {
        animRef.current = {
          phase: "expanding-slide",
          toggledFolderId: toggledFolder.id,
          enteringIds: entering,
          exitingNodes: [],
          itemCount: entering.size,
        };
      }
    } else {
      // Collapsing: find exiting nodes
      const exiting: RenderNode[] = [];
      for (const id of prevVisibleIds) {
        if (!currentVisibleIds.has(id)) {
          const node = allNodesFlat.find((n) => n.id === id);
          if (node) exiting.push(node);
        }
      }

      if (exiting.length > 0) {
        animRef.current = {
          phase: "collapsing-fade",
          toggledFolderId: toggledFolder.id,
          enteringIds: new Set(),
          exitingNodes: exiting,
          itemCount: exiting.length,
        };
      }
    }

    // Update prev state
    prevStateRef.current = {
      collapsedIds: new Set(collapsedIds),
      visibleIds: currentVisibleIds,
    };
  }

  // Get current animation state from ref
  const animation = animRef.current;

  // Transition between animation phases using effect
  useEffect(() => {
    if (animRef.current.phase === "idle") return;

    const timer = setTimeout(() => {
      switch (animRef.current.phase) {
        case "expanding-slide":
          animRef.current = { ...animRef.current, phase: "expanding-fade" };
          forceUpdate((n) => n + 1);
          break;
        case "expanding-fade":
          animRef.current = IDLE_ANIMATION;
          forceUpdate((n) => n + 1);
          break;
        case "collapsing-fade":
          animRef.current = { ...animRef.current, phase: "collapsing-slide" };
          forceUpdate((n) => n + 1);
          break;
        case "collapsing-slide":
          animRef.current = IDLE_ANIMATION;
          forceUpdate((n) => n + 1);
          break;
      }
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [animation.phase]);

  const toggleCollapse = (id: string) => {
    if (animRef.current.phase !== "idle") return; // Don't allow toggling during animation

    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Build the list of nodes to render
  const { phase, toggledFolderId, enteringIds, exitingNodes, itemCount } =
    animation;

  // For collapsing, we need to include exiting nodes in the render
  const allNodes = [...currentNodes];

  if (phase === "collapsing-fade") {
    // Insert exiting nodes after the toggled folder (only during fade, not slide)
    const folderIndex = allNodes.findIndex((n) => n.id === toggledFolderId);
    if (folderIndex !== -1) {
      allNodes.splice(folderIndex + 1, 0, ...exitingNodes);
    }
  }

  // Find the index of the toggled folder to determine which items slide
  const toggledFolderIndex = allNodes.findIndex(
    (n) => n.id === toggledFolderId
  );

  const getAnimationState = (
    nodeId: string
  ): "entering" | "exiting" | "none" => {
    if (phase === "expanding-fade" && enteringIds.has(nodeId)) {
      return "entering";
    }
    if (
      phase === "collapsing-fade" &&
      exitingNodes.some((n) => n.id === nodeId)
    ) {
      return "exiting";
    }
    return "none";
  };

  const getSlideOffset = (index: number): number => {
    if (toggledFolderIndex === -1) return 0;

    // For expanding-slide: items below the new content need to slide down first
    // The entering items are already in the list, so items after them slide
    if (phase === "expanding-slide") {
      // Find the first entering item's index
      const firstEnteringIndex = allNodes.findIndex((n) =>
        enteringIds.has(n.id)
      );
      if (firstEnteringIndex !== -1 && index >= firstEnteringIndex) {
        // Items at or after the first entering item
        if (enteringIds.has(allNodes[index].id)) {
          // Entering items start invisible (handled by opacity)
          return 0;
        }
        // Items below slide down from above (start offset, will animate to 0)
        return -itemCount * ROW_HEIGHT;
      }
    }

    // For collapsing-slide: items below the folder slide up from their old positions
    // Exiting nodes are no longer in the DOM, so items are at final positions
    // We offset them down (positive) to their old visual positions, then animate to 0
    if (phase === "collapsing-slide") {
      if (index > toggledFolderIndex) {
        return itemCount * ROW_HEIGHT;
      }
    }

    return 0;
  };

  const isSliding = (index: number): boolean => {
    if (toggledFolderIndex === -1) return false;

    if (phase === "expanding-slide") {
      const firstEnteringIndex = allNodes.findIndex((n) =>
        enteringIds.has(n.id)
      );
      if (firstEnteringIndex !== -1 && index >= firstEnteringIndex) {
        return !enteringIds.has(allNodes[index].id);
      }
    }

    if (phase === "collapsing-slide") {
      return index > toggledFolderIndex;
    }

    return false;
  };

  // Hide entering items during slide phase (before they fade in)
  const isHidden = (nodeId: string): boolean => {
    return phase === "expanding-slide" && enteringIds.has(nodeId);
  };

  return (
    <div className="not-prose my-6 py-4 px-4 overflow-x-auto">
      {allNodes.map((node, index) => (
        <FileRow
          key={node.id}
          node={node}
          isCollapsed={collapsedIds.has(node.id)}
          onToggle={() => toggleCollapse(node.id)}
          animationState={getAnimationState(node.id)}
          slideOffset={getSlideOffset(index)}
          isSliding={isSliding(index)}
          isHidden={isHidden(node.id)}
        />
      ))}
    </div>
  );
}
