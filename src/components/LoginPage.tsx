import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Icon } from './shared/Icon';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await api.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/svm-logo.jpg" alt="SVM Properties Logo" className="h-24 w-auto rounded-full object-cover border-4 border-gray-100" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">SVMPROPERTIES</h2>
          <p className="mt-2 text-lg text-gray-500">Property Management System</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 sr-only">Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon type="user" className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 bg-white pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 placeholder-gray-400 text-gray-900 border"
                placeholder="Email (e.g., demo@email.com)"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" aria-hidden="true" className="text-sm font-medium text-gray-700 sr-only">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon type="lock" className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 bg-white pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 placeholder-gray-400 text-gray-900 border"
                placeholder="Password (e.g., demo123)"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-center text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p>
            <span className="font-semibold">Admin:</span> demo@email.com / demo123
          </p>
          <p>
            <span className="font-semibold">Manager:</span> manager@email.com / manager123
          </p>
          <p>
            <span className="font-semibold">Staff:</span> staff@email.com / staff123
          </p>
        </div>
      </div>
    </div>
  );
};