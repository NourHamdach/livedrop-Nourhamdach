import React from "react";

type Props = {
  src?: string; // make it optional
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

/**
 * Safe Image component with fixed default dimensions (300x300)
 * Handles undefined sources gracefully and optimizes Unsplash URLs
 */
export default function Image({
  src,
  alt,
  className = "",
  width = 300,
  height = 300,
}: Props) {
  // ✅ Handle missing or undefined src
  if (!src) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 text-xs ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        No Image
      </div>
    );
  }

  // ✅ Optimize Unsplash images only if src is valid
  const optimizedSrc = src.includes("unsplash.com")
    ? src.replace(/w=\d+/, `w=${width}`).replace(/&.*$/, "") + `&q=75`
    : src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      className={`object-cover rounded-lg ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: "cover",
        borderRadius: "0.75rem",
      }}
      onError={(e) => {
        // ✅ fallback placeholder on error
        (e.target as HTMLImageElement).src = "/placeholder.png";
      }}
    />
  );
}
