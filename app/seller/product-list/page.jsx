'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import CustomImage from "@/components/CustomImage";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { getAllProducts, removeProduct } from "@/lib/productService";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ProductList = () => {

  const { currency } = useAppContext()
  const router = useRouter()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSellerProduct = async () => {
    try {
      const productList = await getAllProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to remove "${productName}"?`)) {
      try {
        const result = await removeProduct(productId);
        if (result.success) {
          toast.success('Product removed successfully!');
          // Refresh the product list
          fetchSellerProduct();
        } else {
          toast.error(result.error || 'Failed to remove product');
        }
      } catch (error) {
        console.error('Error removing product:', error);
        toast.error('An error occurred while removing the product');
      }
    }
  }

  useEffect(() => {
    fetchSellerProduct();
  }, [])

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Product</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className=" table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Product</th>
                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Category</th>
                <th className="px-4 py-3 font-medium truncate">
                  Price
                </th>
                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product, index) => (
                <tr key={index} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="bg-gray-500/10 rounded p-2">
                      <CustomImage
                        src={product.image ? (Array.isArray(product.image) ? product.image[0] : product.image) : assets.upload_area}
                        alt="product Image"
                        className="w-16"
                        width={1280}
                        height={720}
                      />
                    </div>
                    <span className="truncate w-full">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                  <td className="px-4 py-3">{formatCurrency(product.offerPrice, currency)}</td>
                  <td className="px-4 py-3 max-sm:hidden">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/product/${product._id}`)} 
                        className="flex items-center gap-1 px-2 md:px-3 py-1.5 bg-primary-500 text-white rounded-md text-xs hover:bg-primary-600 transition-colors"
                      >
                        <span className="hidden md:block">View</span>
                        <Image
                          className="h-3"
                          src={assets.redirect_icon}
                          alt="redirect_icon"
                        />
                      </button>
                      <button 
                        onClick={() => router.push(`/seller/edit-product/${product._id}`)} 
                        className="px-2 md:px-3 py-1.5 bg-primary-500 text-white rounded-md text-xs hover:bg-primary-600 transition-colors"
                      >
                        <span className="hidden md:block">Edit</span>
                        <span className="md:hidden">✎</span>
                      </button>
                      <button 
                        onClick={() => handleRemoveProduct(product._id, product.name)}
                        className="px-2 md:px-3 py-1.5 bg-primary-500 text-white rounded-md text-xs hover:bg-primary-600 transition-colors"
                      >
                        <span className="hidden md:block">Remove</span>
                        <span className="md:hidden">×</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}
      <Footer />
    </div>
  );
};

export default ProductList;