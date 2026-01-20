
import { User, Property, PropertyType, Location, PaymentStatus, RecentActivity, Documentation, Appraisal } from '../types';
import { supabase } from './supabaseClient';

// Helper to map DB row to Property object
const mapRowToProperty = (row: any): Property => {
  return {
    id: row.id,
    propertyName: row.property_name,
    photoUrl: row.photo_url || 'https://via.placeholder.com/800x600?text=No+Image',
    propertyType: row.property_type as PropertyType,
    fullAddress: row.full_address,
    location: row.location as Location,
    gpsCoordinates: row.gps_coordinates,
    videoUrl: row.video_url,
    unitNumber: row.unit_number,
    floorNumber: row.floor_number,
    lotNo: row.lot_no,
    tctOrCctNo: row.tct_or_cct_no,
    areaSqm: row.area_sqm,
    originalDeveloper: row.original_developer,
    brokersName: row.brokers_name,
    brokersContact: row.brokers_contact,
    buyersName: row.buyers_name,
    tctUrl: row.tct_url, tctFileName: row.tct_file_name,
    tdUrl: row.td_url, tdFileName: row.td_file_name,
    cctUrl: row.cct_url, cctFileName: row.cct_file_name,
    locationPlanUrl: row.location_plan_url, locationPlanFileName: row.location_plan_file_name,
    acquisition: {
      unitLotCost: row.acquisition_unit_lot_cost,
      costPerSqm: row.acquisition_cost_per_sqm,
      fitOutCost: row.acquisition_fit_out_cost,
      totalCost: row.acquisition_total_cost
    },
    payment: {
      status: row.payment_status as PaymentStatus,
      paymentScheduleUrl: row.payment_schedule_url,
      paymentScheduleFileName: row.payment_schedule_file_name
    },
    lease: row.lease_lessee ? {
      lessee: row.lease_lessee,
      leaseDate: row.lease_date,
      leaseRate: row.lease_rate,
      termInYears: row.lease_term_years,
      referringBroker: row.lease_referring_broker,
      brokerContact: row.lease_broker_contact,
      contractUrl: row.lease_contract_url,
      contractFileName: row.lease_contract_file_name
    } : undefined,
    // Documentation and Appraisals are fetched separately or joined
    documentation: { docs: [], pendingDocuments: row.pending_documents || [] },
    possession: {
      isTurnedOver: row.possession_is_turned_over,
      turnoverDate: row.possession_turnover_date,
      authorizedRecipient: row.possession_authorized_recipient
    },
    insurance: row.insurance_company ? {
      coverageDate: row.insurance_coverage_date,
      amountInsured: row.insurance_amount_insured,
      insuranceCompany: row.insurance_company,
      policyUrl: row.insurance_policy_url,
      policyFileName: row.insurance_policy_file_name
    } : undefined,
    management: {
      caretakerName: row.caretaker_name,
      caretakerRatePerMonth: row.caretaker_rate,
      realEstateTaxes: {
        lastPaidDate: row.real_estate_tax_last_paid,
        amountPaid: row.real_estate_tax_amount,
        receiptUrl: row.real_estate_tax_receipt_url,
        receiptFileName: row.real_estate_tax_receipt_file_name
      },
      condoDues: {
        lastPaidDate: row.condo_dues_last_paid,
        amountPaid: row.condo_dues_amount,
        receiptUrl: row.condo_dues_receipt_url,
        receiptFileName: row.condo_dues_receipt_file_name
      }
    },
    appraisals: [] // Populated separately
  };
};

