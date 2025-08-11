'use client'
import { userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, getCurrentUser } from '@/lib/supabase';
import { getAllProducts } from '@/lib/productService';
import Toast from '@/components/Toast';

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()
    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const [user, setUser] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

    // Load cart items from localStorage on initialization
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCartItems = localStorage.getItem('cartItems');
            if (savedCartItems) {
                try {
                    setCartItems(JSON.parse(savedCartItems));
                } catch (error) {
                    console.error('Error parsing cart items from localStorage:', error);
                }
            }
        }
    }, []);

    // Save cart items to localStorage whenever cartItems changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }, [cartItems]);
    const [toastMessage, setToastMessage] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [userAddresses, setUserAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)

    // Load addresses and selected address from localStorage on initialization
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedAddresses = localStorage.getItem('userAddresses');
            const savedSelectedAddress = localStorage.getItem('selectedAddress');
            
            if (savedAddresses) {
                try {
                    setUserAddresses(JSON.parse(savedAddresses));
                } catch (error) {
                    console.error('Error parsing addresses from localStorage:', error);
                }
            }
            
            if (savedSelectedAddress) {
                try {
                    setSelectedAddress(JSON.parse(savedSelectedAddress));
                } catch (error) {
                    console.error('Error parsing selected address from localStorage:', error);
                }
            }
        }
    }, []);

    // Save addresses to localStorage whenever userAddresses changes
    useEffect(() => {
        if (typeof window !== 'undefined' && userAddresses.length > 0) {
            localStorage.setItem('userAddresses', JSON.stringify(userAddresses));
        }
    }, [userAddresses]);

    // Save selected address to localStorage whenever selectedAddress changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (selectedAddress) {
                localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
            } else {
                localStorage.removeItem('selectedAddress');
            }
        }
    }, [selectedAddress]);

    const fetchProductData = async () => {
        try {
            const productList = await getAllProducts();
            setProducts(productList);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    }

    const fetchUserData = async () => {
        if (hasSupabaseKeys && user) {
            setUserData({
                _id: user.id,
                name: user.user_metadata?.full_name || user.email,
                email: user.email,
                imageUrl: user.user_metadata?.avatar_url || null
            });
            // Check if user is a seller based on user metadata
            setIsSeller(user.user_metadata?.role === 'seller');
        } else if (!hasSupabaseKeys) {
            // Fallback to dummy data when Supabase is not configured
            setUserData(userDummyData);
            setIsSeller(true);
        } else {
            setUserData(false);
            setIsSeller(false);
        }
    }

    const addToCart = async (itemId) => {

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        
        // Show toast notification
        const product = products.find(p => p._id === itemId);
        const productName = product ? product.name : 'Item';
        setToastMessage(`${productName} added to cart!`);
        setShowToast(true);

    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                const price = itemInfo.offerPrice || itemInfo.price || 0;
                totalAmount += price * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const clearCart = () => {
        setCartItems({});
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cartItems');
        }
    }

    const fetchUserAddresses = async () => {
        try {
            // Check if addresses are already loaded from localStorage
            if (userAddresses.length > 0) {
                return;
            }
            
            // Check localStorage first
            if (typeof window !== 'undefined') {
                const savedAddresses = localStorage.getItem('userAddresses');
                if (savedAddresses) {
                    try {
                        const parsedAddresses = JSON.parse(savedAddresses);
                        if (parsedAddresses.length > 0) {
                            setUserAddresses(parsedAddresses);
                            return;
                        }
                    } catch (error) {
                        console.error('Error parsing saved addresses:', error);
                    }
                }
            }
            
            // No fallback to dummy data - start with empty addresses
            setUserAddresses([]);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setUserAddresses([]);
        }
    }

    const saveAddress = async (addressData) => {
        try {
            // Generate a unique ID for the new address
            const newAddress = {
                _id: Date.now().toString(),
                userId: userData?._id || 'guest',
                ...addressData
            };
            
            // Add to the addresses array
            const updatedAddresses = [...userAddresses, newAddress];
            setUserAddresses(updatedAddresses);
            
            // Save to localStorage immediately
            if (typeof window !== 'undefined') {
                localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
            }
            
            // Show success toast
            setToastMessage('Address saved successfully!');
            setShowToast(true);
            
            return { success: true };
        } catch (error) {
            console.error('Error saving address:', error);
            setToastMessage('Failed to save address. Please try again.');
            setShowToast(true);
            return { success: false, error };
        }
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        fetchUserAddresses()
    }, [])

    // Initialize Supabase auth listener
    useEffect(() => {
        if (hasSupabaseKeys && supabase) {
            // Get initial user
            getCurrentUser().then(({ user: currentUser }) => {
                setUser(currentUser)
                setIsLoaded(true)
            })

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                (event, session) => {
                    setUser(session?.user || null)
                    setIsLoaded(true)
                }
            )

            return () => subscription.unsubscribe()
        } else {
            setIsLoaded(true)
        }
    }, [hasSupabaseKeys])

    useEffect(() => {
        if (!hasSupabaseKeys || isLoaded) {
            fetchUserData()
        }
    }, [user, isLoaded, hasSupabaseKeys])

    const closeToast = () => {
        setShowToast(false);
        setToastMessage('');
    }

    const value = {
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        clearCart,
        user, isLoaded,
        userAddresses, fetchUserAddresses, saveAddress,
        selectedAddress, setSelectedAddress
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
            <Toast 
                message={toastMessage}
                isVisible={showToast}
                onClose={closeToast}
                type="success"
            />
        </AppContext.Provider>
    )
}