import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface NavItem {
    label: string; // Now serves as translation key suffix (e.g., "nav.items")
    href: string;
    icon: string;
    key: string; // Translation key
}

interface NavbarProps {
    currentPath: string;
    navItems: any[]; // Using internal definition now or mapping? We'll map internally.
}

export default function Navbar({ currentPath }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { language, setLanguage, t, LANGUAGES } = useLanguage();

    const navItems = [
        { key: "nav.items", href: "/", icon: "📦" },
        { key: "nav.quests", href: "/quests", icon: "🗺️" },
        { key: "nav.workshop", href: "/workshop", icon: "🛠️" },
        { key: "nav.hideout", href: "/hideout", icon: "🏠" },
    ];

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    return (
        <>
            <div className="flex items-center gap-4">
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
                            <span>{item.icon} {t(item.key)}</span>
                        </a>
                    ))}
                </nav>

                {/* Language Switcher - Desktop */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
                    >
                        <span className="text-base">{currentLang.flag}</span>
                        <span>{currentLang.code.toUpperCase()}</span>
                        <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-arc-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 z-[60] overflow-hidden"
                            >
                                <div className="max-h-64 overflow-y-auto no-scrollbar">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setIsLangOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${language === lang.code ? 'bg-arc-orange/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className="flex-1 text-left">{lang.label}</span>
                                            {language === lang.code && <Check size={14} className="text-arc-orange" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="flex md:hidden items-center gap-4">
                {/* Mobile Language Trigger */}
                <button
                    onClick={() => {
                        const currentIndex = LANGUAGES.findIndex(l => l.code === language);
                        const nextIndex = (currentIndex + 1) % LANGUAGES.length;
                        setLanguage(LANGUAGES[nextIndex].code);
                    }}
                    className="p-2 text-2xl"
                >
                    {currentLang.flag}
                </button>

                <button
                    className="p-2 text-zinc-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>


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
                                {t(item.key)}
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
