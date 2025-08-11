// Note: Cloudinary v2 SDK is for server-side only
// Client-side operations will use fetch API to call our API routes

// Cloudinary image service for handling image operations

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path in Cloudinary (e.g., 'products')
 * @returns {Promise<{success: boolean, url?: string, publicId?: string, error?: string}>}
 */
export const uploadImage = async (file, folder = 'products') => {
  try {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }

    // Validate file size (max 10MB for Cloudinary free tier)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size too large. Maximum size is 10MB.' };
    }

    // Convert file to base64
    const base64 = await convertFileToBase64(file);
    
    // Upload via API route
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64, folder: folder })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Upload failed' };
    }

    const result = await response.json();
    return {
      success: true,
      url: result.url,
      publicId: result.publicId
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files to upload
 * @param {string} folder - The folder path in Cloudinary
 * @returns {Promise<{success: boolean, urls?: string[], publicIds?: string[], errors?: string[]}>}
 */
export const uploadMultipleImages = async (files, folder = 'products') => {
  try {
    if (!files || files.length === 0) {
      return { success: false, error: 'No files provided' };
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        error: 'All uploads failed',
        errors: failedUploads.map(result => result.error)
      };
    }

    return {
      success: true,
      urls: successfulUploads.map(result => result.url),
      publicIds: successfulUploads.map(result => result.publicId),
      errors: failedUploads.length > 0 ? failedUploads.map(result => result.error) : undefined
    };
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} imageUrl - The Cloudinary image URL or public ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      return { success: false, error: 'No image URL provided' };
    }

    // Delete via API route
    const response = await fetch('/api/delete-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Delete failed' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} imageUrls - Array of Cloudinary image URLs or public IDs
 * @returns {Promise<{success: boolean, results?: any[], error?: string}>}
 */
export const deleteMultipleImages = async (imageUrls) => {
  try {
    if (!imageUrls || imageUrls.length === 0) {
      return { success: true, results: [] };
    }

    const deletePromises = imageUrls.map(url => deleteImage(url));
    const results = await Promise.all(deletePromises);

    const failedDeletions = results.filter(result => !result.success);

    return {
      success: failedDeletions.length === 0,
      results: results,
      error: failedDeletions.length > 0 ? `${failedDeletions.length} deletions failed` : undefined
    };
  } catch (error) {
    console.error('Error in deleteMultipleImages:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Compress and resize image on client side before upload
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>}
 */
export const compressImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Return the original file if not in browser (server-side)
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      // Fallback: return original file if image processing fails
      resolve(file);
    };

    // Check if URL.createObjectURL is available
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      // Return original file if URL.createObjectURL is not available
      resolve(file);
      return;
    }

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Check if URL is a Cloudinary URL
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com');
};

/**
 * Get optimized image URL with transformations
 * @param {string} url - The original Cloudinary image URL
 * @param {Object} options - Transformation options
 * @returns {string}
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!isCloudinaryUrl(url)) return url;
  
  const {
    width = 400,
    height = 400,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  // Insert transformations into Cloudinary URL
  const transformation = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
  
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformation}/`);
  }
  
  return url;
};

/**
 * Convert File to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>}
 */
const convertFileToBase64 = (file) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof FileReader === 'undefined') {
    return Promise.reject(new Error('FileReader not available in server environment'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Helper functions for server-side operations are handled by API routes