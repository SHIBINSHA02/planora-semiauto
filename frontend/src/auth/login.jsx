import React, { useState } from 'react';

const DEFAULT_EMAIL = 'shibin24888@gmail.com';
const DEFAULT_PASSWORD = 'password';

const Login = ({ onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      localStorage.setItem('auth', JSON.stringify({ email }));
      setError('');
      onLoggedIn && onLoggedIn();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Login</h1>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={DEFAULT_EMAIL}
            className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={DEFAULT_PASSWORD}
            className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

