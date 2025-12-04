import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={`w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-yellow-500 px-0 py-3 text-gray-800 focus:outline-none focus:ring-0 transition-colors duration-200 appearance-none cursor-pointer ${className || ''}`}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-800">
              {option.value}
            </option>
          ))}
        </select>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };