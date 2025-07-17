import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
          padding: '16px',
          fontSize: '14px',
        },
        success: {
          style: {
            background: '#10b981',
            color: 'white',
            border: '1px solid #059669',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: 'white',
            border: '1px solid #dc2626',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#ef4444',
          },
        },
        loading: {
          style: {
            background: '#8b5cf6',
            color: 'white',
            border: '1px solid #7c3aed',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#8b5cf6',
          },
        },
      }}
    />
  );
}