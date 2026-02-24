import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, parseApiError } from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearStaleData = () => {
        const legacyKeys = ['chatgpt_user', 'username', 'user_id', 'role', 'access', 'refresh', 'name', 'email'];
        legacyKeys.forEach(key => localStorage.removeItem(key));
    };

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const userData = await api.get('/api/auth/me/');
                setUser(userData);
            } catch (err) {
                if (err.response?.status === 401 || err.message === 'Unauthorized' || err.message === 'Refresh failed') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    clearStaleData();
                }
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (username, password) => {
        try {
            const data = await api.post('/api/auth/login/', { username, password });
            clearStaleData();
            setUser(data.user);
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            toast.success('Welcome back!');
            return true;
        } catch (err) {
            // Rethrow so component can handle field errors
            throw err;
        }
    };

    const register = async (username, email, password) => {
        try {
            await api.post('/api/auth/register/', {
                username,
                email,
                password,
                confirm_password: password // Backend expects confirm_password
            });
            toast.success('Account created! Please log in.');
            return true;
        } catch (err) {
            // Rethrow so component can handle field errors
            throw err;
        }
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            await api.post('/api/auth/logout/', { refresh });
        } catch (err) {
            // Logout API failed
        } finally {
            setUser(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            clearStaleData();
            return true;
        }
    };

    const updateUser = async (data) => {
        try {
            const updatedUser = await api.patch('/api/auth/profile/', data);
            setUser(updatedUser);
            return true;
        } catch (err) {
            // Rethrow so component can handle field errors
            throw err;
        }
    };

    const changePassword = async (data) => {
        try {
            await api.post('/api/auth/change-password/', data);
            return true;
        } catch (err) {
            // Rethrow so component can handle field errors
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
