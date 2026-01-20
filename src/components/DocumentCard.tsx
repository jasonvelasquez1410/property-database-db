import React from 'react';
import { Documentation } from '../types';
import { Icon } from './shared/Icon';

interface DocumentCardProps {
    document: Documentation;
}

const getStatusBadge = (status: string) => {
    if (status.toLowerCase().includes('missing') || status.toLowerCase().includes('submission')) {
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
    }
    if (status.toLowerCase().includes('original')) {
         return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
    }
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Available</span>
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
    return (
        <a href={document.documentUrl} target="_blank" rel="noopener noreferrer" className="border rounded-lg bg-gray-50 p-3 space-y-2 group hover:shadow-md hover:border-blue-500 transition-all">
            <div className="bg-gray-200 h-32 rounded-md flex items-center justify-center overflow-hidden">
                 <Icon type="file-text" className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors"/>
            </div>
            <p className="font-semibold text-sm truncate" title={document.fileName || document.type}>{document.fileName || document.type}</p>
            <p className="text-xs text-gray-500 truncate" title={document.propertyName}>{document.propertyName}</p>
            <div className="flex justify-between items-center pt-1">
                {getStatusBadge(document.status)}
                <button className="invisible group-hover:visible text-gray-400 hover:text-gray-600">
                    <Icon type="more-horizontal" className="w-5 h-5"/>
                </button>
            </div>
        </a>
    )
}
