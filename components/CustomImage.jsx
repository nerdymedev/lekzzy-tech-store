import React from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const CustomImage = ({ src, alt, className, width, height, ...props }) => {
  // Check if src is a base64 data URL
  const isBase64 = src && typeof src === 'string' && src.startsWith('data:');
  const isValidUrl = src && typeof src === 'string' && src.startsWith('http');
  const isImportedAsset = src && typeof src === 'object' && src.src; // For imported SVGs/images
  
  // Use fallback if src is invalid
  let imageSrc;
  if (isBase64 || isValidUrl) {
    imageSrc = src;
  } else if (isImportedAsset) {
    imageSrc = src; // Next.js handles imported assets
  } else {
    imageSrc = assets.upload_area;
  }
  
  // For base64 images, use regular img tag to avoid Next.js optimization issues
  if (isBase64) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        {...props}
      />
    );
  }
  
  // For URLs, imported assets, and fallback, use Next.js Image component
  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default CustomImage;