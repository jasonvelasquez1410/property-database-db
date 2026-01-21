import React from 'react';
import { Property } from '../types';
import { Icon } from './shared/Icon';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
}

export const PropertyCard = ({ property, onClick, onEdit }: PropertyCardProps) => {
  // Determine display image
  const displayImage = property.images && property.images.length > 0
    ? (property.images.find(img => img.isPrimary) || property.images[0]).imageUrl
    : property.photoUrl;

  const acquisitionCost = property.acquisition?.totalCost || 0;
  const appraisedValue = property.appraisals && property.appraisals.length > 0
    ? property.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0].appraisedValue
    : 0;

  const valueToDisplay = appraisedValue > 0 ? appraisedValue : acquisitionCost;

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden active:scale-95 transition-transform duration-100 cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] w-full bg-gray-200">
        <img
          src={displayImage}
          alt={property.propertyName}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${property.propertyType === 'Condominium' ? 'bg-blue-100 text-blue-800' :
              property.propertyType === 'Commercial' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
            }`}>
            {property.propertyType}
          </span>
          {property.lease && (
            <span className="px-2 py-1 rounded-full text-xs font-bold shadow-sm bg-yellow-100 text-yellow-800">
              Leased
            </span>
          )}
        </div>

        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(e); }}
            className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-lg text-gray-700 hover:text-blue-600 active:bg-blue-50"
          >
            <Icon type="edit" className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{property.propertyName}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Icon type="location" className="w-3.5 h-3.5" />
            {property.location}
          </p>
        </div>

        <div className="flex justify-between items-end pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Value</p>
            <p className="font-bold text-blue-700">₱{valueToDisplay.toLocaleString()}</p>
          </div>

          {property.images && property.images.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <Icon type="image" className="w-3 h-3" />
              <span>{property.images.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};