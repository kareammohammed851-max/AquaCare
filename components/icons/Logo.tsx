import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 12 22 12 22C12 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18.27C9.64 15.63 8 13.15 8 11C8 8.79 9.79 7 12 7S16 8.79 16 11C16 13.15 14.36 15.63 12 18.27Z"
      className="text-cyan-500"
    />
    <path
      d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
      transform="translate(0 -2)"
      className="text-green-400"
      fillRule="evenodd"
      clipRule="evenodd"
    >
        <animateTransform 
            attributeName="transform" 
            type="scale" 
            values="1; 1.1; 1" 
            begin="0s" 
            dur="2s" 
            repeatCount="indefinite"
            additive="sum"
        />
    </path>
  </svg>
);

export default Logo;
