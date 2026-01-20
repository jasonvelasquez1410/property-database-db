import React from 'react';
import { RecentActivity } from '../../types';
import { Icon } from '../shared/Icon';
import { formatDistanceToNow } from 'date-fns';

const activityIcons: { [key: string]: { icon: any, color: string } } = {
    'New Property': { icon: 'properties', color: 'bg-green-100 text-green-700' },
    'Document Upload': { icon: 'document-text', color: 'bg-blue-100 text-blue-700' },
    'Payment Received': { icon: 'finance', color: 'bg-purple-100 text-purple-700' },
    'Task Completed': { icon: 'admin', color: 'bg-sky-100 text-sky-700' },
};

export const RecentActivityWidget = ({ activities }: { activities: RecentActivity[] }) => (
    <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</button>
        </div>
        <ul className="space-y-4">
            {activities.map(activity => (
                <li key={activity.id} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activityIcons[activity.type]?.color || 'bg-gray-100'}`}>
                        <Icon type={activityIcons[activity.type]?.icon || 'document'} className="w-5 h-5"/>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</p>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);
