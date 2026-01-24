import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button className="scroll-to-top" onClick={scrollToTop}>
      <div className="scroll-progress">
        <svg className="progress-ring" width="60" height="60">
          <circle
            className="progress-ring-circle"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            r="26"
            cx="30"
            cy="30"
            style={{
              strokeDasharray: `${2 * Math.PI * 26}`,
              strokeDashoffset: `${2 * Math.PI * 26 * (1 - scrollProgress / 100)}`
            }}
          />
        </svg>
      </div>
      <ArrowUp size={20} className="scroll-icon" />
    </button>
  );
};

export default ScrollToTop;
