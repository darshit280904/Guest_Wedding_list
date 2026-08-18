import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Lots from './pages/Lots';
import Guests from './pages/Guests';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lots" element={<Lots />} />
            <Route path="/lots/:lotId" element={<Guests />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f0f0f0',
            border: '1px solid rgba(200, 151, 58, 0.3)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#c8973a', secondary: '#1a1000' },
          },
          error: {
            iconTheme: { primary: '#e74c3c', secondary: '#fff' },
          },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  );
}
