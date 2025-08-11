import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    console.log('🔄 Starting image migration process...');
    
    // Get products with base64 images
    const { data: products, error: fetchError } = await supabase
      .from('Products')
      .select('id, "Product name", "Array of image URLs"')
      .like('"Array of image URLs"', '%data:image%');
    
    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return NextResponse.json(
        { message: 'Failed to fetch products', error: fetchError.message },
        { status: 500 }
      );
    }
    
    if (!products || products.length === 0) {
      return NextResponse.json({
        message: 'No products with base64 images found',
        migrated: 0
      });
    }
    
    console.log(`📋 Found ${products.length} products with base64 images`);
    
    let migratedCount = 0;
    const errors = [];
    
    for (const product of products) {
      try {
        console.log(`🔄 Processing product: ${product['Product name']} (ID: ${product.id})`);
        
        const imageUrls = product['Array of image URLs'];
        let parsedImages;
        
        // Parse the image URLs (could be string or array)
        if (typeof imageUrls === 'string') {
          try {
            parsedImages = JSON.parse(imageUrls);
          } catch {
            parsedImages = [imageUrls];
          }
        } else {
          parsedImages = imageUrls;
        }
        
        if (!Array.isArray(parsedImages)) {
          parsedImages = [parsedImages];
        }
        
        const newImageUrls = [];
        
        for (let i = 0; i < parsedImages.length; i++) {
          const imageData = parsedImages[i];
          
          // Check if it's a base64 image
          if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
            console.log(`  📤 Uploading image ${i + 1}/${parsedImages.length} to Cloudinary...`);
            
            try {
              // Upload to Cloudinary
              const timestamp = Date.now();
              const randomString = Math.random().toString(36).substring(2);
              const publicId = `products/migrated-${product.id}-${i}-${timestamp}-${randomString}`;
              
              const uploadResult = await cloudinary.uploader.upload(imageData, {
                public_id: publicId,
                folder: 'products',
                resource_type: 'image',
                quality: 'auto',
                fetch_format: 'auto',
                transformation: [
                  { width: 1200, height: 1200, crop: 'limit' },
                  { quality: 'auto:good' }
                ]
              });
              
              newImageUrls.push(uploadResult.secure_url);
              console.log(`  ✅ Image uploaded: ${uploadResult.secure_url}`);
              
            } catch (uploadError) {
              console.error(`  ❌ Failed to upload image ${i + 1}:`, uploadError.message);
              errors.push(`Product ${product.id} image ${i + 1}: ${uploadError.message}`);
              // Keep the original base64 if upload fails
              newImageUrls.push(imageData);
            }
          } else {
            // Keep non-base64 images as they are
            newImageUrls.push(imageData);
          }
        }
        
        // Update the product with new image URLs
        const { error: updateError } = await supabase
          .from('Products')
          .update({ 'Array of image URLs': newImageUrls })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`❌ Failed to update product ${product.id}:`, updateError.message);
          errors.push(`Product ${product.id} update: ${updateError.message}`);
        } else {
          migratedCount++;
          console.log(`✅ Product ${product['Product name']} (ID: ${product.id}) migrated successfully`);
        }
        
      } catch (productError) {
        console.error(`❌ Error processing product ${product.id}:`, productError.message);
        errors.push(`Product ${product.id}: ${productError.message}`);
      }
    }
    
    console.log(`🎉 Migration completed! ${migratedCount}/${products.length} products migrated`);
    
    return NextResponse.json({
      message: 'Migration completed',
      totalProducts: products.length,
      migratedCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { message: 'Migration failed', error: error.message },
      { status: 500 }
    );
  }
}