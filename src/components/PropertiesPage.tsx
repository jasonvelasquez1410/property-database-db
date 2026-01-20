import React, { useState, useEffect, useMemo } from 'react';
import { User, Property, PropertyType, Location, PaymentStatus } from '../types';
import { api } from '../services/api';
import { Icon } from './shared/Icon';
import { PropertyTable } from './PropertyTable';
import { PropertyDetailModal } from './PropertyDetailModal';
import { PropertyFormModal } from './PropertyFormModal';
import { PROPERTY_TYPES, LOCATIONS } from '../constants';

interface PropertiesPageProps {
  user: User;
  onLogout: () => void;
}

const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return 'N/A';
    return `₱${amount.toLocaleString('en-US')}`;
}

export const PropertiesPage = ({ user, onLogout }: PropertiesPageProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [filters, setFilters] = useState({
      search: '',
      propertyType: 'all',
      region: 'all',
      paymentStatus: 'all',
      leaseStatus: 'all',
  });

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const props = await api.fetchProperties();
        setProperties(props);
      } catch (error) {
        console.error("Failed to load properties:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
  }

  const handleFormSubmit = async (formData: Omit<Property, 'id' | 'photoUrl'> | Property) => {
    setLoading(true); // Show loading overlay on table
    try {
      if ('id' in formData) {
        const updatedProperty = await api.updateProperty(formData);
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
      } else {
        const newProperty = await api.addProperty(formData);
        setProperties(prev => [newProperty, ...prev]);
      }
    } catch (error) {
      console.error("Failed to save property:", error);
    } finally {
      setEditingProperty(null);
      setIsAddingNew(false);
      setLoading(false);
    }
  };

  const handleOpenEditModal = (property: Property) => {
      setSelectedProperty(null);
      setEditingProperty(property);
  };
  
  const handleOpenAddModal = () => {
      setSelectedProperty(null);
      setEditingProperty(null);
      setIsAddingNew(true);
  }

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
        const { search, propertyType, region, paymentStatus, leaseStatus } = filters;
        if (search && !p.propertyName.toLowerCase().includes(search.toLowerCase()) && !p.fullAddress.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        if (propertyType !== 'all' && p.propertyType !== propertyType) return false;
        if (region !== 'all' && p.location !== region) return false;
        if (paymentStatus !== 'all' && p.payment.status !== paymentStatus) return false;
        if (leaseStatus !== 'all') {
            if (leaseStatus === 'leased' && !p.lease) return false;
            if (leaseStatus === 'vacant' && p.lease) return false;
        }
        return true;
    });
  }, [properties, filters]);
  
  const totalPortfolioValue = useMemo(() => {
      return properties.reduce((acc, p) => {
        const latestAppraisal = p.appraisals?.sort((a,b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
        return acc + (latestAppraisal?.appraisedValue || p.acquisition.totalCost || 0);
    }, 0);
  }, [properties]);

  const isFormOpen = !!editingProperty || isAddingNew;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Dashboard</span>
        <Icon type="chevron-right" className="w-4 h-4" />
        <span className="font-semibold text-gray-700">Properties</span>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
        <p className="mt-1 text-md text-gray-600">Manage your property portfolio with comprehensive tracking and analytics</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="font-semibold text-lg">
            Total Portfolio Value: <span className="text-blue-600">{formatCurrency(totalPortfolioValue)}</span>
        </div>
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border bg-white rounded-md hover:bg-gray-50">
                <Icon type="export" className="w-5 h-5"/> Export
            </button>
            {(user.role === 'admin' || user.role === 'manager') && (
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    <Icon type="plus" className="w-5 h-5" />
                    <span>Add Property</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
          <div className="relative mb-4">
              <Icon type="search" className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search properties by name, location, or any attribute..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md">
                   <option value="all">All Property Types</option>
                   {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
               </select>
               <select name="region" value={filters.region} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md">
                   <option value="all">All Regions</option>
                   {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
               </select>
               <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md">
                   <option value="all">All Payment Statuses</option>
                   {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <select name="leaseStatus" value={filters.leaseStatus} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md">
                   <option value="all">All Lease Statuses</option>
                   <option value="leased">Leased</option>
                   <option value="vacant">Vacant</option>
               </select>
          </div>
      </div>
      
      <div className="bg-white rounded-xl shadow overflow-hidden relative">
        {loading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10"><p>Loading properties...</p></div>}
        <PropertyTable 
            properties={filteredProperties} 
            onSelectProperty={setSelectedProperty} 
            onEditProperty={handleOpenEditModal}
        />
      </div>

      {selectedProperty && (
          <PropertyDetailModal
            property={selectedProperty}
            user={user}
            onClose={() => setSelectedProperty(null)}
            onEdit={handleOpenEditModal}
          />
      )}

      {isFormOpen && (
          <PropertyFormModal 
            key={editingProperty?.id || 'add-new-page'}
            onClose={() => { setEditingProperty(null); setIsAddingNew(false); }}
            onSubmit={handleFormSubmit}
            property={editingProperty}
            loading={false}
          />
      )}
    </div>
  );
};