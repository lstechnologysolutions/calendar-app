import { InstallmentOption } from '@/types/Payment/mercadoPago.types';

export const FormInput = ({
    id,
    name,
    label,
    type = 'text',
    value,
    onChange,
    onFocus,
    placeholder,
    className = '',
    maxLength,
    required,
    disabled,
}: {
    id: string;
    name: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    placeholder?: string;
    className?: string;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
}) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-base-content">
            {label}
        </label>
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            placeholder={placeholder}
            className={`w-full p-2 border rounded-md ${className} text-base-content bg-base-100`}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
        />

    </div>
);

export const InstallmentSelect = ({
    options,
    value,
    onChange,
    label,
    optionsLabel,
}: {
    options: InstallmentOption[];
    value: string;
    onChange: (value: string) => void;
    label: string;
    optionsLabel: string;
}) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-base-content">
            {label}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded-md text-base-content bg-base-100"
        >
            <option value=""> {optionsLabel}</option>
            {options.map((option) => (
                <option key={option.installments} value={option.installments.toString()}>
                    {option.recommended_message}
                </option>
            ))}
        </select>
    </div>
);