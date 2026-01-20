import React, { useState } from 'react';
import { Property, Documentation } from '../types';
import { Icon } from './shared/Icon';
import { FormField } from './shared/FormField';
import { FileUploadControl } from './shared/FileUploadControl';
import { api } from '../services/api';

interface UploadDocumentModalProps {
    properties: Property[];
    onClose: () => void;
    onUploadSuccess: (updatedProperty: Property) => void;
}

export const UploadDocumentModal = ({ properties, onClose, onUploadSuccess }: UploadDocumentModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || '');
    const [documentType, setDocumentType] = useState<Documentation['type']>('CTS');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !propertyId || !documentType) {
            setError('All fields are required.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const newDoc: Omit<Documentation, 'propertyId' | 'propertyName'> = {
                type: documentType,
                status: 'Available (Uploaded)',
                priority: 'Medium',
                documentUrl: URL.createObjectURL(file),
                fileName: file.name,
                executionDate: new Date().toISOString(),
            };
            const updatedProperty = await api.addDocumentToProperty(propertyId, newDoc);
            onUploadSuccess(updatedProperty);

        } catch (err) {
            setError('Failed to upload document. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <header className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                        <p className="text-sm text-gray-500">Add a new document to a property.</p>
                    </header>
                    <main className="p-6 space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <FormField label="Select Property" id="propertyId" required>
                            <select id="propertyId" value={propertyId} onChange={e => setPropertyId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                {properties.map(p => <option key={p.id} value={p.id}>{p.propertyName}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Document Type" id="documentType" required>
                             <select id="documentType" value={documentType} onChange={e => setDocumentType(e.target.value as Documentation['type'])} className="w-full border-gray-300 rounded-md shadow-sm">
                                <option value="CTS">CTS</option>
                                <option value="DOAS">DOAS</option>
                                <option value="COL">COL</option>
                                <option value="TCT">TCT</option>
                                <option value="TD">TD</option>
                                <option value="CCT">CCT</option>
                                <option value="Lease Contract">Lease Contract</option>
                                <option value="Insurance Policy">Insurance Policy</option>
                            </select>
                        </FormField>
                         <FormField label="File" id="fileUpload" required>
                            <FileUploadControl 
                                id="doc-upload" 
                                onFileChange={setFile}
                                fileName={file?.name}
                                fileUrl={file ? URL.createObjectURL(file) : undefined}
                            />
                         </FormField>
                    </main>
                    <footer className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading || !file} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
