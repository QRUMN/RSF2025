import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`fixed bottom-6 right-6 p-3 rounded-full shadow-soft hover:shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 z-50 ${
        theme === 'light' 
          ? 'bg-white text-dark' 
          : 'bg-surface text-text'
      }`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? (
          <Moon className="w-6 h-6 text-primary" />
        ) : (
          <Sun className="w-6 h-6 text-primary" />
        )}
      </motion.div>
    </motion.button>
  );
};