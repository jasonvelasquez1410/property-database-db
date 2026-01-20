import React from 'react';
import { Icon } from './Icon';

interface DocumentLinkProps {
  label: string;
  href?: string;
  disabled?: boolean;
}

export const DocumentLink = ({ label, href, disabled = false }: DocumentLinkProps) => {
  const isLinkDisabled = disabled || !href || href === '#';

  const baseClasses = "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const enabledClasses = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500";
  const disabledClasses = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

  return (
    <a
      href={isLinkDisabled ? undefined : href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${isLinkDisabled ? disabledClasses : enabledClasses}`}
      onClick={(e) => isLinkDisabled && e.preventDefault()}
      aria-disabled={isLinkDisabled}
    >
      <Icon type="document" className="w-4 h-4" />
      <span>{label}</span>
    </a>
  );
};