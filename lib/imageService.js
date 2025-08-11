import { supabase } from './supabase';

// Image service for handling Supabase Storage operations

/**
 * Upload a single image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path in storage (e.g., 'products')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (file, folder = 'products') => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size too large. Maximum size is 5MB.' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload multiple images to Supabase Storage
 * @param {File[]} files - Array of image files to upload
 * @param {string} folder - The folder path in storage
 * @returns {Promise<{success: boolean, urls?: string[], errors?: string[]}>}
 */
export const uploadMultipleImages = async (files, folder = 'products') => {
  try {
    if (!files || files.length === 0) {
      return { success: false, errors: ['No files provided'] };
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        errors: failedUploads.map(result => result.error)
      };
    }

    return {
      success: true,
      urls: successfulUploads.map(result => result.url),
      errors: failedUploads.length > 0 ? failedUploads.map(result => result.error) : undefined
    };
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    return { success: false, errors: [error.message] };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - The public URL of the image to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    if (!imageUrl) {
      return { success: false, error: 'No image URL provided' };
    }

    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'products');
    
    if (bucketIndex === -1) {
      return { success: false, error: 'Invalid image URL format' };
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from('products')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete multiple images from Supabase Storage
 * @param {string[]} imageUrls - Array of image URLs to delete
 * @returns {Promise<{success: boolean, errors?: string[]}>}
 */
export const deleteMultipleImages = async (imageUrls) => {
  try {
    if (!imageUrls || imageUrls.length === 0) {
      return { success: true }; // Nothing to delete
    }

    const deletePromises = imageUrls.map(url => deleteImage(url));
    const results = await Promise.all(deletePromises);

    const failedDeletions = results.filter(result => !result.success);

    if (failedDeletions.length > 0) {
      return {
        success: false,
        errors: failedDeletions.map(result => result.error)
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteMultipleImages:', error);
    return { success: false, errors: [error.message] };
  }
};

/**
 * Compress image before upload (client-side)
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width (default: 800)
 * @param {number} maxHeight - Maximum height (default: 800)
 * @param {number} quality - JPEG quality (default: 0.8)
 * @returns {Promise<File>}
 */
export const compressImage = async (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
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
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/jpeg',
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
 * Check if URL is a Supabase Storage URL
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export const isSupabaseStorageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('supabase.co/storage/v1/object/public/products/');
};

/**
 * Get optimized image URL with transformations
 * @param {string} url - The original image URL
 * @param {Object} options - Transformation options
 * @returns {string}
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!isSupabaseStorageUrl(url)) return url;
  
  const { width, height, quality = 80 } = options;
  
  // Supabase doesn't have built-in image transformations like Cloudinary
  // For now, return the original URL
  // In the future, you could integrate with a service like Cloudinary or ImageKit
  return url;
};