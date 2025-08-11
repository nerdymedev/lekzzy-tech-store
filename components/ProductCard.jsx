import React from 'react'
import { assets } from '@/assets/assets'
import CustomImage from './CustomImage';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';

const ProductCard = ({ product }) => {

    const { currency, router, addToCart } = useAppContext()

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                <CustomImage
                    src={product.image ? (Array.isArray(product.image) ? product.image[0] : product.image) : assets.upload_area}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />
                <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <CustomImage
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="heart_icon"
                        width={12}
                        height={12}
                    />
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <CustomImage
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                            width={12}
                            height={12}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-primary-500 font-semibold text-lg">{formatCurrency(product.offerPrice, currency)}</p>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product._id);
                        router.push('/cart');
                    }}
                    className=" max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition"
                >
                    Buy now
                </button>
            </div>
        </div>
    )
}

export default ProductCard