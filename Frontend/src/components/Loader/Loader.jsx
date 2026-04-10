import React from 'react';
import './Loader.css';

const Loader = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className="loader-container">
      <div className={`loader loader-${size}`}></div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export const Spinner = ({ size = 'small', inline = false }) => {
  const classNames = `spinner spinner-${size}${inline ? ' inline' : ''}`;
  return <div className={classNames}></div>;
};

export const PageLoader = ({ fullScreen = true }) => {
  return (
    <div className={`page-loader ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loader-content">
        <div className="loader-small"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loader;