import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { parseApiError } from '../utils/api';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleIdentifierChange = (e) => {
        const val = e.target.value.toLowerCase();
        setIdentifier(val);
        setErrors(prev => ({ ...prev, identifier: '', username: '', email: '', general: '' }));
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setErrors(prev => ({ ...prev, password: '', general: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        let newErrors = {};

        if (!identifier.trim()) {
            newErrors.identifier = 'Please enter your email or username';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const normalizedIdentifier = identifier.trim().toLowerCase();

        try {
            const success = await login(normalizedIdentifier, password);
            if (success) {
                navigate('/chat');
            }
        } catch (err) {
            const data = err.response?.data || {};
            setErrors({
                identifier: data.identifier || data.username || data.email || '',
                password: data.password || '',
                general: data.general || data.detail || data.error || (typeof data === 'string' ? data : '') || (!err.response ? parseApiError(err) : '')
            });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Bot size={28} className="text-(--button-primary)" />
                            <span className="text-xl font-bold">ChatBot</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-sidebar-foreground/5 transition-colors cursor-pointer"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Login Form */}
            <div className="flex flex-col items-center justify-center p-4 pt-20">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-6">
                            <Bot size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-center">Welcome back</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email address or username</label>
                            <input
                                type="text"
                                required
                                value={identifier}
                                onChange={handleIdentifierChange}
                                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] outline-none transition-all ${errors.identifier ? 'border-red-500' : 'border-border'}`}
                                placeholder="Email or username"
                            />
                            {errors.identifier && (
                                <p className="text-red-500 text-xs mt-1">Invalid email or username</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] outline-none transition-all pr-12 ${errors.password ? 'border-red-500' : 'border-border'}`}
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:text-foreground hover:cursor-pointer transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-(--button-primary) hover:bg-(--button-primary-hover) hover:cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Login
                            </button>
                            {errors.general && (
                                <p className="text-red-500 text-xs mt-2 text-center">{errors.general}</p>
                            )}
                        </div>
                    </form>

                    <p className="text-center text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-(--button-primary) hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
