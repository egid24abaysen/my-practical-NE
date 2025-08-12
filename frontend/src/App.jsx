import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import CarForm from './components/car-form';
import PackageForm from './components/package-form';
import ServiceForm from './components/service-form';
import PaymentForm from './components/payment-form';
import Reports from './components/report-page';
import Login from './components/login-page';
import Register from './components/signup-page';
import ProtectedRoute from './components/protected-route';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    localStorage.setItem('user', 'loggedIn');
    setIsLoggedIn(true);
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  const scrollbarStyles = `
  /* For Webkit browsers (Chrome, Safari) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(17, 24, 39, 0.5); /* bg-gray-900 with opacity */
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(74, 222, 128, 0.5); /* bg-green-500 with opacity */
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(74, 222, 128, 0.8); /* More opaque on hover */
  }

  /* For Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(74, 222, 128, 0.5) rgba(17, 24, 39, 0.5);
  }
`;

  return (
    
    <Router>
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black text-gray-100 overflow-hidden">
        <style>{scrollbarStyles}</style>
        {/* Glassmorphism Header - Fixed Height */}
        <header style="position:fixed" className="h-16 bg-black bg-opacity-30 backdrop-blur-lg border-b border-gray-800 flex-shrink-0 flex justify-between items-center px-4 sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Octopus-Washy
            </h1>
          </div>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 text-green-400 hover:text-green-300 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          )}
        </header>

        {/* Main Content Area - Flex Grow to fill remaining space */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation - Fixed Width */}
          {isLoggedIn && (
            <nav className="hidden md:block w-64 bg-black bg-opacity-20 backdrop-blur-md border-r border-gray-800 flex-shrink-0 overflow-y-auto">
              <div className="space-y-2 p-4">
                <Link
                  to="/cars"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 group"
                >
                  <div className="w-6 h-6 bg-gray-700 group-hover:bg-green-500 rounded-md flex items-center justify-center transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">Cars</span>
                </Link>
                <Link
                  to="/packages"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 group"
                >
                  <div className="w-6 h-6 bg-gray-700 group-hover:bg-green-500 rounded-md flex items-center justify-center transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="font-medium">Packages</span>
                </Link>
                <Link
                  to="/services"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 group"
                >
                  <div className="w-6 h-6 bg-gray-700 group-hover:bg-green-500 rounded-md flex items-center justify-center transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">Services</span>
                </Link>
                <Link
                  to="/payments"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 group"
                >
                  <div className="w-6 h-6 bg-gray-700 group-hover:bg-green-500 rounded-md flex items-center justify-center transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Payments</span>
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 group"
                >
                  <div className="w-6 h-6 bg-gray-700 group-hover:bg-green-500 rounded-md flex items-center justify-center transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">Reports</span>
                </Link>
              </div>
            </nav>
          )}

          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-auto scrollbar-dark">
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="*"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/login" />} />
                      <Route path="/cars" element={<CarForm />} />
                      <Route path="/packages" element={<PackageForm />} />
                      <Route path="/services" element={<ServiceForm />} />
                      <Route path="/payments" element={<PaymentForm />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        {isLoggedIn && (
          <div className="md:hidden h-16 bg-black bg-opacity-80 backdrop-blur-lg border-t border-gray-800 flex-shrink-0 z-50" style="position:fixed">
            <div className="flex justify-around h-full items-center">
              <Link
                to="/cars"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs mt-1">Cars</span>
              </Link>
              <Link
                to="/packages"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-xs mt-1">Packages</span>
              </Link>
              <Link
                to="/services"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs mt-1">Services</span>
              </Link>
              <Link
                to="/payments"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs mt-1">Payments</span>
              </Link>
              <Link
                to="/reports"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs mt-1">Reports</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
