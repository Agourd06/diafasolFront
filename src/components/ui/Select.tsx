import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  id?: string;
  value: string | number | '';
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  label?: string;
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
  className = '',
  label,
  required = false,
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm
            bg-white border rounded-md
            text-slate-900
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-colors
            appearance-none
            cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
