import React from 'react';

const Spinner = ({ size = 5 }) => {
  return (
    <div
      className={`w-${size} h-${size} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}
    />
  );
};

export default Spinner; 