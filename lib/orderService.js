import { supabase } from './supabase';
import { orderDummyData } from '@/assets/assets';

// Helper function to convert Supabase order to expected format (for new structure)
const convertSupabaseOrderToExpectedFormat = (order) => {
  try {
    const customerInfo = JSON.parse(order['Customer information'] || '{}');
    const orderItems = JSON.parse(order['Order items'] || '[]');
    const shippingDetails = JSON.parse(order['Shipping details'] || '{}');
    const paymentInfo = JSON.parse(order['Payment information'] || '{}');
    
    return {
      _id: order.id,
      userId: customerInfo.userId,
      userEmail: customerInfo.userEmail,
      items: orderItems,
      amount: shippingDetails.amount,
      address: shippingDetails.address,
      paymentMethod: paymentInfo.paymentMethod,
      paymentStatus: paymentInfo.paymentStatus || 'Pending',
      status: order['Order status'] || 'Order Placed',
      date: order.created_at,
      notes: paymentInfo.notes,
      promoCode: paymentInfo.promoCode,
      discount: paymentInfo.discount
    };
  } catch (error) {
    console.error('Error parsing order data:', error);
    return {
      _id: order.id,
      userId: null,
      items: [],
      amount: 0,
      address: null,
      paymentMethod: 'card',
      paymentStatus: 'Pending',
      status: 'Order Placed',
      date: order.created_at,
      notes: null
    };
  }
};

// Helper function to convert Supabase order to expected format (legacy - for old structure)
const convertSupabaseOrder = (order) => {
  return {
    _id: order.id,
    userId: order.user_id,
    items: order.items,
    amount: order.amount,
    address: order.address,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status || 'Pending',
    status: order.status || 'Order Placed',
    date: order.created_at,
    notes: order.notes
  };
};

// Get all orders from Supabase
export const getAllOrdersFromSupabase = async () => {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage fallback');
      const localOrders = getAllOrdersFromLocalStorage();
      return localOrders.length > 0 ? localOrders : orderDummyData;
    }

    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      console.log('Falling back to localStorage orders...');
      const localOrders = getAllOrdersFromLocalStorage();
      return localOrders.length > 0 ? localOrders : orderDummyData;
    }

    // Combine Supabase orders with localStorage orders
    const supabaseOrders = data.map(convertSupabaseOrderToExpectedFormat);
    const localOrders = getAllOrdersFromLocalStorage();
    
    // Merge and deduplicate orders (prioritize Supabase orders)
    const allOrders = [...supabaseOrders, ...localOrders];
    const uniqueOrders = allOrders.filter((order, index, self) => 
      index === self.findIndex(o => o._id === order._id)
    );
    
    return uniqueOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error in getAllOrdersFromSupabase:', error);
    console.log('Falling back to localStorage orders...');
    const localOrders = getAllOrdersFromLocalStorage();
    return localOrders.length > 0 ? localOrders : orderDummyData;
  }
};

// Add order to Supabase
export const addOrderToSupabase = async (orderData) => {
  console.log('addOrderToSupabase called with:', orderData);
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage fallback');
      const localOrder = addOrderToLocalStorage(orderData);
      if (!localOrder) {
        throw new Error('Failed to save order to localStorage');
      }
      console.log('Order successfully saved to localStorage (Supabase not configured)');
      return localOrder;
    }

    // Map to the actual column names in the Supabase Orders table
    const supabaseOrderData = {
      'Customer information': JSON.stringify({
        userId: orderData.userId,
        userEmail: orderData.userEmail
      }),
      'Order items': JSON.stringify(orderData.items),
      'Order status': orderData.status || 'Order Placed',
      'Shipping details': JSON.stringify({
        address: orderData.address,
        amount: orderData.amount
      }),
      'Payment information': JSON.stringify({
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus || 'Pending',
        promoCode: orderData.promoCode,
        discount: orderData.discount,
        notes: orderData.notes
      })
    };

    const { data, error } = await supabase
      .from('Orders')
      .insert([supabaseOrderData])
      .select()
      .single();

    if (error) {
      console.error('Error adding order to Supabase:', error);
      console.log('Falling back to localStorage...');
      const localOrder = addOrderToLocalStorage(orderData);
      if (!localOrder) {
        throw new Error('Failed to save order to localStorage after Supabase failure');
      }
      console.log('Order successfully saved to localStorage after Supabase failure');
      return localOrder;
    }

    return convertSupabaseOrderToExpectedFormat(data);
  } catch (error) {
    console.error('Error in addOrderToSupabase:', error);
    console.log('Attempting localStorage fallback...');
    const localOrder = addOrderToLocalStorage(orderData);
    if (!localOrder) {
      throw new Error('Failed to save order: both Supabase and localStorage failed');
    }
    console.log('Order successfully saved to localStorage as fallback');
    return localOrder;
  }
};