const mapPropertyToRow = (p: Omit<Property, 'id' | 'photoUrl'> | Property) => {
  return {
    property_name: p.propertyName,
    // photo_url handled separately or passed if exists
    property_type: p.propertyType,
    full_address: p.fullAddress,
    location: p.location,
    gps_coordinates: p.gpsCoordinates,
    video_url: p.videoUrl,
    unit_number: p.unitNumber,
    floor_number: p.floorNumber,
    lot_no: p.lotNo,
    tct_or_cct_no: p.tctOrCctNo,
    area_sqm: p.areaSqm,
    original_developer: p.originalDeveloper,
    brokers_name: p.brokersName,
    brokers_contact: p.brokersContact,
    buyers_name: p.buyersName,
    tct_url: p.tctUrl, tct_file_name: p.tctFileName,
    td_url: p.tdUrl, td_file_name: p.tdFileName,
    cct_url: p.cctUrl, cct_file_name: p.cctFileName,
    location_plan_url: p.locationPlanUrl, location_plan_file_name: p.locationPlanFileName,
    acquisition_unit_lot_cost: p.acquisition.unitLotCost,
    acquisition_cost_per_sqm: p.acquisition.costPerSqm,
    acquisition_fit_out_cost: p.acquisition.fitOutCost,
    acquisition_total_cost: p.acquisition.totalCost,
    payment_status: p.payment.status,
    payment_schedule_url: p.payment.paymentScheduleUrl,
    payment_schedule_file_name: p.payment.paymentScheduleFileName,
    lease_lessee: p.lease?.lessee,
    lease_date: p.lease?.leaseDate,
    lease_rate: p.lease?.leaseRate,
    lease_term_years: p.lease?.termInYears,
    lease_referring_broker: p.lease?.referringBroker,
    lease_broker_contact: p.lease?.brokerContact,
    lease_contract_url: p.lease?.contractUrl,
    lease_contract_file_name: p.lease?.contractFileName,
    possession_is_turned_over: p.possession.isTurnedOver,
    possession_turnover_date: p.possession.turnoverDate,
    possession_authorized_recipient: p.possession.authorizedRecipient,
    insurance_coverage_date: p.insurance?.coverageDate,
    insurance_amount_insured: p.insurance?.amountInsured,
    insurance_company: p.insurance?.insuranceCompany,
    insurance_policy_url: p.insurance?.policyUrl,
    insurance_policy_file_name: p.insurance?.policyFileName,
    caretaker_name: p.management.caretakerName,
    caretaker_rate: p.management.caretakerRatePerMonth,
    real_estate_tax_last_paid: p.management.realEstateTaxes.lastPaidDate,
    real_estate_tax_amount: p.management.realEstateTaxes.amountPaid,
    real_estate_tax_receipt_url: p.management.realEstateTaxes.receiptUrl,
    real_estate_tax_receipt_file_name: p.management.realEstateTaxes.receiptFileName,
    condo_dues_last_paid: p.management.condoDues?.lastPaidDate,
    condo_dues_amount: p.management.condoDues?.amountPaid,
    condo_dues_receipt_url: p.management.condoDues?.receiptUrl,
    condo_dues_receipt_file_name: p.management.condoDues?.receiptFileName,
    pending_documents: p.documentation.pendingDocuments
  };
};

