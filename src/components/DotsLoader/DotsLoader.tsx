import { DotsLoaderProps } from '@/types';
import React from 'react';
import './DotsLoader.css';

const DotsLoader: React.FC<DotsLoaderProps> = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`dots-loader ${size} ${className}`}>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );
};

export default DotsLoader;