import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Bot, ArrowRight, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { parseApiError } from '../../utils/api';

const SetNameModal = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user || user.name_set) return null;

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            await updateUser({ name: name.trim() });
        } catch (err) {
            toast.error(parseApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            await updateUser({ name: user.username });
        } catch (err) {
            toast.error(parseApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-(--modal-bg) border border-(--border) rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#10a37f]/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-[#10a37f] flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-[#10a37f]/20">
                            <Bot size={32} />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Welcome to ChatBot!</h2>
                        <p className="text-foreground/60 mb-8">What should we call you?</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Your preferred name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-(--border) bg-(--input-bg) focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] outline-none transition-all text-lg"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!name.trim() || isSubmitting}
                                className="w-full bg-[#10a37f] hover:bg-[#1a7f64] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#10a37f]/20 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleSkip}
                                disabled={isSubmitting}
                                className="text-sm text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                            >
                                Use my username for now
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SetNameModal;
