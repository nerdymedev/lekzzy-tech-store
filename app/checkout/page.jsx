'use client'
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { toast } from "react-hot-toast";
import { addOrder } from "@/lib/orderService";
const Checkout = () => {
  const { 
    products, 
    cartItems, 
    getCartCount, 
    getCartAmount, 
    currency, 
    router,
    clearCart,
    userAddresses,
    fetchUserAddresses,
    user,
    selectedAddress,
    setSelectedAddress
  } = useAppContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Load form data from localStorage on initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPaymentMethod = localStorage.getItem('checkoutPaymentMethod');
      const savedPromoCode = localStorage.getItem('checkoutPromoCode');
      const savedOrderNotes = localStorage.getItem('checkoutOrderNotes');
      
      if (savedPaymentMethod) setPaymentMethod(savedPaymentMethod);
      if (savedPromoCode) setPromoCode(savedPromoCode);
      if (savedOrderNotes) setOrderNotes(savedOrderNotes);
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkoutPaymentMethod', paymentMethod);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkoutPromoCode', promoCode);
    }
  }, [promoCode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkoutOrderNotes', orderNotes);
    }
  }, [orderNotes]);

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    // Redirect if cart is empty (but not if order was just placed)
    if (getCartCount() === 0 && !orderPlaced) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }

    // Load user addresses
    fetchUserAddresses();
  }, [getCartCount, router, orderPlaced]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const applyPromoCode = () => {
    // Simple promo code logic
    const validCodes = {
      'SAVE10': 0.10,
      'WELCOME20': 0.20,
      'STUDENT15': 0.15
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setDiscount(validCodes[promoCode.toUpperCase()]);
      toast.success(`Promo code applied! ${(validCodes[promoCode.toUpperCase()] * 100)}% discount`);
    } else {
      toast.error('Invalid promo code');
      setDiscount(0);
    }
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
      if (formattedValue.length > 19) return; // Limit to 16 digits + 3 spaces
    } else if (field === 'expiryDate') {
      // Format expiry date as MM/YY
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return;
    } else if (field === 'cvv') {
      // Limit CVV to 3-4 digits
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = () => {
    console.log('Validating form...', { selectedAddress, user, paymentMethod });
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      console.log('Validation failed: No address selected');
      return false;
    }

    if (!user) {
      console.log('Validation failed: No user logged in');
      router.push('/sign-in?redirectTo=/checkout');
      return false;
    }

    if (paymentMethod === 'card') {
      const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
      
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return false;
      }
      
      if (!expiryDate || expiryDate.length < 5) {
        toast.error('Please enter a valid expiry date');
        return false;
      }
      
      if (!cvv || cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
      
      if (!cardholderName.trim()) {
        toast.error('Please enter the cardholder name');
        return false;
      }
    }

    console.log('Form validation passed successfully');
    return true;
  };

  const calculateTotal = () => {
    const subtotal = getCartAmount();
    const tax = Math.floor(subtotal * 0);
    const discountAmount = Math.floor(subtotal * discount);
    return subtotal + tax - discountAmount;
  };

  const clearCheckoutForm = () => {
    // Clear form states
    setPaymentMethod('card');
    setPromoCode('');
    setDiscount(0);
    setOrderNotes('');
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('checkoutPaymentMethod');
      localStorage.removeItem('checkoutPromoCode');
      localStorage.removeItem('checkoutOrderNotes');
    }
  };

  const processOrder = async () => {
    console.log('processOrder function called');
    console.log('Cart items:', cartItems);
    console.log('Cart count:', getCartCount());
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      console.log('Starting order processing...');
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order object
      const orderData = {
        userId: user.id,
        userEmail: user.email,
        items: Object.keys(cartItems)
          .map(itemId => {
            const product = products.find(p => p._id === itemId);
            if (!product) {
              console.error(`Product not found for ID: ${itemId}`);
              return null;
            }
            return {
              productId: itemId,
              name: product.name,
              price: product.offerPrice,
              quantity: cartItems[itemId],
              image: Array.isArray(product.image) ? product.image[0] : product.image
            };
          })
          .filter(item => item !== null),
        amount: calculateTotal(),
        address: selectedAddress,
        paymentMethod,
        promoCode: promoCode || null,
        discount: discount * 100, // Store as percentage
        notes: orderNotes,
        status: 'Order Placed',
        paymentStatus: paymentMethod === 'card' ? 'Paid' : 'Pending'
      };

      // Store order in Supabase
      console.log('Calling addOrder with data:', orderData);
      const createdOrder = await addOrder(orderData);
      console.log('addOrder returned:', createdOrder);

      // Check if order was saved to localStorage (fallback scenario)
      if (createdOrder && createdOrder.source === 'localStorage') {
        toast.success('Order saved locally due to server issues. Please contact support.');
      } else {
        toast.success('Order placed successfully!');
      }

      // Set order placed flag to prevent cart empty notification
      setOrderPlaced(true);

      // Clear cart
      clearCart();

      // Clear checkout form data
      clearCheckoutForm();
      
      // Redirect to order confirmation
      router.push(`/order-placed?orderId=${createdOrder._id}`);
    } catch (error) {
      // Check if the error message indicates localStorage fallback was used
      if (error.message && error.message.includes('localStorage')) {
        toast.error('Order saved locally due to server issues. Please contact support.');
      } else {
        toast.error('Failed to process order. Please try again.');
      }
      console.error('Order processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = getCartAmount();
  const tax = Math.floor(subtotal * 0);
  const discountAmount = Math.floor(subtotal * discount);
  const total = calculateTotal();

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-medium text-gray-700 mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-medium mb-4">Delivery Address</h2>
                <div className="relative">
                  <button
                    className="w-full text-left px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-gray-700">
                      {selectedAddress
                        ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                        : "Select Address"}
                    </span>
                    <svg className={`w-5 h-5 float-right mt-1 transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute w-full bg-white border rounded-lg shadow-lg mt-1 z-10 py-2">
                      {userAddresses.map((address, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleAddressSelect(address)}
                        >
                          <div className="font-medium">{address.fullName}</div>
                          <div className="text-sm text-gray-600">
                            {address.area}, {address.city}, {address.state} - {address.pincode}
                          </div>
                          <div className="text-sm text-gray-500">{address.phoneNumber || address.phone}</div>
                        </div>
                      ))}
                      <div
                        onClick={() => router.push("/add-address")}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-center text-primary-500 font-medium"
                      >
                        + Add New Address
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-medium mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-500"
                    />
                    <label htmlFor="card" className="text-gray-700 font-medium">Credit/Debit Card</label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-500"
                    />
                    <label htmlFor="cod" className="text-gray-700 font-medium">Cash on Delivery</label>
                  </div>
                </div>

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardholderName}
                        onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-medium mb-4">Order Notes (Optional)</h2>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg border sticky top-4">
                <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {Object.keys(cartItems).map((itemId) => {
                    const product = products.find(p => p._id === itemId);
                    if (!product || cartItems[itemId] <= 0) return null;
                    
                    return (
                      <div key={itemId} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                          <img
                            src={Array.isArray(product.image) ? product.image[0] : product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {cartItems[itemId]} × {formatCurrency(product.offerPrice, currency)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.offerPrice * cartItems[itemId], currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter code"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      Apply
                    </button>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {(discount * 100)}% discount applied!
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({getCartCount()} items)</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (0%)</span>
                    <span>{formatCurrency(tax, currency)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount ({(discount * 100)}%)</span>
                      <span className="text-green-600">-{formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={processOrder}
                  disabled={isProcessing}
                  className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isProcessing ? 'Processing...' : `Place Order - ${formatCurrency(total, currency)}`}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;