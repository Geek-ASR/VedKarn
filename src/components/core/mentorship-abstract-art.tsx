
// src/components/core/mentorship-abstract-art.tsx
import { cn } from "@/lib/utils";
import type React from "react";

export function MentorshipAbstractArt({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative w-full max-w-xs h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] aspect-[4/3] overflow-hidden rounded-lg p-4",
        "bg-gradient-to-br from-sky-100 via-rose-50 to-amber-50",
        className
      )}
      {...props}
    >
      {/* Simplified Striped Background Layer */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={`bg-stripe-${i}`}
            className="h-full w-2 bg-sky-200/50"
            style={{
              position: 'absolute',
              left: `${i * 10 - 5}%`,
              transform: 'skewX(-20deg) translateX(-50%)',
            }}
          />
        ))}
      </div>

      {/* Content on top of stripes */}
      <div className="relative z-10 w-full h-full flex items-end justify-center">
        {/* Rainbow Hills/Arches */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5">
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-60 h-60 rounded-t-full bg-pink-300/70 opacity-80"></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-t-full bg-purple-300/60 opacity-70"></div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-t-full bg-indigo-300/50 opacity-60"></div>
        </div>

        {/* Mentor Figure (simplified) */}
        <div className="relative z-20 flex flex-col items-center mr-4">
          {/* Head */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-400 rounded-full mb-1 shadow-md"></div>
          {/* Body */}
          <div className="w-10 h-16 sm:w-12 sm:h-20 bg-rose-300 rounded-t-xl shadow-md"></div>
        </div>

        {/* Large White Circle behind Mentor */}
        <div className="absolute z-10 bottom-8 left-[calc(50%-2rem)] transform -translate-x-[60%] w-16 h-16 sm:w-20 sm:h-20 bg-white/70 rounded-full shadow-lg backdrop-blur-sm"></div>


        {/* Mentee Figure (simplified, slightly lower) */}
        <div className="relative z-20 flex flex-col items-center ml-2 self-end mb-[-5px]">
          {/* Head */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-400 rounded-full mb-0.5 shadow-md"></div>
          {/* Body */}
          <div className="w-8 h-12 sm:w-10 sm:h-16 bg-amber-300 rounded-t-lg shadow-md"></div>
        </div>

        {/* Stylized Clouds */}
        <div className="absolute top-4 left-4 w-10 h-6 sm:w-12 sm:h-8 bg-white/80 rounded-full shadow opacity-90"></div>
        <div className="absolute top-8 left-10 w-8 h-5 sm:w-10 sm:h-6 bg-white/70 rounded-full shadow-sm opacity-80"></div>
        <div className="absolute top-6 right-6 w-12 h-8 sm:w-14 sm:h-10 bg-white/80 rounded-t-full rounded-bl-full shadow opacity-90"></div>

        {/* Decorative Dots */}
        <div className="absolute top-12 right-20 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full opacity-70"></div>
        <div className="absolute top-16 left-16 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full opacity-70"></div>
        <div className="absolute bottom-24 right-8 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-400 rounded-full opacity-70"></div>
      </div>
    </div>
  );
}
