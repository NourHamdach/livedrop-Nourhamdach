import React from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}

/**
 * Image component with fixed default dimensions (200x200)
 * Automatically optimizes Unsplash URLs and keeps aspect ratio using object-cover
 */
export default function Image({
  src,
  alt,
  className = '',
  width = 300,
  height = 300,
}: Props) {
  // Optimize Unsplash images by enforcing width parameter
  const optimizedSrc = src.includes('unsplash.com')
    ? src.replace(/w=\d+/, `w=${width}`).replace(/&.*$/, '') + `&q=75`
    : src

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
        objectFit: 'cover',
        borderRadius: '0.75rem',
      }}
    />
  )
}
