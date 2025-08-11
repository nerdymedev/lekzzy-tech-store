'use client'
import React, { useEffect } from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';

const Toast = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-primary-500 text-white'
      }`}>
        <div className="flex items-center gap-2">
          {type === 'success' ? (
            <Image 
              src={assets.checkmark} 
              alt="success" 
              width={20} 
              height={20}
              className="w-5 h-5"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <span className="text-red-500 text-sm font-bold">!</span>
            </div>
          )}
          <span className="font-medium">{message}</span>
        </div>
        <button 
          onClick={onClose}
          className="ml-auto text-white hover:text-gray-200 transition"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;