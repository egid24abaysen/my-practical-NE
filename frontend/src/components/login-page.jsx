import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/cars';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('https://octopus-wash-api.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Login successful');
        onLogin();
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-gray-700 border-opacity-50">
          {/* Spotify-like header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
            <h2 className="text-3xl font-bold text-white">Welcome to system</h2>
            <p className="text-green-100 mt-1">Sign-In</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600 transition-all duration-200 placeholder-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600 transition-all duration-200 placeholder-gray-400"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/30'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                message.includes('successful')
                  ? 'bg-green-900 bg-opacity-50 text-green-200'
                  : 'bg-red-900 bg-opacity-50 text-red-200'
              }`}>
                {message}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-green-400 hover:text-green-300 font-medium transition-colors duration-200"
                >
                  Sign-Up here.
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Spotify-like footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Aba-Art-App. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
