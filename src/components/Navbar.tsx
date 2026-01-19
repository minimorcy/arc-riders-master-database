import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

interface NavbarProps {
    currentPath: string;
    navItems: NavItem[];
}

export default function Navbar({ currentPath, navItems }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
                {navItems.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`
                            px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2
                            ${currentPath === item.href
                                ? "bg-white/10 text-white border border-white/20"
                                : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10"
                            }
                        `}
                    >
                        <span>{item.icon} {item.label}</span>
                    </a>
                ))}
            </nav>

            {/* Mobile Navigation Toggle */}
            <button
                className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-arc-dark/95 backdrop-blur-xl border-b border-white/10 p-4 md:hidden shadow-2xl flex flex-col gap-2 z-50"
                    >
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    p-4 rounded-xl transition-all text-sm font-bold uppercase tracking-wider flex items-center gap-4
                                    ${currentPath === item.href
                                        ? "bg-arc-orange/20 text-white border border-arc-orange/50"
                                        : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10 hover:text-white"
                                    }
                                `}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                {item.label}
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
