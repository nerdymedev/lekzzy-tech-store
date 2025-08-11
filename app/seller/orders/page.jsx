'use client';
import React, { useEffect, useState } from "react";
import { assets, orderDummyData } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { formatCurrency } from "@/lib/utils";
import { getAllOrders, updateOrderStatus, updatePaymentStatus } from "@/lib/orderService";

const Orders = () => {

    const { currency } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = async () => {
        try {
            // Get all orders from Supabase
            const allOrders = await getAllOrders();
            setOrders(allOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    const markAsDelivered = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'Delivered');
            const updatedOrders = orders.map(order => 
                order._id === orderId 
                    ? { ...order, status: 'Delivered' }
                    : order
            );
            setOrders(updatedOrders);
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }

    const markAsPaid = async (orderId) => {
        try {
            await updatePaymentStatus(orderId, 'Paid');
            const updatedOrders = orders.map(order => 
                order._id === orderId 
                    ? { ...order, paymentStatus: 'Paid' }
                    : order
            );
            setOrders(updatedOrders);
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    }

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Orders</h2>
                <div className="max-w-4xl rounded-md">
                    {orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300">
                            <div className="flex-1 flex gap-5 max-w-80">
                                <Image
                                    className="max-w-16 max-h-16 object-cover"
                                    src={assets.box_icon}
                                    alt="box_icon"
                                />
                                <p className="flex flex-col gap-3">
                                    <span className="font-medium">
                                        {order.items.map((item) => item.name + ` x ${item.quantity}`).join(", ")}
                                    </span>
                                    <span>Items : {order.items.length}</span>
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="font-medium">{order.address.fullName}</span>
                                    <br />
                                    <span >{order.address.area}</span>
                                    <br />
                                    <span>{`${order.address.city}, ${order.address.state}`}</span>
                                    <br />
                                    <span className="font-medium">Phone: {order.address.phoneNumber || order.address.phone}</span>
                                </p>
                            </div>
                            <p className="font-medium my-auto">{formatCurrency(order.amount, currency)}</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                    <span>Method : {order.paymentMethod === 'cod' ? 'COD' : 'Card'}</span>
                                    <span>Date : {new Date(order.date).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-medium ${
                                            order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-primary-600'
                                        }`}>Payment : {order.paymentStatus || 'Pending'}</span>
                                        {order.paymentMethod === 'cod' && order.paymentStatus !== 'Paid' && (
                                            <button
                                                onClick={() => markAsPaid(order._id)}
                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                                            >
                                                Mark as Paid
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-medium ${
                                            order.status === 'Delivered' ? 'text-green-600' : 'text-primary-600'
                                        }`}>Delivery Status : {order.status}</span>
                                        {order.status !== 'Delivered' && (
                                            <button
                                                onClick={() => markAsDelivered(order._id)}
                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                                            >
                                                Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>}
            <Footer />
        </div>
    );
};

export default Orders;