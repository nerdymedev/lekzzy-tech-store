# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image storage and migrate from Supabase Storage.

## 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be taken to your dashboard
3. Note down your **Cloud Name**, **API Key**, and **API Secret** from the dashboard

## 2. Configure Environment Variables

Update your `.env.local` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Remove any spaces around the `=` sign in your environment variables.

## 3. Migration from Supabase Storage

The application has been updated to use Cloudinary instead of Supabase Storage:

### Changes Made:
- ✅ Created `lib/cloudinary.js` for Cloudinary configuration
- ✅ Created `lib/cloudinaryImageService.js` with all image operations
- ✅ Updated `app/seller/page.jsx` to use Cloudinary service
- ✅ Updated `app/seller/edit-product/[id]/page.jsx` to use Cloudinary service
- ✅ Installed required packages: `cloudinary` and `next-cloudinary`

### Features Available:
- **Image Upload**: Supports multiple image uploads with validation
- **Image Compression**: Automatic client-side compression before upload
- **Image Deletion**: Delete images from Cloudinary
- **URL Optimization**: Get optimized image URLs with transformations
- **File Type Validation**: Supports JPEG, PNG, WebP, and GIF
- **Size Limits**: 5MB maximum file size

## 4. Cloudinary Features

Cloudinary offers several advantages over Supabase Storage:

- **Automatic Optimization**: Images are automatically optimized for web
- **Transformations**: Resize, crop, and apply effects on-the-fly
- **CDN Delivery**: Global CDN for fast image delivery
- **Advanced Features**: AI-powered cropping, background removal, etc.
- **Generous Free Tier**: 25GB storage and 25GB bandwidth per month

## 5. Testing the Setup

1. Make sure your environment variables are set correctly
2. Restart your development server: `npm run dev`
3. Go to the seller page and try uploading product images
4. Check that images are uploaded to your Cloudinary dashboard

## 6. Existing Data Migration

If you have existing products with Supabase Storage images:

1. The application will continue to display existing Supabase images
2. When you edit a product and upload new images, they will be stored in Cloudinary
3. You can manually re-upload images to migrate them to Cloudinary

## 7. Troubleshooting

### Common Issues:

1. **"Invalid API credentials"**
   - Double-check your environment variables
   - Ensure no extra spaces in the `.env.local` file
   - Restart your development server

2. **"Upload failed"**
   - Check file size (max 5MB)
   - Ensure file type is supported (JPEG, PNG, WebP, GIF)
   - Check your Cloudinary dashboard for quota limits

3. **Images not displaying**
   - Verify the Cloudinary URLs are accessible
   - Check browser console for any errors

## 8. Next Steps

Once Cloudinary is working:

1. You can remove Supabase Storage policies if no longer needed
2. Consider implementing advanced Cloudinary features like:
   - Automatic format optimization
   - Responsive image delivery
   - AI-powered cropping
   - Image effects and filters

For more advanced features, refer to the [Cloudinary Documentation](https://cloudinary.com/documentation).