// Update order status in Supabase
export const updateOrderStatusInSupabase = async (orderId, status) => {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage fallback');
      return updateOrderStatusInLocalStorage(orderId, status);
    }

    const { data, error } = await supabase
      .from('Orders')
      .update({ 'Order status': status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status in Supabase:', error);
      return updateOrderStatusInLocalStorage(orderId, status);
    }

    return convertSupabaseOrderToExpectedFormat(data);
  } catch (error) {
    console.error('Error in updateOrderStatusInSupabase:', error);
    return updateOrderStatusInLocalStorage(orderId, status);
  }
};

// Update payment status in Supabase
export const updatePaymentStatusInSupabase = async (orderId, paymentStatus) => {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage fallback');
      return updatePaymentStatusInLocalStorage(orderId, paymentStatus);
    }

    // First get the current order to update the payment information
    const { data: currentOrder, error: fetchError } = await supabase
      .from('Orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error('Error fetching current order:', fetchError);
      return updatePaymentStatusInLocalStorage(orderId, paymentStatus);
    }

    // Parse current payment information and update payment status
    const currentPaymentInfo = JSON.parse(currentOrder['Payment information'] || '{}');
    currentPaymentInfo.paymentStatus = paymentStatus;

    const { data, error } = await supabase
      .from('Orders')
      .update({ 'Payment information': JSON.stringify(currentPaymentInfo) })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status in Supabase:', error);
      return updatePaymentStatusInLocalStorage(orderId, paymentStatus);
    }

    return convertSupabaseOrderToExpectedFormat(data);
  } catch (error) {
    console.error('Error in updatePaymentStatusInSupabase:', error);
    return updatePaymentStatusInLocalStorage(orderId, paymentStatus);
  }
};

// Get order by ID from Supabase
export const getOrderByIdFromSupabase = async (orderId) => {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage fallback');
      return getOrderByIdFromLocalStorage(orderId);
    }

    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order by ID from Supabase:', error);
      return getOrderByIdFromLocalStorage(orderId);
    }

    return convertSupabaseOrderToExpectedFormat(data);
  } catch (error) {
    console.error('Error in getOrderByIdFromSupabase:', error);
    return getOrderByIdFromLocalStorage(orderId);
  }
};

