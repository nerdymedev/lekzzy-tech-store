# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for product images in the Lekzzy Tech Store application.

## Step 1: Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `products`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
5. Click **Create bucket**

## Step 2: Set Up Storage Policies (Optional)

If you want more control over who can upload/delete images, you can set up Row Level Security (RLS) policies:

1. Go to **Storage** → **Policies**
2. Create the following policies for the `products` bucket:

### Policy 1: Public Read Access
- **Policy name**: `Public read access for products`
- **Allowed operation**: `SELECT`
- **Policy definition**: `true` (allows everyone to read)

### Policy 2: Authenticated Upload Access
- **Policy name**: `Authenticated upload access for products`
- **Allowed operation**: `INSERT`
- **Policy definition**: `auth.role() = 'authenticated'`

### Policy 3: Authenticated Delete Access
- **Policy name**: `Authenticated delete access for products`
- **Allowed operation**: `DELETE`
- **Policy definition**: `auth.role() = 'authenticated'`

## Step 3: Test the Setup

1. Try adding a new product with images through the seller dashboard
2. Check that images are uploaded to the `products` bucket in Supabase Storage
3. Verify that images display correctly on the product pages

## Troubleshooting

### Images not uploading
- Check that the `products` bucket exists and is public
- Verify your Supabase environment variables are correct
- Check the browser console for any error messages

### Images not displaying
- Ensure the bucket is set to public
- Check that the Next.js image configuration includes `*.supabase.co` domains
- Verify the image URLs are correctly formatted

### Permission errors
- Make sure you're authenticated when uploading images
- Check that the storage policies allow the operations you're trying to perform

## Manual SQL Setup (Alternative)

If you prefer to set up the bucket using SQL, you can run these commands in the Supabase SQL Editor:

```sql
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for public read access
CREATE POLICY "Public read access for products bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Create RLS policy for authenticated upload access
CREATE POLICY "Authenticated upload access for products bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Create RLS policy for authenticated delete access
CREATE POLICY "Authenticated delete access for products bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

## What's Changed in the Application

The application has been updated to:

1. **Upload images to Supabase Storage** instead of storing them as base64
2. **Compress images** before upload to reduce file size
3. **Handle image deletion** when products are updated or removed
4. **Support both old base64 images and new Supabase Storage URLs** for backward compatibility
5. **Provide better user feedback** with loading states and error messages

## Benefits of Supabase Storage

- ✅ **Better performance**: Images load faster than base64
- ✅ **Reduced database size**: Images stored separately from product data
- ✅ **Image optimization**: Automatic compression and format conversion
- ✅ **CDN delivery**: Fast global image delivery
- ✅ **Cost effective**: Pay only for storage used
- ✅ **Scalable**: Handle thousands of product images