import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowLeft,
    Pencil,
    Check,
    X,
    Lock,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    Sun,
    Moon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';
import { parseApiError } from '../utils/api';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser, changePassword } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Edit state
    const [editingField, setEditingField] = useState(null); // 'name' or 'username'
    const [editValue, setEditValue] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Password state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});

    if (!user) return null;

    const handleStartEdit = (field, value) => {
        setEditingField(field);
        setEditValue(value);
        setFieldErrors({});
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditValue('');
        setFieldErrors({});
    };

    const handleSaveEdit = async () => {
        if (!editValue.trim() || editValue === user[editingField]) {
            handleCancelEdit();
            return;
        }

        setIsUpdating(true);
        setFieldErrors({});
        try {
            const success = await updateUser({ [editingField]: editValue.trim() });
            if (success) {
                setEditingField(null);
            }
        } catch (err) {
            const errorMsg = parseApiError(err);
            toast.error(errorMsg);
            if (err.response?.data && typeof err.response.data === 'object') {
                setFieldErrors(err.response.data);
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordErrors({});

        if (passwordData.new_password !== passwordData.confirm_new_password) {
            toast.error("Passwords do not match");
            setPasswordErrors({ confirm_new_password: "Passwords do not match" });
            return;
        }
        if (passwordData.new_password.length < 8) {
            toast.error("Password must be at least 8 characters");
            setPasswordErrors({ new_password: "Password must be at least 8 characters" });
            return;
        }

        setIsChangingPassword(true);
        try {
            const success = await changePassword(passwordData);
            if (success) {
                setShowPasswordSection(false);
                setPasswordData({ old_password: '', new_password: '', confirm_new_password: '' });
                setPasswordErrors({});
            }
        } catch (err) {
            const errorMsg = parseApiError(err);
            toast.error(errorMsg);
            if (err.response?.data && typeof err.response.data === 'object') {
                setPasswordErrors(err.response.data);
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
            {/* Header */}
            <header className="w-full h-14 sm:h-16 flex items-center justify-between px-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10 transition-all shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg hover:bg-sidebar-foreground/5 transition-colors cursor-pointer group"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                </div>

                <h1 className="text-base sm:text-lg font-semibold tracking-tight">Profile</h1>

                <div className="flex items-center">
                    <motion.button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-sidebar-foreground/5 transition-colors cursor-pointer"
                        aria-label="Toggle theme"
                        whileTap={{ scale: 0.9 }}
                    >
                        <motion.div
                            key={theme}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </motion.div>
                    </motion.button>
                </div>
            </header>

            <div className="w-full max-w-lg p-4 sm:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-(--modal-bg) border border-(--border) rounded-2xl p-8 shadow-xl"
                >
                    {/* User Profile Info */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-purple-600/20">
                            {user.name ? user.name.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : '?')}
                        </div>
                        <h2 className="text-2xl font-bold">{user.name || user.username}</h2>
                        <p className="text-foreground/40 text-sm">{user.email}</p>
                    </div>

                    {/* Fields */}
                    <div className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Name</label>
                            <div className={cn(
                                "flex flex-col gap-1 p-4 rounded-xl border bg-(--input-bg) transition-all",
                                fieldErrors.name ? "border-red-500" : "border-(--border)"
                            )}>
                                {editingField === 'name' ? (
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 bg-transparent outline-none"
                                            placeholder="Enter your name"
                                        />
                                        <div className="flex gap-1">
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={isUpdating}
                                                className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors cursor-pointer"
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={isUpdating}
                                                className="p-1 text-foreground/40 hover:bg-foreground/5 rounded transition-colors cursor-pointer"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="flex-1 font-medium">{user.name || <span className="text-foreground/20 italic">Not set</span>}</span>
                                        <button
                                            onClick={() => handleStartEdit('name', user.name || '')}
                                            className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all cursor-pointer"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {fieldErrors.name && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                            )}
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Username</label>
                            <div className={cn(
                                "flex flex-col gap-1 p-4 rounded-xl border bg-(--input-bg) transition-all",
                                fieldErrors.username ? "border-red-500" : "border-(--border)"
                            )}>
                                {editingField === 'username' ? (
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value.toLowerCase())}
                                            className="flex-1 bg-transparent outline-none"
                                            placeholder="Enter username"
                                        />
                                        <div className="flex gap-1">
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={isUpdating}
                                                className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors cursor-pointer"
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={isUpdating}
                                                className="p-1 text-foreground/40 hover:bg-foreground/5 rounded transition-colors cursor-pointer"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="flex-1 font-medium italic text-foreground/60">@{user.username}</span>
                                        <button
                                            onClick={() => handleStartEdit('username', user.username)}
                                            className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all cursor-pointer"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {fieldErrors.username && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>
                            )}
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="mt-10 pt-6 border-t border-(--border)">
                        <button
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-all group cursor-pointer"
                        >
                            <Lock size={16} />
                            <span className="group-hover:underline">Change Password</span>
                            {showPasswordSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <AnimatePresence>
                            {showPasswordSection && (
                                <motion.form
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-6 space-y-4"
                                    onSubmit={handlePasswordChange}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Old Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.old ? "text" : "password"}
                                                    required
                                                    value={passwordData.old_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-3 rounded-lg border bg-(--input-bg) outline-none focus:border-[#10a37f] transition-all pr-10",
                                                        passwordErrors.old_password ? "border-red-500" : "border-(--border)"
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer"
                                                >
                                                    {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {passwordErrors.old_password && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.old_password}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    required
                                                    value={passwordData.new_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-3 rounded-lg border bg-(--input-bg) outline-none focus:border-[#10a37f] transition-all pr-10",
                                                        passwordErrors.new_password ? "border-red-500" : "border-(--border)"
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer"
                                                >
                                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {passwordErrors.new_password && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    required
                                                    value={passwordData.confirm_new_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_new_password: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-3 rounded-lg border bg-(--input-bg) outline-none focus:border-[#10a37f] transition-all pr-10",
                                                        passwordErrors.confirm_new_password ? "border-red-500" : "border-(--border)"
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {passwordErrors.confirm_new_password && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.confirm_new_password}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="w-full bg-[#10a37f] hover:bg-[#1a7f64] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#10a37f]/20 flex items-center justify-center cursor-pointer mt-2"
                                    >
                                        {isChangingPassword ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : "Update Password"}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