// Get orders by user ID from Supabase
export const getOrdersByUserIdFromSupabase = async (userId) => {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage fallback');
      const localOrders = getOrdersByUserIdFromLocalStorage(userId);
      return localOrders.length > 0 ? localOrders : orderDummyData.filter(order => order.userId === userId);
    }

    // Since user_id is stored in the 'Customer information' JSON field,
    // we need to get all orders and filter them client-side
    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by user ID from Supabase:', error);
      console.log('Falling back to localStorage orders...');
      const localOrders = getOrdersByUserIdFromLocalStorage(userId);
      return localOrders.length > 0 ? localOrders : orderDummyData.filter(order => order.userId === userId);
    }

    // Filter orders by user ID from the Customer information JSON field
    const userOrders = data.filter(order => {
      try {
        const customerInfo = JSON.parse(order['Customer information'] || '{}');
        return customerInfo.userId === userId;
      } catch (error) {
        console.error('Error parsing customer information:', error);
        return false;
      }
    });

    // Convert to expected format
    const supabaseOrders = userOrders.map(convertSupabaseOrderToExpectedFormat);
    const localOrders = getOrdersByUserIdFromLocalStorage(userId);
    
    // Merge and deduplicate orders (prioritize Supabase orders)
    const allOrders = [...supabaseOrders, ...localOrders];
    const uniqueOrders = allOrders.filter((order, index, self) => 
      index === self.findIndex(o => o._id === order._id)
    );
    
    return uniqueOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error in getOrdersByUserIdFromSupabase:', error);
    console.log('Falling back to localStorage orders...');
    const localOrders = getOrdersByUserIdFromLocalStorage(userId);
    return localOrders.length > 0 ? localOrders : orderDummyData.filter(order => order.userId === userId);
  }
};

// LocalStorage fallback functions
const addOrderToLocalStorage = (orderData) => {
  console.log('addOrderToLocalStorage called with:', orderData);
  try {
    // Validate required orderData
    if (!orderData || !orderData.items || !orderData.amount) {
      console.error('Invalid order data provided to localStorage:', {
        hasOrderData: !!orderData,
        hasItems: !!(orderData && orderData.items),
        hasAmount: !!(orderData && orderData.amount),
        orderData
      });
      return null;
    }

    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const newOrder = {
      ...orderData,
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      source: 'localStorage'
    };
    orders.push(newOrder);
    localStorage.setItem('userOrders', JSON.stringify(orders));
    console.log('Order successfully saved to localStorage:', newOrder._id);
    return newOrder;
  } catch (error) {
    console.error('Error adding order to localStorage:', error);
    return null;
  }
};

const updateOrderStatusInLocalStorage = (orderId, status) => {
  try {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedOrders = orders.map(order => 
      order._id === orderId ? { ...order, status } : order
    );
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
    return updatedOrders.find(order => order._id === orderId);
  } catch (error) {
    console.error('Error updating order status in localStorage:', error);
    return null;
  }
};

const updatePaymentStatusInLocalStorage = (orderId, paymentStatus) => {
  try {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedOrders = orders.map(order => 
      order._id === orderId ? { ...order, paymentStatus } : order
    );
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
    return updatedOrders.find(order => order._id === orderId);
  } catch (error) {
    console.error('Error updating payment status in localStorage:', error);
    return null;
  }
};

const getOrderByIdFromLocalStorage = (orderId) => {
  try {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    return orders.find(order => order._id === orderId) || null;
  } catch (error) {
    console.error('Error getting order by ID from localStorage:', error);
    return null;
  }
};

const getAllOrdersFromLocalStorage = () => {
  try {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error getting all orders from localStorage:', error);
    return [];
  }
};

const getOrdersByUserIdFromLocalStorage = (userId) => {
  try {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    return orders
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error getting orders by user ID from localStorage:', error);
    return [];
  }
};

// Main service functions that use Supabase with localStorage fallback
export const getAllOrders = async () => {
  return await getAllOrdersFromSupabase();
};

export const addOrder = async (orderData) => {
  return await addOrderToSupabase(orderData);
};

export const updateOrderStatus = async (orderId, status) => {
  return await updateOrderStatusInSupabase(orderId, status);
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  return await updatePaymentStatusInSupabase(orderId, paymentStatus);
};

export const getOrderById = async (orderId) => {
  return await getOrderByIdFromSupabase(orderId);
};

export const getOrdersByUserId = async (userId) => {
  return await getOrdersByUserIdFromSupabase(userId);
};

// Helper function to get the most recent order from localStorage (useful for order confirmation)
export const getLastOrderFromLocalStorage = () => {
  try {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    if (orders.length === 0) return null;
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  } catch (error) {
    console.error('Error getting last order from localStorage:', error);
    return null;
  }
};