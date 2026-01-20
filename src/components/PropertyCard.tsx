
import React from 'react';
import { Property } from '../types';
import { Icon } from './shared/Icon';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out flex flex-col">
      <div className="relative">
        <img className="h-48 w-full object-cover" src={property.photoUrl} alt={property.propertyName} />
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">{property.propertyType}</div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 truncate">{property.propertyName}</h3>
        <div className="flex items-center text-sm text-gray-600 mt-1 mb-3">
            <Icon type="location" className="w-4 h-4 mr-1.5 text-gray-400" />
            <span>{property.location}</span>
        </div>
        <div className="flex-grow">
          <p className="text-xs text-gray-500 line-clamp-2">{property.fullAddress}</p>
        </div>
        <div className="mt-4 border-t pt-3 flex justify-between items-center text-sm">
            <p className="text-gray-700">Area: <span className="font-semibold">{property.areaSqm.toLocaleString()} sqm</span></p>
            <button
                onClick={() => onSelect(property)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};