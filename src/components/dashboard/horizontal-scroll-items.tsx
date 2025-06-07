
"use client";

import { cn } from "@/lib/utils";

interface HorizontalScrollItemsProps {
  items: string[];
  direction?: "left" | "right";
  speed?: string; // e.g., "20s", "30s", "40s"
  className?: string;
  itemClassName?: string;
}

export function HorizontalScrollItems({
  items,
  direction = "left",
  speed = "40s", // Default speed
  className,
  itemClassName,
}: HorizontalScrollItemsProps) {
  // Duplicate items for seamless looping effect
  const duplicatedItems = [...items, ...items];

  const animationName = direction === "left" ? "animate-scrollLeft" : "animate-scrollRight";
  
  return (
    <div
      className={cn(
        "w-full overflow-hidden group flex", // Use flex for containing the animation
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-around whitespace-nowrap",
           animationName // Apply the animation class from tailwind.config.ts
        )}
        style={{ animationDuration: speed }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className={cn(
              "mx-2 md:mx-3 py-1.5 px-3 md:py-2 md:px-4 rounded-full bg-muted hover:bg-accent/20 transition-colors cursor-pointer shadow-sm border border-transparent hover:border-accent",
              itemClassName
            )}
          >
            <span className="text-xs md:text-sm font-medium text-foreground/80 group-hover:text-accent">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
