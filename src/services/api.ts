import { User, Property, PropertyType, Location, PaymentStatus, RecentActivity, Documentation } from '../types';

// Mock user database
const MOCK_USERS: (User & { password_not_hashed: string })[] = [
  { id: 'user-1', email: 'admin@propertyhub.com', password_not_hashed: 'admin123', name: 'John Doe', role: 'admin' },
  { id: 'user-2', email: 'manager@propertyhub.com', password_not_hashed: 'manager123', name: 'Jane Smith', role: 'manager' },
  { id: 'user-3', email: 'staff@propertyhub.com', password_not_hashed: 'staff123', name: 'Peter Jones', role: 'staff' },
];

// Mock property database
let MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    propertyName: 'Makati Prime Condominium Unit',
    photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    propertyType: PropertyType.CONDOMINIUM,
    fullAddress: '123 Ayala Ave, Makati, Metro Manila',
    location: Location.LUZON,
    lotNo: 'Unit 18A, Tower 1',
    tctOrCctNo: 'CCT-12345',
    areaSqm: 85,
    originalDeveloper: 'Ayala Land Premier',
    brokersName: 'Jane Doe Realty',
    brokersContact: '0917-123-4567',
    buyersName: 'John Smith',
    tctUrl: '#', tdUrl: '#', cctUrl: '#', locationPlanUrl: '#',
    acquisition: { unitLotCost: 15000000, costPerSqm: 176470.59, totalCost: 15000000, },
    payment: { status: PaymentStatus.FULLY_PAID, },
    documentation: {
      docs: [
        { type: 'DOAS', status: 'Available (Original)', priority: 'Low', executionDate: '2022-01-15', documentUrl: '#', propertyId: 'prop-1', propertyName: 'Makati Prime Condominium Unit' }
      ],
      pendingDocuments: [],
    },
    possession: { isTurnedOver: true, turnoverDate: '2022-02-01', authorizedRecipient: 'John Smith', },
    insurance: { coverageDate: '2024-01-01', amountInsured: 10000000, insuranceCompany: 'AXA Philippines', policyUrl: '#', },
    management: {
      realEstateTaxes: { lastPaidDate: '2024-01-10', amountPaid: 45000, receiptUrl: '#' },
      condoDues: { lastPaidDate: '2024-07-05', amountPaid: 8500, receiptUrl: '#' },
    },
    appraisals: [
      { appraisalDate: '2023-01-20', appraisedValue: 16000000, appraisalCompany: 'Cuervo Appraisals', reportUrl: '#' },
      { appraisalDate: '2024-02-15', appraisedValue: 16500000, appraisalCompany: 'Cuervo Appraisals', reportUrl: '#' },
    ],
  },
  {
    id: 'prop-2',
    propertyName: 'Cebu Commercial Building',
    photoUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1092&q=80',
    propertyType: PropertyType.COMMERCIAL_BUILDING,
    fullAddress: 'Cebu Business Park, Cebu City',
    location: Location.VISAYAS,
    lotNo: 'Lot 5, Block 3',
    tctOrCctNo: 'TCT-67890',
    areaSqm: 500,
    originalDeveloper: 'Cebu Holdings Inc.',
    brokersName: 'Broker Cebu',
    brokersContact: '0922-987-6543',
    buyersName: 'TechCorp Inc.',
    tctUrl: '#', tdUrl: '#', cctUrl: '#', locationPlanUrl: '#',
    acquisition: { unitLotCost: 75000000, costPerSqm: 150000, totalCost: 75000000, },
    payment: { status: PaymentStatus.FULLY_PAID, },
    lease: { lessee: 'Global Outsourcing Co.', leaseDate: '2023-05-01', leaseRate: 250000, termInYears: 5, referringBroker: 'Prime Leases Inc.', brokerContact: '0918-111-2222', contractUrl: '#', },
    documentation: {
      docs: [
        { type: 'TCT', status: 'Missing Original', priority: 'High', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), documentUrl: '#', propertyId: 'prop-2', propertyName: 'Cebu Commercial Building' },
        { type: 'TD', status: 'For Submission', priority: 'Medium', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), documentUrl: '#', propertyId: 'prop-2', propertyName: 'Cebu Commercial Building' }
      ],
      pendingDocuments: ['Original TCT from seller', 'Updated Tax Declaration'],
    },
    possession: { isTurnedOver: true, turnoverDate: '2021-09-01', authorizedRecipient: 'TechCorp Representative', },
    insurance: { coverageDate: '2024-02-01', amountInsured: 60000000, insuranceCompany: 'Malayan Insurance', policyUrl: '#', },
    management: { caretakerName: 'Building Admin', realEstateTaxes: { lastPaidDate: '2024-03-15', amountPaid: 150000, receiptUrl: '#' }, },
    appraisals: [
       { appraisalDate: '2023-03-10', appraisedValue: 80000000, appraisalCompany: 'Asian Appraisal Company', reportUrl: '#' },
       { appraisalDate: '2024-04-10', appraisedValue: 82500000, appraisalCompany: 'Asian Appraisal Company', reportUrl: '#' },
    ],
  },
  {
    id: 'prop-3',
    propertyName: 'Davao Agricultural Land',
    photoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80',
    propertyType: PropertyType.LAND_WITH_IMPROVEMENTS,
    fullAddress: 'Calinan, Davao City',
    location: Location.MINDANAO,
    lotNo: 'Lot 123-A',
    tctOrCctNo: 'TCT-11223',
    areaSqm: 10000, // 1 Hectare
    originalDeveloper: 'N/A',
    brokersName: 'Mindanao Realty',
    brokersContact: '0945-333-4444',
    buyersName: 'AgriInvest Corp.',
    tctUrl: '#', tdUrl: '#', cctUrl: '#', locationPlanUrl: '#',
    acquisition: { unitLotCost: 5000000, costPerSqm: 500, totalCost: 5000000, },
    payment: { status: PaymentStatus.AMORTIZED, paymentScheduleUrl: '#', },
    documentation: {
      docs: [
        { type: 'CTS', status: 'Available (Copy)', priority: 'Low', executionDate: '2023-06-01', documentUrl: '#', propertyId: 'prop-3', propertyName: 'Davao Agricultural Land' }
      ],
      pendingDocuments: ['Deed of Absolute Sale upon full payment'],
    },
    possession: { isTurnedOver: false, },
    management: { caretakerName: 'Mang Teban', caretakerRatePerMonth: 10000, realEstateTaxes: { lastPaidDate: '2024-01-20', amountPaid: 15000, receiptUrl: '#' }, },
    appraisals: [
      { appraisalDate: '2023-05-15', appraisedValue: 5500000, appraisalCompany: 'Local Assessor Office', reportUrl: '#' },
      { appraisalDate: '2024-05-20', appraisedValue: 6000000, appraisalCompany: 'Local Assessor Office', reportUrl: '#' },
    ],
  },
];

