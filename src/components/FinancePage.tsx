import React, { useState, useEffect, useMemo } from 'react';
import { User, Property, PropertyType, PaymentStatus } from '../types';
import { api } from '../services/api';
import { Icon } from './shared/Icon';
import { SummaryCard } from './SummaryCard';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, TimeScale } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Automatically registers all components

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, TimeScale);

const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface FinancePageProps {
    user: User;
}

export const FinancePage = ({ user }: FinancePageProps) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const props = await api.fetchProperties();
                setProperties(props);
            } catch (error) {
                console.error("Failed to fetch properties:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleExportReport = () => {
        // Generate CSV content
        const headers = ['Property Name', 'Type', 'Acquisition Cost', 'Market Value', 'Payment Status', 'Last Updated'];
        const rows = properties.map(p => {
            const latestAppraisal = p.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
            const marketValue = latestAppraisal?.appraisedValue || p.acquisition.totalCost;
            return [
                `"${p.propertyName}"`,
                p.propertyType,
                p.acquisition.totalCost,
                marketValue,
                p.payment.status,
                new Date().toLocaleDateString()
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(',') + "\n"
            + rows.join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert("Financial Report exported successfully!");
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const financialSummary = useMemo(() => {
        const totalAcquisitionCost = properties.reduce((sum, p) => sum + p.acquisition.totalCost, 0);
        const totalMarketValue = properties.reduce((sum, p) => {
            const latestAppraisal = p.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
            return sum + (latestAppraisal?.appraisedValue || p.acquisition.totalCost);
        }, 0);

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const upcomingDueDates = properties.flatMap(p => p.documentation.docs)
            .filter(doc => doc.dueDate && new Date(doc.dueDate) <= thirtyDaysFromNow && new Date(doc.dueDate) >= new Date())
            .length;

        const previousMarketValue = properties.reduce((sum, p) => {
            const appraisals = p.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime());
            // Use second to last appraisal, or acquisition cost if not available
            return sum + (appraisals[1]?.appraisedValue || p.acquisition.totalCost);
        }, 0);

        const valueChangePercentage = totalMarketValue > 0 ? ((totalMarketValue - previousMarketValue) / previousMarketValue) * 100 : 0;

        return {
            totalAcquisitionCost,
            totalMarketValue,
            outstandingPayments: 31360000, // This remains mocked as the data model doesn't support it
            upcomingDueDates,
            valueChangePercentage
        };
    }, [properties]);

    const chartData = useMemo(() => {
        const costDistribution = properties.reduce((acc, p) => {
            acc[p.propertyType] = (acc[p.propertyType] || 0) + p.acquisition.totalCost;
            return acc;
        }, {} as Record<PropertyType, number>);

        const paymentStatus = properties.reduce((acc, p) => {
            acc[p.payment.status] = (acc[p.payment.status] || 0) + 1;
            return acc;
        }, {} as Record<PaymentStatus, number>);

        const allAppraisals = properties.flatMap(p => p.appraisals.map(a => ({ ...a, propertyId: p.id, acquisitionCost: p.acquisition.totalCost })));
        const trendData: Record<string, number> = {};
        if (properties.length > 0) {
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });

                const monthValue = properties.reduce((sum, p) => {
                    const latestAppraisalForMonth = p.appraisals
                        .filter(a => new Date(a.appraisalDate) <= date)
                        .sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
                    return sum + (latestAppraisalForMonth?.appraisedValue || p.acquisition.totalCost);
                }, 0);
                trendData[monthKey] = monthValue;
            }
        }

        return {
            costDistribution: {
                labels: Object.keys(costDistribution),
                datasets: [{
                    label: 'Total Acquisition Cost',
                    data: Object.values(costDistribution),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                }],
            },
            paymentStatus: {
                labels: Object.keys(paymentStatus),
                datasets: [{
                    data: Object.values(paymentStatus),
                    backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
                }]
            },
            marketValueTrend: {
                labels: Object.keys(trendData),
                datasets: [{
                    label: 'Portfolio Market Value',
                    data: Object.values(trendData),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        };
    }, [properties]);

    if (loading) {
        return <div className="p-8 text-center">Loading financial data...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Financial Tracking</h1>
                <p className="mt-1 text-md text-gray-600">Monitor payments, costs, and financial performance across your property portfolio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Acquisition Cost"
                    value={formatCurrency(financialSummary.totalAcquisitionCost)}
                    description="Total invested capital"
                    trend="+2.5%"
                    trendDirection="up"
                    icon="dollar-circle"
                    onClick={() => scrollToSection('cost-chart')}
                />
                <SummaryCard
                    title="Current Market Value"
                    value={formatCurrency(financialSummary.totalMarketValue)}
                    description="Current valuation"
                    trend={`+${financialSummary.valueChangePercentage.toFixed(1)}%`}
                    trendDirection="up"
                    icon="chart-pie"
                    onClick={() => scrollToSection('value-trend-chart')}
                />
                <SummaryCard
                    title="Outstanding Payments"
                    value={formatCurrency(financialSummary.outstandingPayments)}
                    description="Payables"
                    trend="-15.3%"
                    trendDirection="down"
                    icon="exclamation-triangle"
                    onClick={() => scrollToSection('payment-status-chart')}
                />
                <SummaryCard
                    title="Upcoming Due Dates"
                    value={financialSummary.upcomingDueDates.toString()}
                    description="Due in next 30 days"
                    trend=""
                    trendDirection="none"
                    icon="calendar-days"
                    onClick={() => alert("Showing upcoming due dates filtering...")}
                />
            </div>

            <div className="bg-white rounded-xl shadow p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Financial Filters</h3>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border bg-white rounded-md hover:bg-gray-50">Bulk Update</button>
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border bg-white rounded-md hover:bg-gray-50"
                            onClick={handleExportReport}
                        >
                            <Icon type="export" className="w-5 h-5" /> Export Report
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" placeholder="Search properties..." className="w-full border-gray-300 rounded-md" />
                    <input type="text" placeholder="Region" className="w-full border-gray-300 rounded-md" />
                    <input type="text" placeholder="Due Date Range" className="w-full border-gray-300 rounded-md" />
                    <input type="text" placeholder="Property Type" className="w-full border-gray-300 rounded-md" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div id="cost-chart" className="lg:col-span-3 bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Distribution by Property Type</h3>
                    <div className="h-80">
                        <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData.costDistribution} />
                    </div>
                </div>
                <div id="payment-status-chart" className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status Distribution</h3>
                    <div className="h-80">
                        <Pie options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} data={chartData.paymentStatus} />
                    </div>
                </div>
            </div>

            <div id="value-trend-chart" className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Market Value Trends</h3>
                <div className="h-80">
                    <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData.marketValueTrend} />
                </div>
            </div>
        </div>
    );
};