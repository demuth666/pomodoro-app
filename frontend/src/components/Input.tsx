import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-2.5 bg-dark-bg border border-gray-700 rounded-lg focus:ring-2 focus:ring-pomodoro-red focus:border-transparent text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
