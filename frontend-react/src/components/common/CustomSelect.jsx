import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ name, value, onChange, options, placeholder, required, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => (typeof o === 'object' ? o.value === value : o === value));
    const displayValue = selectedOption ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption) : placeholder;

    return (
        <div ref={wrapperRef} className={`relative ${className || ''}`}>
            <div
                className={`input flex justify-between items-center cursor-pointer ${!value ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">{displayValue}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'text-slate-400'}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    {/* The max height is roughly 5 items (5 * 40px = 200px) */}
                    <ul className="max-h-[220px] overflow-y-auto py-1 custom-scrollbar">
                        <li
                            className={`px-4 py-2 md:py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-500 ${!value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : ''}`}
                            onClick={() => {
                                onChange({ target: { name, value: '' } });
                                setIsOpen(false);
                            }}
                        >
                            {placeholder}
                        </li>
                        {options.map((opt, i) => {
                            const optValue = typeof opt === 'object' ? opt.value : opt;
                            const optLabel = typeof opt === 'object' ? opt.label : opt;
                            const isSelected = value === optValue;
                            return (
                                <li
                                    key={i}
                                    className={`px-4 py-2 md:py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm truncate ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-slate-700 dark:text-slate-200'}`}
                                    onClick={() => {
                                        onChange({ target: { name, value: optValue } });
                                        setIsOpen(false);
                                    }}
                                >
                                    {optLabel}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Hidden select for standard form validation / required attribute */}
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="opacity-0 absolute inset-0 w-full h-full z-[-1] pointer-events-none"
                required={required}
                tabIndex={-1}
            >
                <option value="">{placeholder}</option>
                {options.map((opt, i) => {
                    const optValue = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    return <option key={i} value={optValue}>{optLabel}</option>
                })}
            </select>
        </div>
    );
};

export default CustomSelect;
