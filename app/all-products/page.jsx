'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';

const SearchableProducts = () => {
    const { products } = useAppContext();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) {
            return products;
        }
        
        const query = searchQuery.toLowerCase();
        return products.filter(product => 
            product.name?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    return (
        <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
            <div className="flex flex-col items-end pt-12">
                <p className="text-2xl font-medium">
                    {searchQuery ? `Search results for "${searchQuery}"` : 'All products'}
                </p>
                <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
            </div>
            {searchQuery && (
                <p className="text-gray-600 mt-4">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => <ProductCard key={index} product={product} />)
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 text-lg">No products found matching your search.</p>
                        <p className="text-gray-400 mt-2">Try searching with different keywords.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AllProducts = () => {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-lg">Loading...</div></div>}>
                <SearchableProducts />
            </Suspense>
            <Footer />
        </>
    );
};

export default AllProducts;
