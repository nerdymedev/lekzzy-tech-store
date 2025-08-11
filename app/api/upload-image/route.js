import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request) {
  try {
    const { image, folder = 'products' } = await request.json();

    if (!image) {
      return NextResponse.json(
        { message: 'No image provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const publicId = `${folder}/${timestamp}-${randomString}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      public_id: publicId,
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { message: 'Upload failed', error: error.message },
      { status: 500 }
    );
  }
}