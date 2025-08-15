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
        className="w-[60px] p-1 border-gray-300 text-black rounded-b-xs"
        placeholder="0"
        style={{
            border: `1px solid ${isFocused ? '#1890ff' : '#ccc'}`,
            borderTop: 'none',
            outline: 'none',
            appearance: 'textfield',
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
        }}
      />
    );
  }
);

export default InputNumber;