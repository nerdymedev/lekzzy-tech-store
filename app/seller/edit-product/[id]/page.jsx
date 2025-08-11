'use client'
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import CustomImage from "@/components/CustomImage";
import { getProductById, updateProduct } from "@/lib/productService";
import { uploadMultipleImages, compressImage, deleteMultipleImages, isCloudinaryUrl } from "@/lib/cloudinaryImageService";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const EditProduct = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]); // Track removed images for deletion
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      const product = await getProductById(id);
      if (product) {
        setName(product.name || '');
        setDescription(product.description || '');
        setCategory(product.category || 'Earphone');
        setPrice(product.price ? product.price.toString() : '');
        setOfferPrice(product.offerPrice ? product.offerPrice.toString() : '');
        setBestseller(product.bestseller || false);
        setExistingImages(Array.isArray(product.image) ? product.image : [product.image]);
      } else {
        toast.error('Product not found');
        router.push('/seller/product-list');
      }
      setLoading(false);
    };
    
    if (id) {
      loadProduct();
    }
  }, [id, router]);

  const handlePriceChange = (value, setter) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // Don't update if more than one decimal point
    }
    
    setter(numericValue);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    // Only track Cloudinary URLs for deletion
    if (isCloudinaryUrl(imageToRemove)) {
      setRemovedImages(prev => [...prev, imageToRemove]);
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files) => {
    try {
      // Compress images before upload
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, 800, 800, 0.8))
      );
      
      // Upload to Supabase Storage
      const result = await uploadMultipleImages(compressedFiles, 'products');
      return result;
    } catch (error) {
      console.error('Error uploading images:', error);
      return { success: false, errors: [error.message] };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Start with existing images
      let imageArray = [...existingImages];
      
      // Upload new files if any
      if (files.length > 0) {
        toast.loading('Uploading new images...');
        const uploadResult = await uploadImages(files);
        
        if (!uploadResult.success) {
          toast.dismiss();
          toast.error(`Image upload failed: ${uploadResult.errors?.join(', ') || 'Unknown error'}`);
          return;
        }
        
        imageArray = [...imageArray, ...uploadResult.urls];
        
        if (uploadResult.errors && uploadResult.errors.length > 0) {
          toast.warning(`Some images failed to upload: ${uploadResult.errors.join(', ')}`);
        }
        
        toast.dismiss();
      }

      // Delete removed images from Supabase Storage
      if (removedImages.length > 0) {
        toast.loading('Cleaning up removed images...');
        const deleteResult = await deleteMultipleImages(removedImages);
        
        if (!deleteResult.success) {
          console.warn('Some images failed to delete:', deleteResult.errors);
          // Don't fail the update if image deletion fails
        }
        
        toast.dismiss();
      }

      const productInfo = {
        name,
        description,
        category,
        price: parseFloat(price),
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        bestseller,
        image: imageArray
      };

      toast.loading('Updating product...');
      const result = await updateProduct(id, productInfo);
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Product updated successfully!');
        router.push('/seller/product-list');
      } else {
        toast.error(result.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.dismiss();
      toast.error('An error occurred while updating the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full md:p-10 p-4">
      <h2 className="pb-4 text-lg font-medium">Edit Product</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="product-name">
            Product name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="product-description">
            Product description
          </label>
          <textarea
            id="product-description"
            placeholder="Write content here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            rows={6}
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="product-category">
            Product category
          </label>
          <select
            id="product-category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            required
          >
            <option value="Earphone">Earphone</option>
            <option value="Headphone">Headphone</option>
            <option value="Watch">Watch</option>
            <option value="Smartphone">Smartphone</option>
            <option value="Laptop">Laptop</option>
            <option value="Camera">Camera</option>
            <option value="Gaming">Gaming</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium">Current Images</label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((image, index) => (
                <div key={index} className="relative">
                  <CustomImage
                    src={image}
                    alt={`Product image ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* New Images Upload */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="product-image">
            Add New Images
          </label>
          <input
            id="product-image"
            type="file"
            multiple
            accept="image/*"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`New image ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product price
            </label>
            <input
              id="product-price"
              type="text"
              placeholder="0.00"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => handlePriceChange(e.target.value, setPrice)}
              value={price}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
            </label>
            <input
              id="offer-price"
              type="text"
              placeholder="0.00"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => handlePriceChange(e.target.value, setOfferPrice)}
              value={offerPrice}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            id="bestseller"
            type="checkbox"
            checked={bestseller}
            onChange={(e) => setBestseller(e.target.checked)}
            className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
          />
          <label htmlFor="bestseller" className="text-base font-medium">
            Mark as Featured Product (Bestseller)
          </label>
        </div>
        
        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary-500 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'UPDATING...' : 'UPDATE PRODUCT'}
          </button>
          <button 
            type="button" 
            onClick={() => router.push('/seller/product-list')}
            className="px-8 py-2.5 bg-gray-600 text-white font-medium rounded hover:bg-gray-700"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;