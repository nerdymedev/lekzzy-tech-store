'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getOrderById } from '@/lib/orderService'

const OrderPlaced = () => {

  const { router, currency } = useAppContext()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderId = searchParams.get('orderId')
      if (orderId) {
        try {
          const order = await getOrderById(orderId)
          if (order) {
            setOrderDetails(order)
          }
        } catch (error) {
          console.error('Error fetching order details:', error)
        }
      }
    }
    
    fetchOrderDetails()
  }, [searchParams])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/my-orders')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  if (!orderDetails) {
    return (
      <>
        <Navbar />
        <div className='h-screen flex flex-col justify-center items-center gap-5'>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-orange-500 border-gray-200"></div>
          <div className="text-center text-xl">Loading order details...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gray-50 py-12'>
        <div className='max-w-2xl mx-auto px-6'>
          {/* Success Animation */}
          <div className='text-center mb-8'>
            <div className="flex justify-center items-center relative mb-4">
              <Image className="absolute p-5" src={assets.checkmark} alt='Success' width={80} height={80} />
              <div className="rounded-full h-24 w-24 border-4 border-primary-500 bg-primary-50"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
          </div>

          {/* Order Details Card */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <div className='border-b pb-4 mb-4'>
              <h2 className='text-xl font-semibold text-gray-800'>Order Details</h2>
              <p className='text-gray-600'>Order ID: #{orderDetails._id}</p>
              <p className='text-sm text-gray-500'>Placed on {new Date(orderDetails.date).toLocaleDateString()}</p>
            </div>

            {/* Items */}
            <div className='mb-6'>
              <h3 className='font-medium text-gray-800 mb-3'>Items Ordered</h3>
              <div className='space-y-3'>
                {orderDetails.items.map((item, index) => (
                  <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded'>
                    <div className='w-12 h-12 bg-gray-200 rounded flex-shrink-0'>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='w-full h-full object-cover rounded'
                      />
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-gray-800'>{item.name}</p>
                      <p className='text-sm text-gray-600'>Qty: {item.quantity}</p>
                    </div>
                    <p className='font-medium text-gray-800'>
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className='mb-6'>
              <h3 className='font-medium text-gray-800 mb-2'>Delivery Address</h3>
              <div className='bg-gray-50 p-3 rounded'>
                <p className='font-medium'>{orderDetails.address.fullName}</p>
                <p className='text-gray-600'>{orderDetails.address.area}</p>
                <p className='text-gray-600'>{orderDetails.address.city}, {orderDetails.address.state} - {orderDetails.address.pincode}</p>
                <p className='text-gray-600'>{orderDetails.address.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className='mb-6'>
              <h3 className='font-medium text-gray-800 mb-2'>Payment Information</h3>
              <div className='bg-gray-50 p-3 rounded'>
                <p className='text-gray-600'>Payment Method: {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
                {orderDetails.promoCode && (
                  <p className='text-primary-600'>Promo Code Applied: {orderDetails.promoCode} ({orderDetails.discount}% off)</p>
                )}
              </div>
            </div>

            {/* Order Total */}
            <div className='border-t pt-4'>
              <div className='flex justify-between items-center text-lg font-semibold'>
                <span>Total Amount:</span>
                <span className='text-primary-600'>{formatCurrency(orderDetails.amount, currency)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='text-center space-y-4'>
            <button
              onClick={() => router.push('/my-orders')}
              className='w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-medium'
            >
              View My Orders
            </button>
            
            <button
              onClick={() => router.push('/all-products')}
              className='w-full border border-primary-500 text-primary-500 py-3 rounded-lg hover:bg-primary-50 font-medium'
            >
              Continue Shopping
            </button>

            <p className='text-sm text-gray-500'>
              Redirecting to My Orders in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderPlaced