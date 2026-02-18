
import { User, Property, PropertyType, Location, PaymentStatus, RecentActivity, Documentation, Tenant, Lease, PaymentRecord, PropertyImage } from '../types';
import { supabase } from './supabaseClient';

// Mock user database
const MOCK_USERS: (User & { password_not_hashed: string })[] = [
  { id: 'user-1', email: 'demo@email.com', password_not_hashed: 'demo123', name: 'Demo Admin', role: 'admin' },
  { id: 'user-2', email: 'manager@email.com', password_not_hashed: 'manager123', name: 'Owner', role: 'manager' },
  { id: 'user-3', email: 'staff@email.com', password_not_hashed: 'staff123', name: 'Peter Staff', role: 'staff' },
];

// Helper to map DB row to Property object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapRowToProperty = (row: Record<string, any>): Property => {
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
  login: async (email: string, password_not_hashed: string): Promise<{ user: User | null, error: any }> => {
    // Authenticate with Supabase Auth
    const normalizedEmail = email.toLowerCase();

    // Try Supabase Auth first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password_not_hashed,
      });

      if (error) {
        // console.warn("Supabase login failed, checking mock...", error.message);
        // Don't return error yet; allow fallback to check MOCK_USERS
      } else if (data.user) {
        // Fetch user profile if exists
        // Fetch user profile if exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || 'User',
            role: (profile?.role as any) || 'staff'
          },
          error: null
        };
      }
    } catch (e) {
      console.warn("Supabase login failed or not configured, falling back to mock:", e);
    }

    // Fallback: Check mock users (for demo/local/offline)
    const mockUser = MOCK_USERS.find(u => u.email === normalizedEmail && u.password_not_hashed === password_not_hashed);
    if (mockUser) {
      const { password_not_hashed, ...u } = mockUser;
      return { user: u as User, error: null };
    }

    return { user: null, error: new Error('Invalid email or password') };
  },

  signUp: async (email: string, password: string): Promise<{ user: User | null, error: any }> => {
    const normalizedEmail = email.toLowerCase();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            role: 'staff', // Default role
            name: normalizedEmail.split('@')[0] // Default name
          }
        }
      });

      if (error) return { user: null, error };

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || normalizedEmail.split('@')[0],
            role: 'staff'
          },
          error: null
        };
      }
      return { user: null, error: new Error('Sign up failed') };
    } catch (e) {
      return { user: null, error: e };
    }
  },

  getAllProfiles: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Failed to fetch profiles:", error);
      return [];
    }

    return data.map((p: any) => ({
      id: p.id,
      email: p.email || 'No Email', // Profiles might not mirror email directly depending on setup, but assuming we store it or fetch from auth
      // Actually, profiles table might strictly have id, role, name. Email is in auth.users.
      // However, typical setup copies email to profile or joins. 
      // For now, let's assume profile has Name and Role. We might fail to get Email if not in profile.
      // Let's check the schema? I don't have the schema definition handy for profiles columns.
      // security_policies.sql doesn't show columns.
      // I'll assume standard Columns: id, updated_at, username, full_name, avatar_url, website... 
      // Wait, I should check what `profiles` has.
      name: p.full_name || p.name || 'Unknown',
      role: p.role || 'staff'
    }));
  },

  updateProfileRole: async (userId: string, newRole: 'admin' | 'manager' | 'staff'): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
  },

  fetchProperties: async (): Promise<Property[]> => {
    // Strategy: Fetch properties first, then fetch related data in parallel for ALL properties at once.
    // This avoids N+1 loops AND avoids potential JOIN issues if relationships aren't perfectly defined.

    // 1. Fetch Properties
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    const propertyIds = properties.map((p: any) => p.id);

    // 2. Fetch Related Data in Parallel
    // We wrap this in try/catch so one failure doesn't kill the whole app
    let allDocs: any[] = [];
    let allAppraisals: any[] = [];
    let allImages: any[] = [];

    try {
      const [docsResult, appraisalsResult, imagesResult] = await Promise.all([
        supabase.from('documents').select('*').in('property_id', propertyIds),
        supabase.from('appraisals').select('*').in('property_id', propertyIds),
        supabase.from('property_images').select('*').in('property_id', propertyIds)
      ]);

      if (docsResult.error) console.error("api.fetchProperties: Error fetching documents:", docsResult.error);
      if (appraisalsResult.error) console.error("api.fetchProperties: Error fetching appraisals:", appraisalsResult.error);
      if (imagesResult.error) console.error("api.fetchProperties: Error fetching images:", imagesResult.error);

      allDocs = docsResult.data || [];
      allAppraisals = appraisalsResult.data || [];
      allImages = imagesResult.data || [];

      console.log(`api.fetchProperties: Fetched ${allDocs.length} docs, ${allAppraisals.length} appraisals, ${allImages.length} images.`);

    } catch (err) {
      console.error("api.fetchProperties: CRITICAL ERROR fetching related data (partial load):", err);
      // We continue with empty arrays for related data so the user at least sees the properties
    }

    // 3. Map Data
    return properties.map((p: any) => {
      const prop = mapRowToProperty(p);

      // Attach Documents
      const myDocs = allDocs.filter((d: any) => d.property_id === p.id);
      prop.documentation.docs = myDocs.map((d: any) => ({
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

      // Attach Appraisals
      const myAppraisals = allAppraisals.filter((a: any) => a.property_id === p.id);
      prop.appraisals = myAppraisals.map((a: any) => ({
        appraisalDate: a.appraisal_date,
        appraisedValue: a.appraised_value,
        appraisalCompany: a.appraisal_company,
        reportUrl: a.report_url,
        reportFileName: a.report_file_name
      }));

      // Attach Images
      const myImages = allImages.filter((img: any) => img.property_id === p.id);
      prop.images = myImages.map((img: any) => ({
        id: img.id,
        propertyId: img.property_id,
        imageUrl: img.image_url,
        caption: img.caption,
        isPrimary: img.is_primary,
        createdAt: img.created_at
      }));

      return prop;
    });
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
    })).sort((a: any, _b: any) => (a.priority === 'High' ? -1 : 1));
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

  deleteProperty: async (propertyId: string): Promise<void> => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
  },

  addDocumentToProperty: async (propertyId: string, doc: Omit<Documentation, 'propertyId' | 'propertyName'>): Promise<Property> => {
    const { data: _data, error } = await supabase
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

    // Check if property exists
    if (!propData) throw new Error('Property not found after update');

    const prop = mapRowToProperty(propData);

    // Fetch and attach ALL documents for this property to ensure the UI has the complete list
    const { data: docs } = await supabase.from('documents').select('*').eq('property_id', propertyId);
    if (docs) {
      prop.documentation.docs = docs.map((d: any) => ({
        type: d.type,
        status: d.status,
        priority: d.priority,
        dueDate: d.due_date,
        executionDate: d.execution_date,
        documentUrl: d.document_url,
        fileName: d.file_name,
        propertyId: propertyId,
        propertyName: prop.propertyName
      }));
    }

    return prop;
  },

  // Seed Data Function (Replaces Reset)
  resetToDemoData: async () => {
    // WARNING: This deletes everything in the DB!
    // For production, this should be disabled or protected.
    // But for this "transition" phase, it's useful to populate the DB.

    try {
      // 1. Clear Tables (Order matters due to foreign keys)
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('leases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tenants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('appraisals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Insert Demo Properties
      const demoProps = [
        {
          property_name: 'Makati Prime Condominium Unit',
          property_type: 'Condominium',
          full_address: '123 Ayala Ave, Makati, Metro Manila',
          location: 'Luzon',
          gps_coordinates: '14.5547, 121.0244',
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
          property_type: 'Commercial',
          full_address: '25th Street, Bonifacio Global City, Taguig',
          location: 'Luzon',
          gps_coordinates: '14.5492, 121.0505',
          unit_number: '2405', floor_number: '24th Floor', lot_no: 'Unit 2405, Ecoplaza', tct_or_cct_no: 'CCT-98765',
          area_sqm: 120, original_developer: 'Megaworld', brokers_name: 'BGC Realtors', brokers_contact: '0918-555-0000', buyers_name: 'Tech Solutions Inc.',
          photo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          acquisition_unit_lot_cost: 25000000, acquisition_total_cost: 28000000, acquisition_fit_out_cost: 3000000,
          payment_status: 'Fully Paid',
          possession_is_turned_over: true, possession_turnover_date: '2023-05-15', possession_authorized_recipient: 'CEO Tech Solutions',
          insurance_amount_insured: 30000000, insurance_company: 'Malayan Insurance',
          real_estate_tax_last_paid: '2024-01-15', real_estate_tax_amount: 65000,
          condo_dues_last_paid: '2024-07-01', condo_dues_amount: 12000
        }
      ];

      const { data: insertedProps, error: propError } = await supabase.from('properties').insert(demoProps).select();
      if (propError) throw propError;

      // 3. Insert Demo Tenants
      const demoTenants = [
        { name: 'StartUp Hub Inc.', email: 'contact@startuphub.com', phone: '0917-000-1111', status: 'Active', occupation: 'Tech Company' },
        { name: 'Dr. Emily Rose', email: 'emily.rose@hospital.com', phone: '0918-222-3333', status: 'Active', occupation: 'Physician' }
      ];

      const { data: insertedTenants, error: tenantError } = await supabase.from('tenants').insert(demoTenants).select();
      if (tenantError) throw tenantError;

      // 4. Create Leases (Linking Property 1 to Tenant 2, Property 2 to Tenant 1)
      if (insertedProps && insertedTenants) {
        // Lease 1: BGC Office (Prop[1]) leased to StartUp Hub (Tenant[0])
        const lease1 = {
          property_id: insertedProps[1].id,
          tenant_id: insertedTenants[0].id,
          start_date: '2023-08-01',
          end_date: '2026-08-01',
          monthly_rent: 150000,
          security_deposit: 450000,
          status: 'Active',
          terms: '3 Years Fixed',
          contract_url: '#'
        };

        // Lease 2: Makati Condo (Prop[0]) leased to Dr. Emily (Tenant[1])
        const lease2 = {
          property_id: insertedProps[0].id,
          tenant_id: insertedTenants[1].id,
          start_date: '2024-01-01',
          end_date: '2025-01-01',
          monthly_rent: 85000,
          security_deposit: 170000,
          status: 'Active',
          terms: '1 Year Renewable',
          contract_url: '#'
        };

        const { data: insertedLeases, error: leaseError } = await supabase.from('leases').insert([lease1, lease2]).select();
        if (leaseError) throw leaseError;

        // 5. Create Payment History (Mock some payments)
        if (insertedLeases) {
          const payments = [
            // Payments for Lease 1 (BGC)
            { lease_id: insertedLeases[0].id, payment_date: '2024-01-01', amount: 150000, payment_type: 'Rent', status: 'Completed', payment_method: 'Check' },
            { lease_id: insertedLeases[0].id, payment_date: '2024-02-01', amount: 150000, payment_type: 'Rent', status: 'Completed', payment_method: 'Check' },
            { lease_id: insertedLeases[0].id, payment_date: '2024-03-01', amount: 150000, payment_type: 'Rent', status: 'Pending', payment_method: 'Check', remarks: 'Check for deposit' }, // Pending for dashboard

            // Payments for Lease 2 (Makati)
            { lease_id: insertedLeases[1].id, payment_date: '2024-01-05', amount: 85000, payment_type: 'Rent', status: 'Completed', payment_method: 'Bank Transfer' },
            { lease_id: insertedLeases[1].id, payment_date: '2024-02-05', amount: 85000, payment_type: 'Rent', status: 'Completed', payment_method: 'Bank Transfer' }
          ];
          await supabase.from('payments').insert(payments);
        }

        // 6. Create Demo Appraisals
        const appraisals = [
          // Appraisals for Makati Condo (Prop[0]) - Acquired for 15M
          { property_id: insertedProps[0].id, appraisal_date: '2023-01-15', appraised_value: 15500000, appraisal_company: 'Cuervo Appraisers', report_url: '#' },
          { property_id: insertedProps[0].id, appraisal_date: '2024-01-20', appraised_value: 16200000, appraisal_company: 'Santos Knight Frank', report_url: '#', report_file_name: 'valuation_2024.pdf' },

          // Appraisals for BGC Office (Prop[1]) - Acquired for 28M
          { property_id: insertedProps[1].id, appraisal_date: '2023-06-10', appraised_value: 29500000, appraisal_company: 'Colliers International', report_url: '#' },
          { property_id: insertedProps[1].id, appraisal_date: '2024-06-10', appraised_value: 31000000, appraisal_company: 'JLL Philippines', report_url: '#', report_file_name: 'bgc_val_report.pdf' }
        ];
        await supabase.from('appraisals').insert(appraisals);
      }

      window.location.reload();
    } catch (error: any) {
      console.error("Reset Failed:", error);
      alert(`Failed to reset data. Error: ${error.message || JSON.stringify(error)}`);
    }
  },

  // --- Tenant & Lease Management ---

  fetchTenants: async (): Promise<Tenant[]> => {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase fetch tenants failed, returning empty/mock", error);
      return [];
    }
    return data as Tenant[];
  },

  addTenant: async (tenant: Omit<Tenant, 'id'>): Promise<Tenant> => {
    const { data, error } = await supabase
      .from('tenants')
      .insert([tenant])
      .select()
      .single();

    if (error) throw error;
    return data as Tenant;
  },

  fetchLeases: async (): Promise<Lease[]> => {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        properties (property_name),
        tenants (name)
      `)
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map((l: any) => ({
      id: l.id,
      propertyId: l.property_id,
      tenantId: l.tenant_id,
      startDate: l.start_date,
      endDate: l.end_date,
      monthlyRent: l.monthly_rent,
      securityDeposit: l.security_deposit,
      status: l.status,
      terms: l.terms,
      contractUrl: l.contract_url,
      propertyName: l.properties?.property_name,
      tenantName: l.tenants?.name
    }));
  },

  addLease: async (lease: Omit<Lease, 'id'>): Promise<Lease> => {
    // Ensure numeric values are numbers
    // Payload used to be here but was unused.

    // We need to map back to snake_case for Supabase if we didn't use the JS client's auto-mapping (which we might not have set up)
    // Actually, standard supabase client matches JSON keys if table columns match. 
    // But my table columns are snake_case (`monthly_rent`) and my types are camelCase (`monthlyRent`).
    // I need to map them manually unless I have a global converter. 
    // Based on `mapPropertyToRow`, I am doing manual mapping.

    const dbLease = {
      property_id: lease.propertyId,
      tenant_id: lease.tenantId,
      start_date: lease.startDate,
      end_date: lease.endDate,
      monthly_rent: lease.monthlyRent,
      security_deposit: lease.securityDeposit,
      status: lease.status,
      terms: lease.terms,
      contract_url: lease.contractUrl
    };

    const { data, error } = await supabase
      .from('leases')
      .insert([dbLease])
      .select()
      .single();

    if (error) throw error;

    // Map back to camelCase for frontend
    return {
      id: data.id,
      propertyId: data.property_id,
      tenantId: data.tenant_id,
      startDate: data.start_date,
      endDate: data.end_date,
      monthlyRent: data.monthly_rent,
      securityDeposit: data.security_deposit,
      status: data.status,
      terms: data.terms,
      contractUrl: data.contract_url
    };
  },

  fetchPayments: async (): Promise<PaymentRecord[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error) return [];

    return data.map((p: any) => ({
      id: p.id,
      leaseId: p.lease_id,
      paymentDate: p.payment_date,
      amount: p.amount,
      paymentType: p.payment_type,
      paymentMethod: p.payment_method,
      referenceNo: p.reference_no,
      status: p.status,
      remarks: p.remarks
    }));
  },

  addPayment: async (payment: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> => {
    const dbPayment = {
      lease_id: payment.leaseId,
      payment_date: payment.paymentDate,
      amount: payment.amount,
      payment_type: payment.paymentType,
      payment_method: payment.paymentMethod,
      reference_no: payment.referenceNo,
      status: payment.status,
      remarks: payment.remarks
    };

    const { data, error } = await supabase
      .from('payments')
      .insert([dbPayment])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      leaseId: data.lease_id,
      paymentDate: data.payment_date,
      amount: data.amount,
      paymentType: data.payment_type,
      paymentMethod: data.payment_method,
      referenceNo: data.reference_no,
      status: data.status,
      remarks: data.remarks
    };
  },

  clearAllData: async () => {
    // Clears user's view for now, or deletes from DB?
    // Safety: maybe just reload
    window.location.reload();
  },

  deleteTenant: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
  },

  deleteLease: async (id: string): Promise<void> => {
    const { error } = await supabase.from('leases').delete().eq('id', id);
    if (error) throw error;
  },

  deletePayment: async (id: string): Promise<void> => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  }
};