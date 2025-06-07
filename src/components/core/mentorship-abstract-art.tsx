
// src/components/core/mentorship-abstract-art.tsx
import { cn } from "@/lib/utils";
import type React from "react";

export function MentorshipAbstractArt({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative w-full max-w-xs h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] aspect-[4/3] overflow-hidden rounded-lg p-4",
        "bg-gradient-to-br from-sky-100 via-rose-50 to-amber-50", // Main background gradient
        className
      )}
      {...props}
    >
      {/* Striped Background Layer - more subtle */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={`bg-stripe-${i}`}
            className="h-full w-1.5 bg-sky-200/30" // Thinner stripes, less opaque
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
        {/* Rainbow Hills/Arches - slightly adjusted opacities for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5">
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-60 h-60 rounded-t-full bg-pink-300/60 opacity-70"></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-t-full bg-purple-300/50 opacity-60"></div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-t-full bg-indigo-300/40 opacity-50"></div>
        </div>

        {/* Mentor Figure - more rounded, slight shadow, subtle float, entrance animation */}
        <div 
            className="relative z-30 flex flex-col items-center mr-3 transform transition-transform hover:scale-105 animate-gentleFloat opacity-0 animate-fadeInScaleUp" 
            style={{animationDelay: '0.5s, 0.2s'}} // fadeInScaleUp delay, gentleFloat delay
        >
          {/* Head */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-400 rounded-full mb-1 shadow-lg"></div>
          {/* Body - more rounded top */}
          <div className="w-10 h-16 sm:w-12 sm:h-20 bg-rose-300 rounded-t-2xl shadow-lg"></div>
        </div>

        {/* Large White Circle - positioned to better connect figures visually, entrance animation */}
        <div 
            className="absolute z-20 bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 bg-white/80 rounded-full shadow-2xl backdrop-blur-sm opacity-0 animate-fadeInScaleUp"
            style={{animationDelay: '0.6s'}}
        ></div>

        {/* Mentee Figure - more rounded, slight shadow, subtle float, entrance animation */}
        <div 
            className="relative z-30 flex flex-col items-center ml-3 self-end mb-[-5px] transform transition-transform hover:scale-105 animate-gentleFloat opacity-0 animate-fadeInScaleUp" 
            style={{animationDelay: '0.7s, 0s'}} // fadeInScaleUp delay, gentleFloat delay
        >
          {/* Head */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-400 rounded-full mb-0.5 shadow-lg"></div>
          {/* Body - more rounded top */}
          <div className="w-8 h-12 sm:w-10 sm:h-16 bg-amber-300 rounded-t-xl shadow-lg"></div>
        </div>

        {/* Stylized Clouds with subtle animation */}
        <div className="absolute top-4 left-4 w-10 h-6 sm:w-12 sm:h-8 bg-white/80 rounded-full shadow-md opacity-0 animate-fadeInScaleUp animate-gentleFloat" style={{animationDelay: '0.8s, 0s', animationDuration: '0.5s, 4s'}}></div>
        <div className="absolute top-8 left-10 w-8 h-5 sm:w-10 sm:h-6 bg-white/70 rounded-t-lg rounded-b-xl shadow opacity-0 animate-fadeInScaleUp animate-gentleFloat" style={{animationDelay: '0.9s, 0.5s', animationDuration: '0.5s, 5s'}}></div>
        <div className="absolute top-6 right-6 w-12 h-8 sm:w-14 sm:h-10 bg-white/80 rounded-t-full rounded-bl-full shadow-lg opacity-0 animate-fadeInScaleUp animate-gentleFloat" style={{animationDelay: '1.0s, 0.3s', animationDuration: '0.5s, 3.5s'}}></div>

        {/* Decorative Dots - slightly larger, more spread out */}
        <div className="absolute top-12 right-20 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-pink-400 rounded-full opacity-0 animate-fadeInScaleUp animate-pulse" style={{animationDelay: '1.1s'}}></div>
        <div className="absolute top-16 left-16 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full opacity-0 animate-fadeInScaleUp animate-pulse" style={{animationDelay: '1.2s, 0.2s'}}></div>
        <div className="absolute bottom-24 right-8 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full opacity-0 animate-fadeInScaleUp animate-pulse" style={{animationDelay: '1.3s, 0.4s'}}></div>
        <div className="absolute bottom-16 left-6 w-2 h-2 bg-sky-300 rounded-full opacity-0 animate-fadeInScaleUp animate-pulse" style={{animationDelay: '1.4s, 0.6s'}}></div>
      </div>
    </div>
  );
}
