import React from 'react';

const Spinner = ({ size = 'medium' }) => {
  // Define size classes based on the size prop
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-blue-500 border-t-transparent`}
        role="status"
        aria-label="loading"
      ></div>
    </div>
  );
};

export default Spinner; 