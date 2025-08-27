import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getResizedImageUrl(originalUrl: string | undefined, size: string): string | undefined {
  if (!originalUrl) {
    return undefined;
  }
  
  try {
    const url = new URL(originalUrl);
    const pathSegments = url.pathname.split('/');
    const encodedFileName = pathSegments.pop() || '';
    const fileName = decodeURIComponent(encodedFileName);

    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) {
      return originalUrl; // Cannot determine file extension
    }

    const name = fileName.substring(0, dotIndex);
    const newFileName = `${name}_${size}.webp`;

    // Re-encode the new file name to handle special characters
    const newEncodedFileName = encodeURIComponent(newFileName);
    
    pathSegments.push(newEncodedFileName);
    url.pathname = pathSegments.join('/');

    return url.toString();
  } catch (error) {
    console.error("Error creating resized image URL:", error);
    return originalUrl; // Fallback to original URL on error
  }
}
