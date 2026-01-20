import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const FormField = ({ label, id, children, required = false, className = '' }: FormFieldProps) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);
