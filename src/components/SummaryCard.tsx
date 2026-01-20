
import React from 'react';
import { Icon } from './shared/Icon';

type IconType = 'logout' | 'filter' | 'document' | 'location' | 'close' | 'user' | 'lock' | 'plus' | 'trash' | 'dollar-circle' | 'building-office' | 'chart-pie' | 'globe-alt' | 'upload' | 'edit' | 'dashboard' | 'properties' | 'finance' | 'settings' | 'help' | 'admin' | 'bell' | 'chevron-down' | 'chevron-up' | 'arrow-trending-up' | 'arrow-trending-down' | 'exclamation-triangle' | 'calendar-days' | 'eye' | 'upload-cloud' | 'document-text' | 'more-horizontal';

interface SummaryCardProps {
    icon: IconType;
    title: string;
    value: string;
    description: string;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'none';
}

const iconColorClasses: { [key in IconType]?: string } = {
    properties: 'bg-blue-500',
    'chart-pie': 'bg-green-500',
    'exclamation-triangle': 'bg-yellow-500',
    'calendar-days': 'bg-indigo-500',
    'building-office': 'bg-blue-500',
    'globe-alt': 'bg-teal-500',
};

const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    none: 'text-gray-500',
}

export const SummaryCard = ({ icon, title, value, description, trend, trendDirection = 'none', onClick }: SummaryCardProps & { onClick?: () => void }) => {
    return (
        <div
            className={`bg-white rounded-xl shadow p-5 flex flex-col justify-between transition-transform duration-200 ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}`}
            onClick={onClick}
        >
            <div>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg text-white ${iconColorClasses[icon] || 'bg-gray-500'}`}>
                        <Icon type={icon} className="w-7 h-7" />
                    </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">{description}</p>
            </div>
            {trend && trendDirection !== 'none' && (
                <div className="mt-4 flex items-baseline text-sm font-semibold">
                    {trendDirection === 'up' && <Icon type="arrow-trending-up" className={`h-5 w-5 flex-shrink-0 self-center ${trendColorClasses[trendDirection]}`} />}
                    {trendDirection === 'down' && <Icon type="arrow-trending-down" className={`h-5 w-5 flex-shrink-0 self-center ${trendColorClasses[trendDirection]}`} />}
                    <span className="sr-only">{trendDirection === 'up' ? 'Increased by' : 'Decreased by'}</span>
                    <span className={`ml-1 ${trendColorClasses[trendDirection]}`}>{trend}</span>
                </div>
            )}
        </div>
    );
}
