import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-toggle"></div>
          </div>
          <div className="skeleton-meta">
            <div className="skeleton-date"></div>
          </div>
          <div className="skeleton-status"></div>
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
