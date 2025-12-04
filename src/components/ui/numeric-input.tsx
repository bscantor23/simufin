import { InputHTMLAttributes, forwardRef, useState, useEffect, useRef } from "react";

interface NumericInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  allowDecimals?: boolean;
  maxValue?: number;
  showValidationError?: boolean;
  validationErrorMessage?: string;
}

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      className,
      value,
      onChange,
      allowDecimals = true,
      maxValue,
      showValidationError = false,
      validationErrorMessage,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState("");
    const [validationError, setValidationError] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Parse display value to number (convert commas to dots for parsing)
    const parseDisplayValue = (str: string): number => {
      if (!str || str === "-" ) return 0;

      let cleanStr = str;
      
      // Handle leading comma or dot
      if (cleanStr.startsWith(",") || cleanStr.startsWith(".")) {
        cleanStr = "0" + cleanStr;
      }

      // Replace commas with dots for parsing (Colombian format: comma = decimal)
      cleanStr = cleanStr.replace(/,/g, ".");
      
      // Remove any non-digit, non-dot characters
      cleanStr = cleanStr.replace(/[^\d.]/g, "");

      // Handle multiple dots (thousand separators + decimal point)
      const parts = cleanStr.split(".");
      if (parts.length > 2) {
        // Combine all parts except the last as the integer part, last as decimal
        const integerPart = parts.slice(0, -1).join("");
        const decimalPart = parts[parts.length - 1];
        cleanStr = integerPart + "." + decimalPart;
      }

      if (cleanStr === "" || cleanStr === "." || cleanStr === "-") return 0;

      const numericValue = allowDecimals
        ? Number.parseFloat(cleanStr)
        : Number.parseInt(cleanStr);

      return Number.isNaN(numericValue) ? 0 : numericValue;
    };

    // Format number for display (add thousand separators with dots and decimal commas)
    const formatNumberForDisplay = (num: number): string => {
      if (!num || num === 0) return "";

      // Handle floating point precision issues
      const fixedNum = Number(num.toFixed(6)); // Limit precision
      
      const parts = fixedNum.toString().split(".");
      let integerPart = parts[0];
      let decimalPart = parts[1] || "";

      // Add thousand separators (dots) to integer part for Colombian format
      if (integerPart.length > 3) {
        // Simple approach: use regex from the end
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }

      // Add comma as decimal separator if there's a decimal part
      return decimalPart
        ? `${integerPart},${decimalPart}`
        : integerPart;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Allow digits, dots (for thousands), and commas (for decimals)
      const chars = inputValue.split("");
      const sanitizedChars = chars.filter((char) => /[0-9.,]/.test(char));
      inputValue = sanitizedChars.join("");

      // Parse the numeric value (replace commas with dots for parsing)
      const numericValue = parseDisplayValue(inputValue);

      // Validate maxValue
      const isValid = !maxValue || numericValue <= maxValue;
      setValidationError(!isValid);

      // Set the sanitized input value directly first
      setDisplayValue(inputValue);

      // Notify parent component with the numeric value
      onChange(numericValue);
    };

    // Handle when input loses focus - format the number properly
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseDisplayValue(inputValue);
      
      // Only format if there's actually a value
      if (numericValue > 0) {
        const formattedValue = formatNumberForDisplay(numericValue);
        setDisplayValue(formattedValue);
      }
    };

    // Handle when input gains focus - show raw input
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseDisplayValue(inputValue);
      
      // If it was formatted, convert back to raw input for editing
      if (numericValue > 0 && inputValue.includes('.')) {
        const rawValue = inputValue.replace(/\./g, '');
        setDisplayValue(rawValue);
      }
    };

    // Update display when value changes from parent component, but not during active typing
    useEffect(() => {
      // Only update if the input is not currently being focused/typed in
      // This prevents formatting from interfering with user input
      if (!isFocused) {
        const formattedValue = formatNumberForDisplay(value);
        setDisplayValue(formattedValue);
      }
    }, [value, isFocused]);

    return (
      <>
        <input
          type="text"
          inputMode="decimal"
          className={`w-full bg-transparent border-0 border-b-2 ${
            validationError
              ? "border-red-500 focus:border-red-600"
              : "border-gray-300 focus:border-yellow-500"
          } px-0 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 transition-colors duration-200 ${
            className || ""
          }`}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onBlur={(e) => {
            setIsFocused(false);
            handleBlur(e);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            handleFocus(e);
          }}
          onKeyDown={(e) => {
            // Allow control keys and numbers, dots, commas
            const allowedKeys = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
            ];
            
            const key = e.key;
            
            // Allow if it's a control key
            if (allowedKeys.includes(key)) return;
            
            // Allow numbers
            if (/[0-9]/.test(key)) return;
            
            // Allow decimal point and comma
            if (key === '.' || key === ',') return;
            
            // Block everything else
            e.preventDefault();
          }}
          {...props}
        />

        {/* Validation Error Message */}
        {showValidationError && validationError && (
          <div className="mt-1 text-sm text-red-600">
            {validationErrorMessage ||
              `El valor no puede ser mayor a ${maxValue}%`}
          </div>
        )}
      </>
    );
  }
);

NumericInput.displayName = "NumericInput";

export { NumericInput };
