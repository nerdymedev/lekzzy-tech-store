// Product service for managing products
// Now uses Supabase for global persistence

import { productsDummyData } from '../assets/assets';
import { supabase } from './supabase';

// Helper function to convert Supabase data to app format
const convertSupabaseProduct = (product) => {
  let imageUrls;
  try {
    // Parse the JSON string if it's a string, otherwise use as-is
    imageUrls = typeof product['Array of image URLs'] === 'string' 
      ? JSON.parse(product['Array of image URLs']) 
      : product['Array of image URLs'];
  } catch (error) {
    console.error('Error parsing image URLs:', error);
    imageUrls = ['/assets/default-product.png'];
  }
  
  return {
    _id: product.id.toString(),
    name: product['Product name'],
    description: product['Product description'],
    category: product['Product category'],
    price: product['Product price'],
    offerPrice: product['Discounted price'],
    image: imageUrls || ['/assets/default-product.png'],
    bestseller: product['Bestseller flag'] || false,
    createdAt: product.created_at,
    updatedAt: product['Last update time']
  };
};

// Get all products from Supabase
export const getAllProducts = async () => {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using dummy data');
      return productsDummyData;
    }
    
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return productsDummyData;
    }
    
    return data ? data.map(convertSupabaseProduct) : productsDummyData;
  } catch (error) {
    console.error('Error getting products:', error);
    return productsDummyData;
  }
};

// Add a new product to Supabase
export const addProduct = async (productInfo) => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('Products')
      .insert([{
        'Product name': productInfo.name,
        'Product description': productInfo.description,
        'Product category': productInfo.category,
        'Product price': parseFloat(productInfo.price),
        'Discounted price': productInfo.offerPrice ? parseFloat(productInfo.offerPrice) : null,
        'Array of image URLs': productInfo.image && productInfo.image.length > 0 ? (Array.isArray(productInfo.image) ? productInfo.image : [productInfo.image]) : ['/assets/default-product.png'],
        'Bestseller flag': false
      }])
      .select();
    
    if (error) {
      console.error('Error adding product to Supabase:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, product: convertSupabaseProduct(data[0]) };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error: error.message };
  }
};

// Remove a product from Supabase
export const removeProduct = async (productId) => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const { error } = await supabase
      .from('Products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      console.error('Error removing product from Supabase:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing product:', error);
    return { success: false, error: error.message };
  }
};

// Get a single product by ID from Supabase
export const getProductById = async (productId) => {
  try {
    if (!supabase) {
      const products = productsDummyData;
      return products.find(product => product._id === productId);
    }
    
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      console.error('Error getting product from Supabase:', error);
      return null;
    }
    
    return data ? convertSupabaseProduct(data) : null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

// Update a product in Supabase
export const updateProduct = async (productId, updates) => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const updateData = {
      'Product name': updates.name,
      'Product description': updates.description,
      'Product category': updates.category,
      'Product price': updates.price ? parseFloat(updates.price) : undefined,
      'Discounted price': updates.offerPrice ? parseFloat(updates.offerPrice) : undefined,
      'Array of image URLs': updates.image,
      'Bestseller flag': updates.bestseller
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    const { data, error } = await supabase
      .from('Products')
      .update(updateData)
      .eq('id', productId)
      .select();
    
    if (error) {
      console.error('Error updating product in Supabase:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, product: data[0] ? convertSupabaseProduct(data[0]) : null };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
};

// Get products by category from Supabase
export const getProductsByCategory = async (category) => {
  try {
    const products = await getAllProducts();
    return products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

// Search products by name or description from Supabase
export const searchProducts = async (searchTerm) => {
  try {
    const products = await getAllProducts();
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Reset products to original dummy data (Supabase version would clear and re-insert dummy data)
export const resetProducts = async () => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    // Clear existing products
    const { error: deleteError } = await supabase
      .from('Products')
      .delete()
      .neq('id', 0); // Delete all products
    
    if (deleteError) {
      console.error('Error clearing products:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    // Insert dummy data
    const dummyProductsForSupabase = productsDummyData.map(product => ({
      'Product name': product.name,
      'Product description': product.description,
      'Product category': product.category,
      'Product price': parseFloat(product.price),
      'Discounted price': product.offerPrice ? parseFloat(product.offerPrice) : null,
      'Array of image URLs': Array.isArray(product.image) ? product.image : [product.image],
      'Bestseller flag': product.bestseller || false
    }));
    
    const { error: insertError } = await supabase
      .from('Products')
      .insert(dummyProductsForSupabase);
    
    if (insertError) {
      console.error('Error inserting dummy products:', insertError);
      return { success: false, error: insertError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error resetting products:', error);
    return { success: false, error: error.message };
  }
};

// Future Supabase integration functions (commented out for now)
/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Supabase version of getAllProducts
export const getAllProductsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    return [];
  }
};

// Supabase version of addProduct
export const addProductToSupabase = async (productInfo) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productInfo.name,
        description: productInfo.description,
        category: productInfo.category,
        price: parseFloat(productInfo.price),
        offer_price: productInfo.offerPrice ? parseFloat(productInfo.offerPrice) : null,
        image_url: productInfo.image
      }])
      .select();
    
    if (error) throw error;
    return { success: true, product: data[0] };
  } catch (error) {
    console.error('Error adding product to Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Supabase version of removeProduct
export const removeProductFromSupabase = async (productId) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing product from Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Supabase version of updateProduct
export const updateProductInSupabase = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        price: updates.price ? parseFloat(updates.price) : undefined,
        offer_price: updates.offerPrice ? parseFloat(updates.offerPrice) : undefined,
        image_url: updates.image
      })
      .eq('id', productId)
      .select();
    
    if (error) throw error;
    return { success: true, product: data[0] };
  } catch (error) {
    console.error('Error updating product in Supabase:', error);
    return { success: false, error: error.message };
  }
};
*/