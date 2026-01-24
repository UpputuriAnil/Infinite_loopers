import React, { useState, useEffect } from 'react';
import { Sun, Moon, Palette, Sparkles } from 'lucide-react';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'light',
      name: 'Light Mode',
      icon: Sun,
      colors: {
        primary: '#ec4899',
        secondary: '#3b82f6',
        accent: '#10b981',
        background: 'linear-gradient(135deg, #fef7ff 0%, #f0f9ff 25%, #ecfdf5 50%, #fffbeb 75%, #fef2f2 100%)'
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: Moon,
      colors: {
        primary: '#f472b6',
        secondary: '#60a5fa',
        accent: '#34d399',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #1e40af 50%, #1e3a8a 75%, #1e1b4b 100%)'
      }
    },
    {
      id: 'sunset',
      name: 'Sunset',
      icon: Palette,
      colors: {
        primary: '#f97316',
        secondary: '#ef4444',
        accent: '#eab308',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 25%, #fecaca 50%, #fde68a 75%, #fef3c7 100%)'
      }
    },
    {
      id: 'ocean',
      name: 'Ocean',
      icon: Sparkles,
      colors: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#8b5cf6',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #e0f7fa 25%, #f3e8ff 50%, #e0f2fe 75%, #e0f7fa 100%)'
      }
    }
  ];

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const themeData = themes.find(t => t.id === theme);
    
    if (themeData) {
      root.style.setProperty('--theme-primary', themeData.colors.primary);
      root.style.setProperty('--theme-secondary', themeData.colors.secondary);
      root.style.setProperty('--theme-accent', themeData.colors.accent);
      
      // Apply background
      document.body.style.background = themeData.colors.background;
      document.body.style.backgroundAttachment = 'fixed';
      
      setCurrentTheme(theme);
      localStorage.setItem('selectedTheme', theme);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'light';
    applyTheme(savedTheme);
  }, []);

  const handleThemeChange = (themeId) => {
    applyTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);
  const CurrentIcon = currentThemeData?.icon || Sun;

  return (
    <div className={`theme-switcher ${isOpen ? 'open' : ''}`}>
      {/* Theme Options */}
      <div className="theme-options">
        {themes.map((theme, index) => {
          const IconComponent = theme.icon;
          return (
            <div
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              style={{
                '--delay': `${index * 0.1}s`,
                '--theme-color': theme.colors.primary
              }}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="theme-option-button">
                <IconComponent size={18} />
              </div>
              <span className="theme-option-label">{theme.name}</span>
            </div>
          );
        })}
      </div>

      {/* Main Theme Button */}
      <button className="theme-main" onClick={() => setIsOpen(!isOpen)}>
        <div className="theme-icon">
          <CurrentIcon size={20} />
        </div>
        <div className="theme-ripple"></div>
      </button>

      {/* Backdrop */}
      {isOpen && <div className="theme-backdrop" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default ThemeSwitcher;
