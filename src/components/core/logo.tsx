import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="38"
      aria-label="MentorVerse Logo"
      {...props}
    >
      <rect width="200" height="50" fill="hsl(var(--primary))" rx="5" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))"
      >
        MentorVerse
      </text>
    </svg>
  );
}