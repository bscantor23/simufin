import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-500 px-0 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 transition-colors duration-200 ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };