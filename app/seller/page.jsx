'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { addProduct } from "@/lib/productService";
import { uploadMultipleImages, compressImage } from "@/lib/cloudinaryImageService";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/utils";

const AddProduct = () => {

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [bestseller, setBestseller] = useState(false);

  const handlePriceChange = (value, setter) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setter(numericValue);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!name || !description || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Supabase Storage
      let imageUrls = [];
      
      if (files.length > 0) {
        toast.loading('Uploading images...');
        const uploadResult = await uploadImages(files);
        
        if (!uploadResult.success) {
          toast.dismiss();
          toast.error(`Image upload failed: ${uploadResult.errors?.join(', ') || 'Unknown error'}`);
          return;
        }
        
        imageUrls = uploadResult.urls;
        
        if (uploadResult.errors && uploadResult.errors.length > 0) {
          toast.warning(`Some images failed to upload: ${uploadResult.errors.join(', ')}`);
        }
        
        toast.dismiss();
      }
      
      // If no images uploaded, use placeholder
      if (imageUrls.length === 0) {
        imageUrls = [assets.upload_area];
      }
      
      const productData = {
        name,
        description,
        category,
        price: parseFloat(price),
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        bestseller,
        image: imageUrls
      };
      
      toast.loading('Adding product...');

      const result = await addProduct(productData);
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Product added successfully!');
        // Reset form
        setName('');
        setDescription('');
        setCategory('Earphone');
        setPrice('');
        setOfferPrice('');
        setBestseller(false);
        setFiles([]);
      } else {
        toast.error(result.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.dismiss();
      toast.error('An error occurred while adding the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">

            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input onChange={(e) => {
                  const updatedFiles = [...files];
                  updatedFiles[index] = e.target.files[0];
                  setFiles(updatedFiles);
                }} type="file" id={`image${index}`} hidden />
                <Image
                  key={index}
                  className="max-w-24 cursor-pointer"
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                  alt=""
                  width={100}
                  height={100}
                />
              </label>
            ))}

          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
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
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              defaultValue={category}
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
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
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
              required
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
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-8 py-2.5 bg-primary-500 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'ADDING...' : 'ADD'}
        </button>
      </form>
      {/* <Footer /> */}
    </div>
  );
};

export default AddProduct;