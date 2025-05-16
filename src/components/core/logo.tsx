import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  // Using theme colors directly in SVG.
  // --primary for dark parts of the icon and text.
  // --card (typically white/light) for the "cutout" parts of the icon.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50" // Icon (approx 50x50) + Text
      aria-label="VedKarn Logo"
      {...props} // Width and height should be passed or default e.g. width="200" height="50"
    >
      {/* Graphical Icon Part */}
      <g transform="translate(0,0)">
        {/* Base of the icon - dark circle */}
        <circle cx="25" cy="25" r="25" fill="hsl(var(--primary))" />

        {/* Sun - light 'cutout' color */}
        <circle cx="25" cy="19" r="7" fill="hsl(var(--card))" />
        {/* Sun Rays (simplified) - light 'cutout' color */}
        <path d="M25 7 L23 15 L27 15 Z" fill="hsl(var(--card))" /> {/* Top */}
        <path d="M35.36 12.64 L29.5 17.5 L31.5 21.5 Z" fill="hsl(var(--card))" /> {/* Top-Right */}
        <path d="M14.64 12.64 L20.5 17.5 L18.5 21.5 Z" fill="hsl(var(--card))" /> {/* Top-Left */}
        <path d="M38 25 L30 24 L30 28 Z" fill="hsl(var(--card))" /> {/* Right */}
        <path d="M12 25 L20 24 L20 28 Z" fill="hsl(var(--card))" /> {/* Left */}
        <path d="M33.5 30.5 L28.5 27.5 L29.5 23.5 Z" fill="hsl(var(--card))" /> {/* Approx Bottom-Right Ray */}
        <path d="M16.5 30.5 L21.5 27.5 L20.5 23.5 Z" fill="hsl(var(--card))" /> {/* Approx Bottom-Left Ray */}


        {/* Book (simplified) - light 'cutout' color */}
        <path d="M10 32 C15 30, 35 30, 40 32 L42 45 C35 48, 15 48, 8 45 Z" fill="hsl(var(--card))" />
        {/* Lines on book - primary color on 'cutout' book */}
        <rect x="12" y="34" width="26" height="1" fill="hsl(var(--primary))" />
        <rect x="12" y="37" width="26" height="1" fill="hsl(var(--primary))" />
        <rect x="12" y="40" width="26" height="1" fill="hsl(var(--primary))" />
        
        {/* Small stars (simplified) - light 'cutout' color */}
        <polygon points="15,12 15.5,13.5 17,13.5 16,14.5 16.5,16 15,15 13.5,16 14,14.5 13,13.5 14.5,13.5" fill="hsl(var(--card))" transform="scale(0.7) translate(5,2)" />
        <polygon points="35,12 35.5,13.5 37,13.5 36,14.5 36.5,16 35,15 33.5,16 34,14.5 33,13.5 34.5,13.5" fill="hsl(var(--card))" transform="scale(0.7) translate(15,2)"/>
        <polygon points="8,25 8.5,26.5 10,26.5 9,27.5 9.5,29 8,28 6.5,29 7,27.5 6,26.5 7.5,26.5" fill="hsl(var(--card))" transform="scale(0.6) translate(0,0)" />
        <polygon points="42,25 42.5,26.5 44,26.5 43,27.5 43.5,29 42,28 40.5,29 41,27.5 40,26.5 41.5,26.5" fill="hsl(var(--card))" transform="scale(0.6) translate(5,0)" />
      </g>
      
      {/* Text "VedKarn" */}
      <text
        x="58" // Start text after the icon + small gap
        y="50%"
        dominantBaseline="middle"
        fontFamily="var(--font-inter), Arial, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--primary))" // Text color is primary
      >
        VedKarn
      </text>
    </svg>
  );
}
