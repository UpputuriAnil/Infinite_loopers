import React from 'react';
import './EnhancedLoading.css';

const EnhancedLoading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  type = 'spinner' // 'spinner', 'dots', 'pulse', 'wave'
}) => {
  const renderSpinner = () => (
    <div className="enhanced-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
  );

  const renderDots = () => (
    <div className="dots-loader">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  const renderPulse = () => (
    <div className="pulse-loader">
      <div className="pulse-circle"></div>
    </div>
  );

  const renderWave = () => (
    <div className="wave-loader">
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
    </div>
  );

  const getLoader = () => {
    switch (type) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'wave': return renderWave();
      default: return renderSpinner();
    }
  };

  const content = (
    <div className={`enhanced-loading ${size}`}>
      {getLoader()}
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-backdrop"></div>
        {content}
      </div>
    );
  }

  return content;
};

export default EnhancedLoading;
