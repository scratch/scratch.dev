import React, { useState, useEffect, useRef } from "react";

export default function BouncingDvdLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cornerHits, setCornerHits] = useState(0);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [velocity, setVelocity] = useState({ x: 2, y: 1.5 });
  const [color, setColor] = useState("#8b5cf6");

  const logoWidth = 80;
  const logoHeight = 40;

  const colors = [
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#ef4444", // red
  ];

  const getRandomColor = () => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    return newColor === color ? colors[(colors.indexOf(color) + 1) % colors.length] : newColor;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      setPosition((prev) => {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let hitX = false;
        let hitY = false;

        // Check horizontal bounds
        if (newX <= 0) {
          newX = 0;
          hitX = true;
          setVelocity((v) => ({ ...v, x: Math.abs(v.x) }));
          setColor(getRandomColor());
        } else if (newX >= containerWidth - logoWidth) {
          newX = containerWidth - logoWidth;
          hitX = true;
          setVelocity((v) => ({ ...v, x: -Math.abs(v.x) }));
          setColor(getRandomColor());
        }

        // Check vertical bounds
        if (newY <= 0) {
          newY = 0;
          hitY = true;
          setVelocity((v) => ({ ...v, y: Math.abs(v.y) }));
          if (!hitX) setColor(getRandomColor());
        } else if (newY >= containerHeight - logoHeight) {
          newY = containerHeight - logoHeight;
          hitY = true;
          setVelocity((v) => ({ ...v, y: -Math.abs(v.y) }));
          if (!hitX) setColor(getRandomColor());
        }

        // Corner hit!
        if (hitX && hitY) {
          setCornerHits((c) => c + 1);
        }

        return { x: newX, y: newY };
      });
    };

    const intervalId = setInterval(animate, 16);
    return () => clearInterval(intervalId);
  }, [velocity]);

  return (
    <div className="not-prose my-6">
      <div
        ref={containerRef}
        className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
      >
        <div
          className="absolute"
          style={{
            left: position.x,
            top: position.y,
            width: logoWidth,
            height: logoHeight,
          }}
        >
          <div
            className="transition-colors duration-300"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: color,
              maskImage: "url(/DVD_logo.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: "url(/DVD_logo.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
          />
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        Corner hits: {cornerHits}
      </p>
    </div>
  );
}
