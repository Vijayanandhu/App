//
// ========== (frontend)/src/components/Login.tsx ==========
//
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { THEME, POSITIVE_MESSAGES } from '../constants';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // CORRECTED: The old 'clearError' was removed from here.
  // When the component loads, if there's already a user, redirect them.
  useEffect(() => {
    if (user) {
      navigate('/app', { replace: true });
    }
    // Set a random welcome message on component mount
    setWelcomeMessage(POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)]);
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors on a new attempt

    try {
      await login({ username, password });
      // Navigation will happen automatically inside the login function or the useEffect above
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-accent px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-theme-primary">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {welcomeMessage}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-theme-secondary focus:border-theme-secondary focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-theme-secondary focus:border-theme-secondary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-${THEME.primaryText} bg-${THEME.primary} hover:bg-${THEME.secondary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-secondary disabled:bg-gray-400`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
            <Link to="/welcome" className="font-medium text-theme-secondary hover:text-theme-primary">
              Back to Welcome Page
            </Link>
          </div>
      </div>
    </div>
  );
};

export default Login;