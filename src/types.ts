export enum PropertyType {
  LAND_WITH_IMPROVEMENTS = 'Land with Agricultural Improvements',
  LAND_WITHOUT_IMPROVEMENTS = 'Land w/o Agricultural Improvements',
  LAND_AND_BUILDING = 'Land and Building',
  HOUSE_AND_LOT = 'House and Lot',
  COMMERCIAL_BUILDING = 'Commercial Building',
  CONDOTEL = 'Condotel',
  CONDOMINIUM = 'Condominium',
  WAREHOUSE_AND_LOT = 'Warehouse & Lot',
}

export enum Location {
  LUZON = 'Luzon',
  VISAYAS = 'Visayas',
  MINDANAO = 'Mindanao',
}

export enum PaymentStatus {
  CASH = 'Cash',
  AMORTIZED = 'Amortized',
  FULLY_PAID = 'Fully Paid',
}

export type Page = 'dashboard' | 'properties' | 'documents' | 'finance' | 'settings' | 'help' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface AcquisitionCost {
  unitLotCost: number;
  costPerSqm: number;
  fitOutCost?: number;
  totalCost: number;
}

export interface PaymentInfo {
  status: PaymentStatus;
  paymentScheduleUrl?: string;
  paymentScheduleFileName?: string;
}

export interface LeaseInfo {
  lessee: string;
  leaseDate: string;
  leaseRate: number;
  termInYears: number;
  referringBroker: string;
  brokerContact: string;
  contractUrl: string;
  contractFileName?: string;
}

export interface Documentation {
  type: 'CTS' | 'DOAS' | 'COL' | 'TCT' | 'TD' | 'CCT' | 'Lease Contract' | 'Insurance Policy';
  status: string; // e.g., 'Missing Original', 'Available (Copy)', 'For Submission'
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  executionDate?: string;
  documentUrl: string;
  fileName?: string;
  propertyId: string; // To link back to property
  propertyName: string;
}

export interface DocumentationStatus {
  docs: Documentation[];
  pendingDocuments: string[];
}

export interface PossessionStatus {
  isTurnedOver: boolean;
  turnoverDate?: string;
  authorizedRecipient?: string;
}

export interface Insurance {
  coverageDate: string;
  amountInsured: number;
  insuranceCompany: string;
  policyUrl: string;
  policyFileName?: string;
}

export interface PropertyManagement {
  caretakerName?: string;
  caretakerRatePerMonth?: number;
  realEstateTaxes: {
    lastPaidDate?: string;
    amountPaid?: number;
    receiptUrl?: string;
    receiptFileName?: string;
  };
  condoDues?: {
    lastPaidDate?: string;
    amountPaid?: number;
    receiptUrl?: string;
    receiptFileName?: string;
  };
}

export interface Appraisal {
  appraisalDate: string;
  appraisedValue: number;
  appraisalCompany: string;
  reportUrl: string;
  reportFileName?: string;
}

export interface Property {
  id: string;
  propertyName: string;
  photoUrl: string;
  propertyType: PropertyType;
  fullAddress: string;
  location: Location;
  unitNumber?: string;
  floorNumber?: string;
  lotNo: string;
  tctOrCctNo: string;
  areaSqm: number;
  originalDeveloper: string;
  brokersName: string;
  brokersContact: string;
  buyersName: string;
  tctUrl: string;
  tctFileName?: string;
  tdUrl: string;
  tdFileName?: string;
  cctUrl: string;
  cctFileName?: string;
  locationPlanUrl: string;
  locationPlanFileName?: string;
  acquisition: AcquisitionCost;
  payment: PaymentInfo;
  lease?: LeaseInfo;
  documentation: DocumentationStatus;
  possession: PossessionStatus;
  insurance?: Insurance;
  management: PropertyManagement;
  appraisals: Appraisal[];
}

export interface RecentActivity {
  id: string;
  type: 'New Property' | 'Document Upload' | 'Payment Received' | 'Task Completed';
  title: string;
  description: string;
  timestamp: string;
}