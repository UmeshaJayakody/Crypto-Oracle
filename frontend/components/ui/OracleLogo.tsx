interface OracleLogoProps {
  className?: string;
  size?: number;
}

/**
 * Crypto Oracle brand logo (inline SVG for theme-aware fill colours).
 * The accent shape uses oracle-cyan; the main shape uses oracle-text.
 */
export function OracleLogo({ className = "", size = 32 }: OracleLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={Math.round((size * 155) / 168)}
      viewBox="0 0 168 155"
      className={className}
      aria-label="Crypto Oracle logo"
    >
      {/* Accent / shadow shape — oracle-cyan tinted */}
      <path
        fill="var(--color-oracle-cyan)"
        fillOpacity="0.55"
        d="M119.055 47.0218C120.405 47.3667 122.336 48.1879 123.799 48.6385C130.147 52.1159 130.905 52.986 136.295 57.5762C140.135 62.3667 142.586 66.0201 144.656 71.745C150.294 87.3354 144.928 105.37 131.814 115.43C131.456 115.705 129.944 116.801 129.708 117.074C124.249 120.592 119.551 122.496 113.173 123.574C112.282 123.523 110.448 123.855 109.421 123.881C95.9381 124.224 82.3553 123.772 68.8787 124.134C69.4471 119.653 77.2112 86.6564 79.0421 84.4346C79.7698 83.5516 80.9706 82.6648 82.0675 82.3289C86.7048 80.9091 101.713 82.0212 108 81.4329C112.257 78.5167 112.727 72.0711 114.002 67.2843C115.792 60.5677 117.118 53.7222 119.055 47.0218Z"
      />
      {/* Main shape — oracle-text (near-white) */}
      <path
        fill="var(--color-oracle-text)"
        d="M66.2668 25.1088C74.9256 24.7911 83.7176 25.0476 92.3838 25.02C95.7077 25.0094 102.772 25.5302 105.746 24.9323C104.973 29.8432 98.0187 59.5326 96.2047 61.6713C95.4875 62.5168 94.5965 63.2524 93.5195 63.5733C88.5574 65.0523 73.6905 63.9843 67.2118 64.5552C64.0153 66.7389 63.5945 69.1699 62.7209 72.7785C61.2005 79.0594 59.7618 85.3621 58.2146 91.6364C57.3452 95.0891 56.575 98.566 55.905 102.063C13.4165 88.5218 20.8992 27.2934 66.2668 25.1088Z"
      />
    </svg>
  );
}
