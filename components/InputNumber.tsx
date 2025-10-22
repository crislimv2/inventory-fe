'use client'
import { forwardRef, useState } from 'react';

const InputNumber = forwardRef<HTMLInputElement, { value: number | null; onChange: (val: number) => void; onFocus?: () => void; }>(
  ({ value, onChange, onFocus }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        ref={ref}
        onFocus={() => {
            onFocus?.();
            setIsFocused(true);
        }}
        onBlur={() => setIsFocused(false)}
        className={`w-[60px] p-1 text-black border rounded-b-xs ${isFocused ? 'border-blue-500' : 'border-gray-300'} border-t-0 focus:outline-none`}
        placeholder="0"
        style={{
            outline: 'none',
            appearance: 'textfield',
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
        }}
      />
    );
  }
);
// ✅ Add a display name for ESLint and React DevTools
InputNumber.displayName = 'InputNumber';

export default InputNumber;