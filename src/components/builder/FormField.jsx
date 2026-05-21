import { useState } from 'react';
import { Check } from 'lucide-react';

export default function FormField({
  label,
  value,
  onChange,
  mandatory,
  placeholder,
  type = 'text',
  readOnly,
  className = '',
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).trim().length > 0;

  return (
    <div
      className={`flex rounded-lg border overflow-hidden transition-all ${
        focused ? 'border-blue-500 shadow-sm shadow-blue-100' : 'border-gray-300'
      } ${className}`}
    >
      <div className="flex-1 px-3 py-2 min-w-0">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 leading-none mb-1">
          {label}
          {mandatory && ' (MANDATORY)'}
        </label>
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full outline-none text-gray-800 text-sm bg-transparent"
        />
      </div>
      {hasValue && (
        <div className="flex items-center justify-center w-11 flex-shrink-0 bg-emerald-500">
          <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}