export const api = {
  login: async (email: string, password_not_hashed: string): Promise<User | null> => {
    // Authenticate with Supabase Auth
    // Try Supabase Auth first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password_not_hashed,
      });

      if (!error && data.user) {
        // Fetch user profile if exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.name || 'User',
          role: (profile?.role as any) || 'staff'
        };
      }
    } catch (e) {
      console.warn("Supabase login failed or not configured, falling back to mock:", e);
    }

    // Fallback: Check mock users (for demo/local/offline)
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password_not_hashed === password_not_hashed);
    if (mockUser) {
      const { password_not_hashed, ...u } = mockUser;
      return u as User;
    }

    return null;
  },

  fetchProperties: async (): Promise<Property[]> => {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    // Fetch related data (Documents, Appraisals) for each property
    // Optimization: Could use join query, but loop is simpler for now given small dataset
    const fullProperties = await Promise.all(properties.map(async (p) => {
      const prop = mapRowToProperty(p);

      // Fetch Documents
      const { data: docs } = await supabase.from('documents').select('*').eq('property_id', p.id);
      if (docs) {
        prop.documentation.docs = docs.map((d: any) => ({
          type: d.type,
          status: d.status,
          priority: d.priority,
          dueDate: d.due_date,
          executionDate: d.execution_date,
          documentUrl: d.document_url,
          fileName: d.file_name,
          propertyId: p.id,
          propertyName: p.property_name
        }));
      }

      // Fetch Appraisals
      const { data: appraisals } = await supabase.from('appraisals').select('*').eq('property_id', p.id);
      if (appraisals) {
        prop.appraisals = appraisals.map((a: any) => ({
          appraisalDate: a.appraisal_date,
          appraisedValue: a.appraised_value,
          appraisalCompany: a.appraisal_company,
          reportUrl: a.report_url,
          reportFileName: a.report_file_name
        }));
      }

      return prop;
    }));

    return fullProperties;
  },

  fetchRecentActivity: async (): Promise<RecentActivity[]> => {
    const { data, error } = await supabase
      .from('recent_activities')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) return [];
    return data as RecentActivity[];
  },

  fetchPendingDocuments: async (): Promise<Documentation[]> => {
    // This is a derived query.
    // Option 1: Fetch all properties and extract.
    // Option 2: specific query on documents table where status != 'Available'
    const { data, error } = await supabase
      .from('documents')
      .select(`
                *,
                properties (property_name)
            `)
      .or('status.eq.Missing Original,status.eq.For Submission,status.eq.In Progress'); // Example fiters

    if (error) return [];

    return data.map((d: any) => ({
      type: d.type,
      status: d.status,
      priority: d.priority,
      dueDate: d.due_date,
      executionDate: d.execution_date,
      documentUrl: d.document_url,
      fileName: d.file_name,
      propertyId: d.property_id,
      propertyName: d.properties?.property_name || 'Unknown Property'
    })).sort((a: any, b: any) => (a.priority === 'High' ? -1 : 1));
  },

  addProperty: async (propertyData: Omit<Property, 'id' | 'photoUrl'>): Promise<Property> => {
    const rowData = mapPropertyToRow(propertyData);
    // Add random photo (placeholder)
    const photoUrl = `https://picsum.photos/seed/new${Date.now()}/800/600`;

    const { data, error } = await supabase
      .from('properties')
      .insert([{ ...rowData, photo_url: photoUrl }])
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('recent_activities').insert([{
      type: 'New Property',
      title: 'New Property Added',
      description: data.property_name
    }]);

    return mapRowToProperty(data);
  },

  updateProperty: async (propertyData: Property): Promise<Property> => {
    const rowData = mapPropertyToRow(propertyData);
    const { data, error } = await supabase
      .from('properties')
      .update(rowData)
      .eq('id', propertyData.id)
      .select()
      .single();

    if (error) throw error;
    return mapRowToProperty(data);
  },

  addDocumentToProperty: async (propertyId: string, doc: Omit<Documentation, 'propertyId' | 'propertyName'>): Promise<Property> => {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        property_id: propertyId,
        type: doc.type,
        status: doc.status,
        priority: doc.priority,
        due_date: doc.dueDate,
        execution_date: doc.executionDate,
        document_url: doc.documentUrl,
        file_name: doc.fileName
      }])
      .select();

    if (error) throw error;

    // Log activity
    await supabase.from('recent_activities').insert([{
      type: 'Document Upload',
      title: 'Document Uploaded',
      description: `${doc.type} for property`
    }]);

    // Return updated property (re-fetch)
    const { data: propData } = await supabase.from('properties').select('*').eq('id', propertyId).single();
    return mapRowToProperty(propData);
  },

  // Seed Data Function (Replaces Reset)
  resetToDemoData: async () => {
    // WARNING: This deletes everything in the DB!
    // For production, this should be disabled or protected.
    // But for this "transition" phase, it's useful to populate the DB.

    // 1. Clear Tables
    await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    await supabase.from('appraisals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Demo Properties (The mapped objects from the OLD api.ts)
    const demoProps = [
      {
        property_name: 'Makati Prime Condominium Unit',
        property_type: 'Condominium',
        full_address: '123 Ayala Ave, Makati, Metro Manila',
        location: 'Luzon',
        gps_coordinates: '14.5547, 121.0244',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        unit_number: '18A', floor_number: '18th Floor', lot_no: 'Unit 18A, Tower 1', tct_or_cct_no: 'CCT-12345',
        area_sqm: 85, original_developer: 'Ayala Land Premier', brokers_name: 'Jane Doe Realty', brokers_contact: '0917-123-4567', buyers_name: 'John Smith',
        photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
        acquisition_unit_lot_cost: 15000000, acquisition_total_cost: 15000000,
        payment_status: 'Fully Paid',
        possession_is_turned_over: true, possession_turnover_date: '2022-02-01', possession_authorized_recipient: 'John Smith',
        insurance_amount_insured: 10000000, insurance_company: 'AXA Philippines', insurance_coverage_date: '2024-01-01',
        real_estate_tax_last_paid: '2024-01-10', real_estate_tax_amount: 45000,
        condo_dues_last_paid: '2024-07-05', condo_dues_amount: 8500
      },
      {
        property_name: 'BGC Corporate Office Suite',
        property_type: 'Commercial Building', // Mapped from Enum or string
        full_address: '25th Street, Bonifacio Global City, Taguig',
        location: 'Luzon',
        gps_coordinates: '14.5492, 121.0505',
        video_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
        unit_number: '2405', floor_number: '24th Floor', lot_no: 'Unit 2405, Ecoplaza', tct_or_cct_no: 'CCT-98765',
        area_sqm: 120, original_developer: 'Megaworld', brokers_name: 'BGC Realtors', brokers_contact: '0918-555-0000', buyers_name: 'Tech Solutions Inc.',
        photo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        acquisition_unit_lot_cost: 25000000, acquisition_total_cost: 28000000, acquisition_fit_out_cost: 3000000,
        payment_status: 'Fully Paid',
        possession_is_turned_over: true, possession_turnover_date: '2023-05-15', possession_authorized_recipient: 'CEO Tech Solutions',
        insurance_amount_insured: 30000000, insurance_company: 'Malayan Insurance',
        real_estate_tax_last_paid: '2024-01-15', real_estate_tax_amount: 65000,
        condo_dues_last_paid: '2024-07-01', condo_dues_amount: 12000,
        lease_lessee: 'StartUp Hub', lease_date: '2023-08-01', lease_rate: 150000, lease_term_years: 3
      }
    ];

    await supabase.from('properties').insert(demoProps);
    window.location.reload();
  },

  clearAllData: async () => {
    // Clears user's view for now, or deletes from DB?
    // Safety: maybe just reload
    window.location.reload();
  }
};