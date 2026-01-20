import React, { useState, useMemo, useEffect } from 'react';
import { User, Property, Documentation } from '../types';
import { api } from '../services/api';
import { Icon } from './shared/Icon';
import { DocumentCard } from './DocumentCard';
import { UploadDocumentModal } from './UploadDocumentModal';

const docTypes = ['All Documents', 'TCT', 'TD', 'CCT', 'DOAS', 'CTS', 'COL', 'Lease Contract', 'Insurance Policy'];

export const DocumentsPage = ({ user }: { user: User }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Documents');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const props = await api.fetchProperties();
                setProperties(props);
            } catch (error) {
                console.error("Failed to load properties for documents page:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const allDocuments = useMemo(() => {
        return properties.flatMap(p => {
            const docs: Documentation[] = [...p.documentation.docs];
            if (p.lease?.contractUrl && p.lease.contractUrl !== '#') {
                docs.push({ type: 'Lease Contract', status: 'Available', priority: 'Medium', documentUrl: p.lease.contractUrl, fileName: p.lease.contractFileName || 'Lease Contract', propertyId: p.id, propertyName: p.propertyName });
            }
            if (p.insurance?.policyUrl && p.insurance.policyUrl !== '#') {
                 docs.push({ type: 'Insurance Policy', status: 'Available', priority: 'Medium', documentUrl: p.insurance.policyUrl, fileName: p.insurance.policyFileName || 'Insurance Policy', propertyId: p.id, propertyName: p.propertyName });
            }
            return docs;
        });
    }, [properties]);
    
    const filteredDocuments = useMemo(() => {
        return allDocuments.filter(doc => {
            const categoryMatch = selectedCategory === 'All Documents' || doc.type === selectedCategory;
            const searchMatch = !searchTerm || doc.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [allDocuments, selectedCategory, searchTerm]);

    const handleUploadSuccess = (updatedProperty: Property) => {
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
        setIsUploadModalOpen(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 h-full flex flex-col">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
                    <p className="mt-1 text-md text-gray-600">Centralized document storage and management for all properties.</p>
                </div>
                <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors">
                    <Icon type="upload-cloud" className="w-5 h-5" />
                    <span>Quick Upload</span>
                </button>
            </div>
            
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                <aside className="lg:col-span-1 bg-white rounded-xl shadow p-4 flex flex-col">
                    <h3 className="font-bold text-lg mb-4">Document Categories</h3>
                    <div className="space-y-2 overflow-y-auto">
                        {docTypes.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${selectedCategory === cat ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="lg:col-span-3 bg-white rounded-xl shadow p-6 flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Icon type="search" className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search documents by name, property..."
                                className="w-full pl-10 py-2 border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex-grow flex items-center justify-center text-gray-500">Loading documents...</div>
                    ) : filteredDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
                            {filteredDocuments.map((doc, i) => (
                                <DocumentCard key={`${doc.propertyId}-${doc.type}-${i}`} document={doc} />
                            ))}
                        </div>
                    ) : (
                         <div onClick={() => setIsUploadModalOpen(true)} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center flex-grow flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <Icon type="upload-cloud" className="w-16 h-16 text-gray-400 mb-4"/>
                            <h3 className="text-xl font-bold text-gray-800">No documents found</h3>
                            <p className="text-gray-500">Drag and drop documents here or click to browse files</p>
                            <span className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-700">Browse Files</span>
                            <p className="text-xs text-gray-400 mt-4">Supported formats: PDF, DOC, DOCX, JPG, PNG, TIFF.</p>
                        </div>
                    )}
                </main>
            </div>
            {isUploadModalOpen && (
                <UploadDocumentModal
                    properties={properties}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
};