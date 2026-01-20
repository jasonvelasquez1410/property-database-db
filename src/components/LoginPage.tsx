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
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059ee445?q=80&w=2070&auto=format&fit=crop')"}}>
        <div className="min-h-screen flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-gray-900/80 rounded-2xl shadow-2xl p-8 space-y-8 text-white">
                <div className="text-center">
                    <h2 className="text-4xl font-bold">SVM Properties Inc.</h2>
                    <p className="mt-2 text-lg text-gray-300">Property Management System</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-300 sr-only">Email</label>
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
                                className="block w-full rounded-md border-gray-600 bg-gray-800/50 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 placeholder-gray-400"
                                placeholder="Email (e.g., admin@propertyhub.com)"
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
                                className="block w-full rounded-md border-gray-600 bg-gray-800/50 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 placeholder-gray-400"
                                placeholder="Password (e.g., admin123)"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                    <div>
                        <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-blue-500/50 disabled:cursor-not-allowed transition-colors"
                        >
                        {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-xs text-gray-400 space-y-1">
                    <p>
                        <span className="font-semibold">Admin:</span> admin@propertyhub.com / admin123
                    </p>
                    <p>
                        <span className="font-semibold">Manager:</span> manager@propertyhub.com / manager123
                    </p>
                     <p>
                        <span className="font-semibold">Staff:</span> staff@propertyhub.com / staff123
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};