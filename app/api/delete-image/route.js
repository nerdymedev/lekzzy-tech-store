import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url) {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after version (v1234567890)
    const afterUpload = urlParts.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex(part => part.startsWith('v'));
    
    if (versionIndex !== -1) {
      // Remove file extension and join the path
      const publicId = afterUpload.slice(versionIndex + 1).join('/').replace(/\.[^/.]+$/, '');
      return publicId;
    }

    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

export async function DELETE(request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { message: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Extract public ID from URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      return NextResponse.json(
        { message: 'Could not extract public ID from URL' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        publicId: publicId
      });
    } else {
      return NextResponse.json(
        { success: false, message: `Failed to delete image: ${result.result}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { success: false, message: 'Delete failed', error: error.message },
      { status: 500 }
    );
  }
}