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
    // Firebase Storage URLs with tokens are tricky to parse with new URL().
    // A more reliable method is string manipulation.
    const urlWithoutToken = originalUrl.split('?alt=media')[0];
    const tokenPart = originalUrl.split('?alt=media')[1] || '';

    const dotIndex = urlWithoutToken.lastIndexOf('.');
    const slashIndex = urlWithoutToken.lastIndexOf('/');

    if (dotIndex === -1 || slashIndex === -1 || dotIndex < slashIndex) {
      // Not a file URL we can resize
      return originalUrl;
    }
    
    const path = urlWithoutToken.substring(0, dotIndex);
    const extension = urlWithoutToken.substring(dotIndex); // e.g., '.png'

    // The firebase extension encodes the path, so we don't need to double-encode
    const resizedPath = `${path}_${size}${extension}`;
    
    // Construct the full URL with the token
    const resizedUrl = `${resizedPath}?alt=media${tokenPart}`;
    
    // For now, let's just return the original URL as the extension isn't confirmed to be working.
    // This will at least display the uploaded image.
    // In a real scenario with the extension confirmed, you'd use `resizedUrl`.
    // We can add a check or error handling here in a real app.
    return originalUrl;

  } catch (error) {
    console.error("Error creating resized image URL:", error);
    return originalUrl; // Fallback to original URL on error
  }
}
