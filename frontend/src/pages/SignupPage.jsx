import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { parseApiError } from '../utils/api';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        return email.includes('@') && email.includes('.');
    };

    const handleInputChange = (field, setter) => (e) => {
        setter(e.target.value);
        setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    };

    const handleUsernameChange = (e) => {
        const val = e.target.value.toLowerCase();
        setUsername(val);
        setErrors(prev => ({ ...prev, username: '', general: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        let newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Please enter a username';
        }

        if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        if (password !== confirmPassword) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const success = await register(username.toLowerCase(), email, password);
            if (success) {
                navigate('/login');
            }
        } catch (err) {
            if (err.response?.data && typeof err.response.data === 'object') {
                setErrors(err.response.data);
            } else {
                setErrors({ general: parseApiError(err) });
            }
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

            {/* Signup Form */}
            <div className="flex flex-col items-center justify-center p-4 pt-16">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-6">
                            <Bot size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-center">Create your account</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={handleUsernameChange}
                                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:border-(--button-primary) focus:ring-1 focus:ring-(--button-primary) outline-none transition-all ${errors.username ? 'border-red-500' : 'border-border'}`}
                                placeholder="Username"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={handleInputChange('email', setEmail)}
                                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:border-(--button-primary) focus:ring-1 focus:ring-(--button-primary) outline-none transition-all ${errors.email ? 'border-red-500' : 'border-border'}`}
                                placeholder="name@example.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={handleInputChange('password', setPassword)}
                                    className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:border-(--button-primary) focus:ring-1 focus:ring-(--button-primary) outline-none transition-all pr-12 ${errors.password ? 'border-red-500' : 'border-border'}`}
                                    placeholder="Create password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:cursor-pointer hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={handleInputChange('confirm_password', setConfirmPassword)}
                                    className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:border-(--button-primary) focus:ring-1 focus:ring-(--button-primary) outline-none transition-all pr-12 ${errors.confirm_password ? 'border-red-500' : 'border-border'}`}
                                    placeholder="Confirm password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:cursor-pointer hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirm_password && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                            )}
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-(--button-primary) hover:bg-(--button-primary-hover) hover:cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Continue
                            </button>
                            {(errors.general || (typeof errors === 'string' && errors)) && (
                                <p className="text-red-500 text-xs mt-2 text-center">
                                    {errors.general || (typeof errors === 'string' ? errors : '')}
                                </p>
                            )}
                        </div>
                    </form>

                    <p className="text-center text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-(--button-primary) hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
