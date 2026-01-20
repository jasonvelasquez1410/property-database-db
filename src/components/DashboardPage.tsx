import React, { useState, useEffect, useMemo } from 'react';
import { User, Property, RecentActivity, Documentation as DocType, Location } from '../types';
import { api } from '../services/api';
import { PropertyFormModal } from './PropertyFormModal';
import { SummaryCard } from './SummaryCard';
import { Header } from './layout/Header';
import { RecentActivityWidget } from './dashboard/RecentActivityWidget';
import { PendingDocumentsWidget } from './dashboard/PendingDocumentsWidget';
import { QuickActionsWidget } from './dashboard/QuickActionsWidget';



interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: any) => void;
}

const formatCurrency = (amount?: number) => {
  if (typeof amount !== 'number') return 'N/A';
  return `₱${(amount / 1000000).toFixed(2)}M`;
}

export const DashboardPage = ({ user, onLogout, onNavigate }: DashboardPageProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingDocs, setPendingDocs] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [props, activity, docs] = await Promise.all([
          api.fetchProperties(),
          api.fetchRecentActivity(),
          api.fetchPendingDocuments(),
        ]);
        setProperties(props);
        setRecentActivity(activity);
        setPendingDocs(docs);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleFormSubmit = async (formData: Omit<Property, 'id' | 'photoUrl'> | Property) => {
    // This logic remains for the "Add Property" quick action
    setLoading(true);
    try {
      if ('id' in formData) {
        // Update logic would be handled on a different page now
      } else {
        const newProperty = await api.addProperty(formData);
        setProperties(prev => [newProperty, ...prev]);
      }
    } catch (error) {
      console.error("Failed to save property:", error);
    } finally {
      setLoading(false);
      setIsFormOpen(false);
    }
  };


  const summaryStats = useMemo(() => {
    if (!properties.length) {
      return { totalProperties: 0, totalValue: 0, needsAttention: 0, upcomingPayments: 0 };
    }
    const totalValue = properties.reduce((acc, p) => {
      const latestAppraisal = p.appraisals?.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
      return acc + (latestAppraisal?.appraisedValue || p.acquisition.totalCost || 0);
    }, 0);

    return {
      totalProperties: properties.length,
      totalValue: totalValue,
      needsAttention: pendingDocs.length,
      upcomingPayments: 12, // Mocked for now
    }
  }, [properties, pendingDocs]);

  return (
    <div className="bg-gray-50 pb-10">
      <Header user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-md text-gray-600">Welcome back, {user.name}! Here’s an overview of your property portfolio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <SummaryCard
            icon="properties"
            title="Total Properties"
            value={summaryStats.totalProperties.toString()}
            description="Active properties"
            trend="+3 this month"
            trendDirection="up"
            onClick={() => onNavigate('properties')} // Go to properties list
          />
          <SummaryCard
            icon="chart-pie"
            title="Total Market Value"
            value={formatCurrency(summaryStats.totalValue)}
            description="Current portfolio value"
            trend="+5.2% from last quarter"
            trendDirection="up"
            onClick={() => onNavigate('finance')} // Go to finance
          />
          <SummaryCard
            icon="exclamation-triangle"
            title="Needs Attention"
            value={summaryStats.needsAttention.toString()}
            description="Properties requiring action"
            trend=""
            trendDirection="none"
            onClick={() => onNavigate('documents')} // Go to documents/issues
          />
          <SummaryCard
            icon="calendar-days"
            title="Upcoming Payments"
            value={summaryStats.upcomingPayments.toString()}
            description="Due in next 30 days"
            trend=""
            trendDirection="none"
            onClick={() => onNavigate('finance')} // Go to finance
          />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RecentActivityWidget activities={recentActivity} />
            <PendingDocumentsWidget documents={pendingDocs} />
          </div>
          <div className="lg:col-span-1">
            <QuickActionsWidget onAddProperty={() => setIsFormOpen(true)} />
          </div>
        </div>
      </main>

      {isFormOpen && (
        <PropertyFormModal
          key={'add-new-dashboard'}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          property={null}
          loading={loading}
        />
      )}
    </div>
  );
};