const MOCK_ACTIVITY: RecentActivity[] = [
    { id: 'act-1', type: 'New Property', title: 'New Property Added', description: 'Makati Commercial Building - Unit 2A', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: 'act-2', type: 'Document Upload', title: 'Document Uploaded', description: 'TCT for Cebu Land Property', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 'act-3', type: 'Payment Received', title: 'Payment Received', description: 'Lease payment from Global Outsourcing', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'act-4', type: 'Task Completed', title: 'Task Completed', description: 'Updated appraisal for Davao Land', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];


export const api = {
  login: (email: string, password_not_hashed: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (u) => u.email === email && u.password_not_hashed === password_not_hashed
        );
        if (user) {
            const { password_not_hashed, ...userToReturn } = user;
            resolve(userToReturn);
        } else {
            resolve(null);
        }
      }, 500);
    });
  },
  fetchProperties: (): Promise<Property[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_PROPERTIES);
      }, 800);
    });
  },
  fetchRecentActivity: (): Promise<RecentActivity[]> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve(MOCK_ACTIVITY);
          }, 400);
      });
  },
  fetchPendingDocuments: (): Promise<Documentation[]> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const pending: Documentation[] = [];
              MOCK_PROPERTIES.forEach(p => {
                  p.documentation.docs.forEach(doc => {
                      if (doc.status.includes('Missing') || doc.status.includes('Submission')) {
                          pending.push(doc);
                      }
                  })
              });
              resolve(pending.sort((a,b) => (a.priority === 'High' ? -1 : 1)));
          }, 600);
      });
  },
  addProperty: (propertyData: Omit<Property, 'id' | 'photoUrl'>): Promise<Property> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newProperty: Property = {
                ...propertyData,
                id: `prop-${Date.now()}`,
                photoUrl: `https://picsum.photos/seed/new${Date.now()}/800/600`,
            };
            MOCK_PROPERTIES.unshift(newProperty);
            resolve(newProperty);
        }, 500);
    });
  },
  updateProperty: (propertyData: Property): Promise<Property> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = MOCK_PROPERTIES.findIndex(p => p.id === propertyData.id);
            if (index !== -1) {
                MOCK_PROPERTIES[index] = propertyData;
                resolve(propertyData);
            } else {
                reject(new Error("Property not found"));
            }
        }, 500);
    });
  },
  addDocumentToProperty: (propertyId: string, doc: Omit<Documentation, 'propertyId' | 'propertyName'>): Promise<Property> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const propertyIndex = MOCK_PROPERTIES.findIndex(p => p.id === propertyId);
        if (propertyIndex !== -1) {
          const property = MOCK_PROPERTIES[propertyIndex];
          const newDoc: Documentation = {
            ...doc,
            propertyId: property.id,
            propertyName: property.propertyName,
          };
          property.documentation.docs.push(newDoc);
          resolve(property);
        } else {
          reject(new Error('Property not found'));
        }
      }, 300);
    });
  },
};