// Backend/config/db.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { ENV } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_STORE_PATH = path.resolve(__dirname, '../Database/data_store.json');

// ═══════════════════════════════════════════════════════════════
// Seed data (unchanged)
// ═══════════════════════════════════════════════════════════════
function getInitialSeedData() {
  return {
    roles: [
      { id: 'role-citizen', name: 'CITIZEN', description: 'Registered citizen' },
      { id: 'role-councillor', name: 'WARD_COUNCILLOR', description: 'Authorized ward representative' },
      { id: 'role-department', name: 'DEPARTMENT_HANDLER', description: 'Authorized department officer' },
      { id: 'role-reviewer', name: 'ACCOUNTABILITY_REVIEWER', description: 'Independent accountability reviewer' },
      { id: 'role-admin', name: 'ADMIN', description: 'System administrator' },
    ],
    districts: [
      { id: 'dist-thoothukudi', name: 'Thoothukudi', state: 'Tamil Nadu', code: 'TN-TK', headquarters: 'Thoothukudi' },
      { id: 'dist-tirunelveli', name: 'Tirunelveli', state: 'Tamil Nadu', code: 'TN-TV', headquarters: 'Tirunelveli' },
      { id: 'dist-tenkasi', name: 'Tenkasi', state: 'Tamil Nadu', code: 'TN-TS', headquarters: 'Tenkasi' },
      { id: 'dist-chennai', name: 'Chennai', state: 'Tamil Nadu', code: 'TN-CH', headquarters: 'Chennai' },
      { id: 'dist-madurai', name: 'Madurai', state: 'Tamil Nadu', code: 'TN-MD', headquarters: 'Madurai' },
    ],
    local_bodies: [
      { id: 'lb-thoothukudi-corp', district_id: 'dist-thoothukudi', name: 'Thoothukudi City Municipal Corporation', body_type: 'CORPORATION', code: 'TCMC', contact_email: 'commissioner@thoothukudicorporation.tn.gov.in', contact_phone: '0461-2326901' },
      { id: 'lb-tirunelveli-corp', district_id: 'dist-tirunelveli', name: 'Tirunelveli City Municipal Corporation', body_type: 'CORPORATION', code: 'VCMC', contact_email: 'commissioner@tirunelvelicorporation.tn.gov.in', contact_phone: '0462-2329325' },
      { id: 'lb-tenkasi-muni', district_id: 'dist-tenkasi', name: 'Tenkasi Municipality', body_type: 'MUNICIPALITY', code: 'TKM', contact_email: 'commr.tenkasi@tn.gov.in', contact_phone: '04633-222238' },
    ],
    wards: [
      { id: 'ward-43-thoothukudi', local_body_id: 'lb-thoothukudi-corp', ward_number: 43, ward_name: 'Millerpuram - Bryant Nagar (Ward 43)', councillor_user_id: 'user-councillor-senthil', councillor_name: 'Councillor M. Senthil Nathan', population_approx: 12400, area_sq_km: 3.2 },
      { id: 'ward-45-thoothukudi', local_body_id: 'lb-thoothukudi-corp', ward_number: 45, ward_name: 'Cruz Fernandez Avenue - Cruzpuram (Ward 45)', councillor_user_id: 'user-councillor-meenakshi', councillor_name: 'Councillor R. Meenakshi', population_approx: 14800, area_sq_km: 2.8 },
      { id: 'ward-12-tirunelveli', local_body_id: 'lb-tirunelveli-corp', ward_number: 12, ward_name: 'Palayamkottai Central (Ward 12)', councillor_user_id: 'user-councillor-subramanian', councillor_name: 'Councillor K. Subramanian', population_approx: 18200, area_sq_km: 4.1 },
      { id: 'ward-08-tenkasi', local_body_id: 'lb-tenkasi-muni', ward_number: 8, ward_name: 'Old Bus Stand - Kasi Viswanathar Temple Ward (Ward 8)', councillor_user_id: 'user-councillor-kanagaraj', councillor_name: 'Councillor S. Kanagaraj', population_approx: 9600, area_sq_km: 2.1 },
    ],
    departments: [
      {
        id: 'dept-swm',
        name: 'Solid Waste Management & Sanitation Department',
        name_ta: 'தூய்மைப் பணி மற்றும் திடக்கழிவு மேலாண்மைத் துறை',
        code: 'SWM',
        category_ids: ['cat-garbage'],
        description: 'Responsible for municipal solid waste collection, roadside clearance, garbage bin sanitization, and processing facilities.',
        description_ta: 'நகராட்சி திடக்கழிவு மேலாண்மை, தெருக்கள் தூய்மைப் பணி, குப்பைத் தொட்டிகள் மற்றும் கழிவு அகற்றுதல் ஆகியவற்றுக்கு பொறுப்பான துறை.',
        head_officer: 'Thiru S. Balakrishnan (Chief Municipal Health Officer)',
        contact_email: 'swm.grievance@tn.gov.in',
        contact_phone: '0461-2326901 / 1800-425-4244',
        emergency_helpline: '1800-425-4244',
        icon_name: 'Trash2',
        sla_standard_days: 3,
      },
      {
        id: 'dept-roads',
        name: 'Highways & Municipal Roads Department',
        name_ta: 'நெடுஞ்சாலைகள் மற்றும் சாலைப் பராமரிப்புத் துறை',
        code: 'HWAY',
        category_ids: ['cat-roads'],
        description: 'Responsible for arterial road paving, pothole repairs, bitumen overlay, paver block relaying, and storm drainage culvert integrity.',
        description_ta: 'தார்ப்பாய் சாலைகள், பள்ளங்கள் சீரமைத்தல், பேவர் பிளாக் அமைத்தல் மற்றும் சாலைப் பராமரிப்புப் பணிகள்.',
        head_officer: 'Er. P. Ramachandran (Superintending Engineer, Highways)',
        contact_email: 'highways.grievance@tn.gov.in',
        contact_phone: '0461-2345678',
        emergency_helpline: '1800-425-7744',
        icon_name: 'Construction',
        sla_standard_days: 10,
      },
      {
        id: 'dept-tangedco',
        name: 'TANGEDCO / Municipal Street Lighting Wing',
        name_ta: 'மின்சார வாரியம் மற்றும் தெருவிளக்குகள் பிரிவு',
        code: 'TNEB',
        category_ids: ['cat-streetlights', 'cat-electricity'],
        description: 'Responsible for public streetlights, LED fixtures, timer circuits, sagging high-tension electrical cables, distribution poles, and transformer safety.',
        description_ta: 'தெருவிளக்குகள் பழுதுபார்ப்பு, புதிய எல்.இ.டி விளக்குகள், மின் கம்பங்கள் மற்றும் மின்சார பாதுகாப்பு.',
        head_officer: 'Er. M. Vasanth (Executive Engineer, Distribution)',
        contact_email: 'minnagam.cgrs@tnebnet.org',
        contact_phone: '94987 94987 (24x7 Minnagam)',
        emergency_helpline: '94987 94987',
        icon_name: 'Zap',
        sla_standard_days: 2,
      },
      {
        id: 'dept-drainage',
        name: 'Stormwater Drainage & Flood Mitigation Wing',
        name_ta: 'மழைநீர் வடிகால் மற்றும் வெள்ளத் தடுப்புப் பிரிவு',
        code: 'SWMD',
        category_ids: ['cat-drainage'],
        description: 'Responsible for construction, desilting, repair, and flood channel clearance of all roadside concrete and underground stormwater drains.',
        description_ta: 'மழைநீர் வடிகால்கள் தூர்வாருதல், சீரமைத்தல் மற்றும் வெள்ள நீர் தேங்குவதைத் தடுத்தல்.',
        head_officer: 'Er. K. Sivaraman (Executive Engineer, Storm Drains)',
        contact_email: 'stormdrain.tn@gov.in',
        contact_phone: '0461-2328811',
        emergency_helpline: '1077 (Disaster Control)',
        icon_name: 'Droplets',
        sla_standard_days: 5,
      },
      {
        id: 'dept-sewerage',
        name: 'Underground Sewerage & Sanitation Board (TWAD/CMWSSB)',
        name_ta: 'பாதாள சாக்கடை மற்றும் கழிவுநீர் மேலாண்மை வாரியம்',
        code: 'TWAD-SEW',
        category_ids: ['cat-sewage'],
        description: 'Responsible for underground sewer networks, heavy-duty manhole covers, sewer pumping stations, and clearing hazardous blockages.',
        description_ta: 'பாதாள சாக்கடை அடைப்புகள், கழிவுநீர் வெளியேற்றம் மற்றும் மேன்ஹோல் மூடிகள் பாதுகாப்பு.',
        head_officer: 'Er. R. Arumugam (Divisional Engineer, Sewerage)',
        contact_email: 'sewerage.care@tn.gov.in',
        contact_phone: '1916 / 0462-2329325',
        emergency_helpline: '1916',
        icon_name: 'Biohazard',
        sla_standard_days: 3,
      },
      {
        id: 'dept-water',
        name: 'Municipal Drinking Water Supply Department',
        name_ta: 'நகராட்சி குடிநீர் வழங்கல் மற்றும் விநியோகத் துறை',
        code: 'WTR',
        category_ids: ['cat-water'],
        description: 'Responsible for treated drinking water transmission mains, distribution feeder pipes, street public taps, pressure balancing, and water quality testing.',
        description_ta: 'குடிநீர் விநியோகம், குழாய் உடைப்பு சீரமைப்பு, நீர் அழுத்தம் மற்றும் குடிநீர் தூய்மை உறுதி செய்தல்.',
        head_officer: 'Er. K. Murugan (Asst. Executive Engineer, Water Works)',
        contact_email: 'waterworks.thoothukudi@tn.gov.in',
        contact_phone: '0461-2326905',
        emergency_helpline: '1916',
        icon_name: 'GlassWater',
        sla_standard_days: 4,
      },
      {
        id: 'dept-infrastructure',
        name: 'Public Infrastructure, Parks & Buildings Department',
        name_ta: 'பொதுக் கட்டமைப்பு, பூங்காக்கள் மற்றும் கட்டடங்கள் துறை',
        code: 'INFRA',
        category_ids: ['cat-infrastructure'],
        description: 'Responsible for municipal bus shelters, public parks, children play equipment, community halls, public amenities, and street structures.',
        description_ta: 'பேருந்து நிழற்குடைகள், பூங்காக்கள், பொதுக் கழிப்பறைகள் மற்றும் நகராட்சி சொத்துக்கள் பராமரிப்பு.',
        head_officer: 'Thiru N. Sundararajan (Town Planning Officer)',
        contact_email: 'townplanning@tn.gov.in',
        contact_phone: '0461-2327744',
        emergency_helpline: '0461-2327700',
        icon_name: 'Building2',
        sla_standard_days: 14,
      },
      {
        id: 'dept-traffic',
        name: 'Traffic, Road Safety & Enforcement Cell',
        name_ta: 'போக்குவரத்து மற்றும் சாலை பாதுகாப்புப் பிரிவு',
        code: 'TRAF',
        category_ids: ['cat-traffic'],
        description: 'Responsible for clearing unauthorized construction encroachments, road debris, directional signages, speed calming measures, and safety barricades.',
        description_ta: 'சாலை ஆக்கிரமிப்புகள் அகற்றுதல், வேகத்தடைகள், போக்குவரத்து பலகைகள் மற்றும் சாலை பாதுகாப்பு.',
        head_officer: 'Inspector S. Thangadurai (Traffic & Enforcement)',
        contact_email: 'traffic.cell@tn.gov.in',
        contact_phone: '0461-2320100',
        emergency_helpline: '103 (Traffic Helpline)',
        icon_name: 'ShieldAlert',
        sla_standard_days: 3,
      },
      {
        id: 'dept-health',
        name: 'Public Health & Vector Control Department',
        name_ta: 'பொது சுகாதாரம் மற்றும் கொசு ஒழிப்புத் துறை',
        code: 'HLTH',
        category_ids: [],
        description: 'Responsible for thermal fogging, vector-borne disease prevention, anti-larval spray operations, stray animal control, and public health sanitation.',
        description_ta: 'கொசு ஒழிப்புப் புகை மருந்து அடித்தல், டெங்கு தடுப்பு நடவடிக்கைகள் மற்றும் பொது சுகாதாரம்.',
        head_officer: 'Dr. M. Sangeetha (District Health Officer)',
        contact_email: 'health.dho@tn.gov.in',
        contact_phone: '0461-2321122',
        emergency_helpline: '104 (Health Helpline)',
        icon_name: 'Activity',
        sla_standard_days: 3,
      },
      {
        id: 'dept-revenue',
        name: 'Revenue, Grievance & General Civic Administration',
        name_ta: 'வருவாய் மற்றும் பொது மக்கள் குறைதீர்ப்புப் பிரிவு',
        code: 'REV',
        category_ids: ['cat-other'],
        description: 'Responsible for general civic petitions, property tax disputes, trade licenses, public nuisance complaints, and inter-departmental grievance redressal.',
        description_ta: 'பொது மக்கள் மனுக்கள், நகராட்சி குறைதீர்ப்பு மற்றும் பொது நிர்வாகப் பணிகள்.',
        head_officer: 'Thiru C. Natarajan (Revenue Officer)',
        contact_email: 'revenue.cgrs@tn.gov.in',
        contact_phone: '0461-2326909',
        emergency_helpline: '1100 (CM Helpline)',
        icon_name: 'HelpCircle',
        sla_standard_days: 7,
      },
    ],
    categories: [
      { id: 'cat-garbage', name: 'Garbage & Waste Collection', slug: 'garbage-waste', description: 'Solid waste dumping, uncollected trash bins', icon_name: 'Trash2', default_priority: 'MEDIUM', estimated_sla_days: 3, is_active: true },
      { id: 'cat-roads', name: 'Damaged Roads & Potholes', slug: 'damaged-roads', description: 'Potholes, broken tar, missing paver blocks', icon_name: 'Construction', default_priority: 'HIGH', estimated_sla_days: 10, is_active: true },
      { id: 'cat-streetlights', name: 'Streetlight Failures', slug: 'streetlights', description: 'Non-functional streetlights, broken fixtures', icon_name: 'Lightbulb', default_priority: 'MEDIUM', estimated_sla_days: 4, is_active: true },
      { id: 'cat-drainage', name: 'Drainage Leakage & Blockage', slug: 'drainage-leakage', description: 'Clogged storm water drains, overflow on roads', icon_name: 'Droplets', default_priority: 'HIGH', estimated_sla_days: 5, is_active: true },
      { id: 'cat-sewage', name: 'Sewage & Sanitation', slug: 'sewage-sanitation', description: 'Underground sewer overflow, open manholes', icon_name: 'Biohazard', default_priority: 'CRITICAL', estimated_sla_days: 3, is_active: true },
      { id: 'cat-water', name: 'Water Supply Issues', slug: 'water-supply', description: 'Pipe ruptures, low pressure, contaminated water', icon_name: 'GlassWater', default_priority: 'HIGH', estimated_sla_days: 4, is_active: true },
      { id: 'cat-infrastructure', name: 'Public Infrastructure', slug: 'public-infrastructure', description: 'Damaged bus shelters, broken park benches', icon_name: 'Building2', default_priority: 'MEDIUM', estimated_sla_days: 14, is_active: true },
      { id: 'cat-electricity', name: 'Electricity-Related Civic Issues', slug: 'electricity-civic', description: 'Hanging wires, sparking transformers', icon_name: 'Zap', default_priority: 'CRITICAL', estimated_sla_days: 2, is_active: true },
      { id: 'cat-traffic', name: 'Traffic & Road Obstruction', slug: 'traffic-obstruction', description: 'Construction debris, road blockages', icon_name: 'ShieldAlert', default_priority: 'MEDIUM', estimated_sla_days: 3, is_active: true },
      { id: 'cat-other', name: 'Other Civic Problems', slug: 'other-civic', description: 'General civic issues', icon_name: 'HelpCircle', default_priority: 'LOW', estimated_sla_days: 7, is_active: true },
    ],
    users: [
      { id: 'user-citizen-anand', google_id: 'demo-google-anand-01', email: 'anand.kumar@civicmail.in', full_name: 'Anand Kumar', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', phone: '9842100001', ward_id: 'ward-43-thoothukudi', role: 'CITIZEN', approval_status: 'APPROVED', is_active: true, created_at: '2026-09-01T08:00:00Z' },
      { id: 'user-citizen-priya', google_id: 'demo-google-priya-02', email: 'priya.natarajan@civicmail.in', full_name: 'Priya Natarajan', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', phone: '9842100002', ward_id: 'ward-45-thoothukudi', role: 'CITIZEN', approval_status: 'APPROVED', is_active: true, created_at: '2026-09-02T08:00:00Z' },
      { id: 'user-citizen-karthik', google_id: 'demo-google-karthik-03', email: 'karthik.selvam@civicmail.in', full_name: 'Karthik Selvam', avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', phone: '9842100003', ward_id: 'ward-43-thoothukudi', role: 'CITIZEN', approval_status: 'APPROVED', is_active: true, created_at: '2026-09-03T08:00:00Z' },
      { id: 'user-councillor-senthil', google_id: 'demo-google-senthil-04', email: 'councillor.ward43@thoothukudi.gov.in', full_name: 'Councillor M. Senthil Nathan', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', phone: '9443300043', ward_id: 'ward-43-thoothukudi', role: 'WARD_COUNCILLOR', approval_status: 'APPROVED', is_active: true, created_at: '2026-08-01T08:00:00Z' },
      { id: 'user-councillor-meenakshi', google_id: 'demo-google-meenakshi-05', email: 'councillor.ward45@thoothukudi.gov.in', full_name: 'Councillor R. Meenakshi', avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', phone: '9443300045', ward_id: 'ward-45-thoothukudi', role: 'WARD_COUNCILLOR', approval_status: 'APPROVED', is_active: true, created_at: '2026-08-01T08:00:00Z' },
      { id: 'user-councillor-subramanian', google_id: 'demo-google-subramanian-06', email: 'councillor.ward12@tirunelveli.gov.in', full_name: 'Councillor K. Subramanian', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', phone: '9443300012', ward_id: 'ward-12-tirunelveli', role: 'WARD_COUNCILLOR', approval_status: 'APPROVED', is_active: true, created_at: '2026-08-01T08:00:00Z' },
      { id: 'user-department-murugan', google_id: 'demo-google-murugan-07', email: 'eng.murugan@thoothukudicorporation.tn.gov.in', full_name: 'Er. K. Murugan (Asst. Exec. Engineer)', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', phone: '9443100101', ward_id: 'ward-43-thoothukudi', role: 'DEPARTMENT_HANDLER', department_id: 'dept-swm', approval_status: 'APPROVED', is_active: true, created_at: '2026-08-15T08:00:00Z' },
      { id: 'user-reviewer-kalyani', google_id: 'demo-google-kalyani-08', email: 'reviewer.kalyani@accountability.tn.gov.in', full_name: 'Smt. V. Kalyani (Retd. District Officer)', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', phone: '9442200202', ward_id: 'ward-43-thoothukudi', role: 'ACCOUNTABILITY_REVIEWER', approval_status: 'APPROVED', is_active: true, created_at: '2026-08-01T08:00:00Z' },
      { id: 'user-admin-ramanathan', google_id: 'demo-google-admin-09', email: 'admin.ramanathan@civicgrievance.tn.gov.in', full_name: 'K. Ramanathan (System Administrator)', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', phone: '9444400099', ward_id: 'ward-43-thoothukudi', role: 'ADMIN', approval_status: 'APPROVED', is_active: true, created_at: '2026-07-01T08:00:00Z' },
    ],
    user_details: [
      { user_id: 'user-citizen-anand', address_line: '42/A, Millerpuram 2nd Street', pincode: '628008', is_ward_verified: true, designation: 'Resident Citizen', department_name: null },
      { user_id: 'user-citizen-priya', address_line: '18, Cruzpuram Beach Road', pincode: '628001', is_ward_verified: true, designation: 'Resident Citizen', department_name: null },
      { user_id: 'user-citizen-karthik', address_line: '115, Bryant Nagar 5th Street', pincode: '628008', is_ward_verified: true, designation: 'Resident Citizen', department_name: null },
      { user_id: 'user-councillor-senthil', address_line: 'Ward 43 Office, Millerpuram Main Rd', pincode: '628008', is_ward_verified: true, designation: 'Elected Ward Councillor', department_name: 'Thoothukudi Corporation Council' },
      { user_id: 'user-councillor-meenakshi', address_line: 'Ward 45 Office, Cruzpuram', pincode: '628001', is_ward_verified: true, designation: 'Elected Ward Councillor', department_name: 'Thoothukudi Corporation Council' },
      { user_id: 'user-councillor-subramanian', address_line: 'Ward 12 Office, Palayamkottai', pincode: '627002', is_ward_verified: true, designation: 'Elected Ward Councillor', department_name: 'Tirunelveli Corporation Council' },
      { user_id: 'user-department-murugan', address_line: 'Central Zone Engineering Wing', pincode: '628002', is_ward_verified: true, designation: 'Assistant Executive Engineer', department_name: 'Public Works & Roads Wing' },
      { user_id: 'user-reviewer-kalyani', address_line: 'District Vigilance Chamber', pincode: '628001', is_ward_verified: true, designation: 'Independent Reviewer', department_name: 'Civil Services Oversight Board' },
      { user_id: 'user-admin-ramanathan', address_line: 'State Civic Tech Operations Cell', pincode: '600009', is_ward_verified: true, designation: 'Principal Administrator', department_name: 'Information Technology Dept' },
    ],
    ward_members: [
      { id: 'wm-01', ward_id: 'ward-43-thoothukudi', user_id: 'user-citizen-anand', is_verified: true, joined_at: '2026-09-01T08:00:00Z' },
      { id: 'wm-02', ward_id: 'ward-43-thoothukudi', user_id: 'user-citizen-karthik', is_verified: true, joined_at: '2026-09-03T08:00:00Z' },
      { id: 'wm-03', ward_id: 'ward-43-thoothukudi', user_id: 'user-councillor-senthil', is_verified: true, joined_at: '2026-08-01T08:00:00Z' },
      { id: 'wm-04', ward_id: 'ward-45-thoothukudi', user_id: 'user-citizen-priya', is_verified: true, joined_at: '2026-09-02T08:00:00Z' },
      { id: 'wm-05', ward_id: 'ward-45-thoothukudi', user_id: 'user-councillor-meenakshi', is_verified: true, joined_at: '2026-08-01T08:00:00Z' },
      { id: 'wm-06', ward_id: 'ward-12-tirunelveli', user_id: 'user-councillor-subramanian', is_verified: true, joined_at: '2026-08-01T08:00:00Z' },
    ],
    complaints: [
      {
        id: 'comp-001',
        reference_id: 'CIV-2026-00043',
        title: 'Severe garbage dumping and waste overflow opposite Millerpuram School',
        description: 'Commercial vegetable crates and decomposing municipal solid waste have been dumped openly along the school perimeter road for over 5 days. Cattle and stray animals are scattering garbage onto the carriageway, blocking pedestrian movement.',
        category_id: 'cat-garbage',
        user_id: 'user-citizen-anand',
        ward_id: 'ward-43-thoothukudi',
        district_id: 'dist-thoothukudi',
        local_body_id: 'lb-thoothukudi-corp',
        latitude: 8.8042100,
        longitude: 78.1348000,
        address_text: 'Millerpuram Main Road, Ward 43, Thoothukudi',
        landmark: 'Opposite St. Thomas Higher Secondary School Gate',
        status: 'In Progress',
        deadline_condition: 'ON_TRACK',
        verification_state: 'PENDING_PROPOSAL',
        priority: 'HIGH',
        supports_count: 14,
        comments_count: 3,
        is_public: true,
        created_at: '2026-10-06T09:30:00Z',
        updated_at: '2026-10-08T11:00:00Z',
      },
      {
        id: 'comp-002',
        reference_id: 'CIV-2026-00044',
        title: 'Underground drinking water main line burst at Bryant Nagar 3rd Street',
        description: 'Treated municipal drinking water is spewing continuously from a burst underground pipeline joint, flooding the street and causing acute drinking water pressure drops in neighbouring residential blocks.',
        category_id: 'cat-water',
        user_id: 'user-citizen-anand',
        ward_id: 'ward-43-thoothukudi',
        district_id: 'dist-thoothukudi',
        local_body_id: 'lb-thoothukudi-corp',
        latitude: 8.7981200,
        longitude: 78.1399400,
        address_text: 'Bryant Nagar 3rd Street West, Ward 43, Thoothukudi',
        landmark: 'Near CSI Church intersection',
        status: 'Resolution Proposed',
        deadline_condition: 'ON_TRACK',
        verification_state: 'AWAITING_CITIZEN_CONFIRMATION',
        priority: 'HIGH',
        supports_count: 22,
        comments_count: 5,
        is_public: true,
        created_at: '2026-10-07T08:15:00Z',
        updated_at: '2026-10-10T10:00:00Z',
      },
      {
        id: 'comp-003',
        reference_id: 'CIV-2026-00045',
        title: 'Hazardous open manhole without warning barricade near Palayamkottai Bus Terminal',
        description: 'Heavy commercial bus vibrations broke the concrete slab of a stormwater catch basin. The deep opening poses an immediate fatal hazard to two-wheelers and pedestrians, especially after sunset.',
        category_id: 'cat-sewage',
        user_id: 'user-citizen-karthik',
        ward_id: 'ward-12-tirunelveli',
        district_id: 'dist-tirunelveli',
        local_body_id: 'lb-tirunelveli-corp',
        latitude: 8.7184000,
        longitude: 77.7492000,
        address_text: 'Tiruchendur Road, Palayamkottai, Ward 12, Tirunelveli',
        landmark: '50m from Palayamkottai Main Bus Stand Entry',
        status: 'Under Review',
        deadline_condition: 'OVERDUE',
        verification_state: 'PENDING_PROPOSAL',
        priority: 'CRITICAL',
        supports_count: 38,
        comments_count: 7,
        is_public: true,
        created_at: '2026-09-28T14:20:00Z',
        updated_at: '2026-10-09T16:00:00Z',
      },
      {
        id: 'comp-004',
        reference_id: 'CIV-2026-00046',
        title: 'Deep craters and broken bitumen on Tenkasi Temple Street causing vehicle damage',
        description: 'Monsoon runoff created deep 2-foot trenches in the main road connecting Old Bus Stand to Kasi Viswanathar Temple. Several school buses and autos are getting stuck daily.',
        category_id: 'cat-roads',
        user_id: 'user-citizen-anand',
        ward_id: 'ward-08-tenkasi',
        district_id: 'dist-tenkasi',
        local_body_id: 'lb-tenkasi-muni',
        latitude: 8.9592000,
        longitude: 77.3146000,
        address_text: 'Temple Car Street, Ward 8, Tenkasi',
        landmark: 'Near Kasi Viswanathar Temple North Arch',
        status: 'Submitted',
        deadline_condition: 'APPROACHING',
        verification_state: 'PENDING_PROPOSAL',
        priority: 'MEDIUM',
        supports_count: 9,
        comments_count: 2,
        is_public: true,
        created_at: '2026-10-09T11:45:00Z',
        updated_at: '2026-10-09T11:45:00Z',
      },
      {
        id: 'comp-005',
        reference_id: 'CIV-2026-00047',
        title: 'Broken LED streetlight pole leaning precariously after localized storm',
        description: 'Streetlight pole fixture #ST-45-12 was struck by a falling palm branch. It is dark at night, creating safety issues for fishermen returning home late.',
        category_id: 'cat-streetlights',
        user_id: 'user-citizen-priya',
        ward_id: 'ward-45-thoothukudi',
        district_id: 'dist-thoothukudi',
        local_body_id: 'lb-thoothukudi-corp',
        latitude: 8.8122000,
        longitude: 78.1561000,
        address_text: 'Cruz Fernandez Avenue, Ward 45, Thoothukudi',
        landmark: 'Opposite Cruzpuram Community Hall',
        status: 'Resolved',
        deadline_condition: 'ON_TRACK',
        verification_state: 'CONFIRMED_RESOLVED',
        priority: 'MEDIUM',
        supports_count: 18,
        comments_count: 4,
        is_public: true,
        created_at: '2026-10-04T19:00:00Z',
        updated_at: '2026-10-09T20:30:00Z',
      },
    ],
    complaint_images: [
      { id: 'img-001', complaint_id: 'comp-001', image_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800', caption: 'Debris and garbage overflow spilling onto road carriageway', is_primary: true },
      { id: 'img-002', complaint_id: 'comp-002', image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800', caption: 'Water pipeline rupture pooling into roadside drain', is_primary: true },
      { id: 'img-003', complaint_id: 'comp-003', image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800', caption: 'Open manhole pit near busy bus terminal corridor', is_primary: true },
      { id: 'img-004', complaint_id: 'comp-004', image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800', caption: 'Extensive pothole formation on temple approach road', is_primary: true },
      { id: 'img-005', complaint_id: 'comp-005', image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', caption: 'Damaged light fixture prior to repair', is_primary: true },
    ],
    complaint_deadlines: [
      { id: 'dl-001', complaint_id: 'comp-001', original_target_date: '2026-10-14', current_target_date: '2026-10-14', deadline_type: 'DEPARTMENT_PROVIDED_TARGET', responsible_department: 'Solid Waste Management & Health Wing', supporting_source_text: 'Official target committed by Sanitary Inspector Thiru S. Balan via Corporation Memo SWM/2026/TK-89', entered_by_user_id: 'user-councillor-senthil', entered_by_role: 'WARD_COUNCILLOR', is_active: true, created_at: '2026-10-07T10:00:00Z' },
      { id: 'dl-002', complaint_id: 'comp-002', original_target_date: '2026-10-12', current_target_date: '2026-10-12', deadline_type: 'VERIFIED_OFFICIAL_TIMELINE', responsible_department: 'City Water Works Department', supporting_source_text: 'Tamil Nadu Citizen Charter Rule 4(b) - Municipal Drinking Water Main Repairs within 48 hours', entered_by_user_id: 'user-department-murugan', entered_by_role: 'DEPARTMENT_HANDLER', is_active: true, created_at: '2026-10-07T14:00:00Z' },
      { id: 'dl-003', complaint_id: 'comp-003', original_target_date: '2026-10-05', current_target_date: '2026-10-16', deadline_type: 'ESTIMATED_TARGET', responsible_department: 'Underground Drainage & Sewerage Division', supporting_source_text: 'Target revised following extension request due to specialized pre-cast manhole cover procurement delay', entered_by_user_id: 'user-councillor-subramanian', entered_by_role: 'WARD_COUNCILLOR', is_active: true, created_at: '2026-09-29T10:00:00Z' },
      { id: 'dl-005', complaint_id: 'comp-005', original_target_date: '2026-10-09', current_target_date: '2026-10-09', deadline_type: 'DEPARTMENT_PROVIDED_TARGET', responsible_department: 'Electrical Maintenance Department', supporting_source_text: 'Contractor Work Order #EL-45-779 issued by Electrical Engineer', entered_by_user_id: 'user-councillor-meenakshi', entered_by_role: 'WARD_COUNCILLOR', is_active: true, created_at: '2026-10-05T12:00:00Z' },
    ],
    complaint_deadline_history: [
      { id: 'dlh-001', complaint_id: 'comp-003', deadline_id: 'dl-003', action_type: 'EXTENSION_REQUESTED', previous_target_date: '2026-10-05', new_target_date: '2026-10-16', requested_by_user_id: 'user-councillor-subramanian', requested_by_role: 'WARD_COUNCILLOR', decided_by_user_id: 'user-councillor-subramanian', reason: 'Heavy rain flooded trench preventing curing of cement collar; awaiting precast heavy duty ring.', status: 'APPROVED', created_at: '2026-10-05T16:00:00Z' },
    ],
    complaint_status_history: [
      { id: 'sh-001', complaint_id: 'comp-001', previous_status: 'Submitted', new_status: 'Acknowledged', actor_id: 'user-councillor-senthil', actor_role: 'WARD_COUNCILLOR', actor_name: 'Councillor M. Senthil Nathan', reason: 'Inspected site during morning ward inspection; escalated to Sanitary Inspector for dumper deployment.', update_source: 'COUNCILLOR', created_at: '2026-10-06T11:00:00Z' },
      { id: 'sh-002', complaint_id: 'comp-001', previous_status: 'Acknowledged', new_status: 'In Progress', actor_id: 'user-councillor-senthil', actor_role: 'WARD_COUNCILLOR', actor_name: 'Councillor M. Senthil Nathan', reason: 'Sanitary team with bobcat loader deployed for complete site clearance.', update_source: 'COUNCILLOR', created_at: '2026-10-08T09:00:00Z' },
      { id: 'sh-003', complaint_id: 'comp-002', previous_status: 'Submitted', new_status: 'Under Review', actor_id: 'user-department-murugan', actor_role: 'DEPARTMENT_HANDLER', actor_name: 'Er. K. Murugan', reason: 'Emergency valve isolated to stop wastage; welding team dispatched with 150mm ductile iron sleeve.', update_source: 'DEPARTMENT_OFFICER', created_at: '2026-10-07T09:00:00Z' },
      { id: 'sh-004', complaint_id: 'comp-002', previous_status: 'Under Review', new_status: 'In Progress', actor_id: 'user-department-murugan', actor_role: 'DEPARTMENT_HANDLER', actor_name: 'Er. K. Murugan', reason: 'Excavation completed and replacement pipe joint installation underway.', update_source: 'DEPARTMENT_OFFICER', created_at: '2026-10-08T10:00:00Z' },
      { id: 'sh-005', complaint_id: 'comp-002', previous_status: 'In Progress', new_status: 'Resolution Proposed', actor_id: 'user-department-murugan', actor_role: 'DEPARTMENT_HANDLER', actor_name: 'Er. K. Murugan', reason: 'Pipeline successfully sleeved, pressure tested up to 3.5 bar, and asphalt patch backfilled.', update_source: 'DEPARTMENT_OFFICER', created_at: '2026-10-10T10:00:00Z' },
      { id: 'sh-006', complaint_id: 'comp-005', previous_status: 'Submitted', new_status: 'In Progress', actor_id: 'user-councillor-meenakshi', actor_role: 'WARD_COUNCILLOR', actor_name: 'Councillor R. Meenakshi', reason: 'Hydraulic bucket truck dispatched for replacement LED fitting installation.', update_source: 'COUNCILLOR', created_at: '2026-10-05T14:00:00Z' },
      { id: 'sh-007', complaint_id: 'comp-005', previous_status: 'In Progress', new_status: 'Resolved', actor_id: 'user-councillor-meenakshi', actor_role: 'WARD_COUNCILLOR', actor_name: 'Councillor R. Meenakshi', reason: '70W LED fixture replaced and tested; citizen confirmed night illumination is restored.', update_source: 'COUNCILLOR', created_at: '2026-10-09T20:00:00Z' },
    ],
    complaint_resolution_evidence: [
      { id: 're-002', complaint_id: 'comp-002', submitted_by_user_id: 'user-department-murugan', submitted_by_role: 'DEPARTMENT_HANDLER', submitted_by_name: 'Er. K. Murugan', completion_date: '2026-10-10', description: '150mm ductile iron pipe joint replaced with high-grade flanged collar. Clean pressure reading verified at 3.5 bar without leaks. Trench compacted with wet gravel mix.', evidence_image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', source_of_resolution: 'Field Completion Inspection by Assistant Executive Engineer', is_disputed: false, created_at: '2026-10-10T10:00:00Z' },
      { id: 're-005', complaint_id: 'comp-005', submitted_by_user_id: 'user-councillor-meenakshi', submitted_by_role: 'WARD_COUNCILLOR', submitted_by_name: 'Councillor R. Meenakshi', completion_date: '2026-10-09', description: 'Old rusted bracket dismantled and new Philips 70W warm-white LED luminaire mounted and wired to timer circuit.', evidence_image_url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800', source_of_resolution: 'Electrical Contractor Job Card #4592 signed by Field Wireman', is_disputed: false, created_at: '2026-10-09T20:00:00Z' },
    ],
    complaint_supports: [
      { id: 'sup-01', complaint_id: 'comp-001', user_id: 'user-citizen-karthik', ward_id: 'ward-43-thoothukudi', created_at: '2026-10-06T10:00:00Z' },
      { id: 'sup-02', complaint_id: 'comp-002', user_id: 'user-citizen-karthik', ward_id: 'ward-43-thoothukudi', created_at: '2026-10-07T09:00:00Z' },
      { id: 'sup-03', complaint_id: 'comp-005', user_id: 'user-citizen-priya', ward_id: 'ward-45-thoothukudi', created_at: '2026-10-05T08:00:00Z' },
    ],
    complaint_comments: [
      { id: 'comm-01', complaint_id: 'comp-001', user_id: 'user-citizen-karthik', ward_id: 'ward-43-thoothukudi', comment_text: 'The stench is reaching inside classrooms during afternoon hours. Please expedite cleaning before Monday.', is_official: false, created_at: '2026-10-06T10:30:00Z' },
      { id: 'comm-02', complaint_id: 'comp-001', user_id: 'user-councillor-senthil', ward_id: 'ward-43-thoothukudi', comment_text: 'Spoke to Sanitary Inspector Thiru Balan. A compactor truck has been allocated for early morning sweep at 6:30 AM.', is_official: true, created_at: '2026-10-06T11:15:00Z' },
      { id: 'comm-03', complaint_id: 'comp-002', user_id: 'user-citizen-anand', ward_id: 'ward-43-thoothukudi', comment_text: 'Water supply to odd-numbered houses on 3rd street was disrupted since yesterday morning.', is_official: false, created_at: '2026-10-07T08:45:00Z' },
      { id: 'comm-04', complaint_id: 'comp-002', user_id: 'user-department-murugan', ward_id: 'ward-43-thoothukudi', comment_text: 'Pipeline isolated at Valve #4. Main pressure restoration anticipated by 4:00 PM today.', is_official: true, created_at: '2026-10-07T09:30:00Z' },
    ],
    complaint_official_updates: [
      { id: 'ou-01', complaint_id: 'comp-001', author_id: 'user-councillor-senthil', author_role: 'WARD_COUNCILLOR', author_name: 'Councillor M. Senthil Nathan', update_title: 'Sanitary Conservancy Team Mobilized', update_body: 'Zone 2 conservancy supervisor assigned 4 conservancy workers with mini tipper vehicle for complete clearing.', department_source: 'Thoothukudi Corporation Health Department', reference_no: 'TKC/SWM/2026/043', progress_percentage: 60, created_at: '2026-10-08T09:30:00Z' },
    ],
    complaint_escalations: [
      { id: 'esc-001', complaint_id: 'comp-003', escalation_reference: 'ESC-2026-00088', initiated_by_user_id: 'user-citizen-karthik', initiated_by_role: 'CITIZEN', reason_category: 'OVERDUE_DEADLINE', detailed_reason: 'Critical open manhole hazard remained completely unaddressed past the 5-day deadline. School children pass this route daily.', escalation_tier: 'TIER_2_MUNICIPAL_COMMISSIONER', target_authority: 'Municipal Commissioner, Tirunelveli Corporation', external_portal_ref: 'TNC-2026-8812', status: 'UNDER_REVIEW', official_action_notes: 'Referred to Superintending Engineer for immediate spot barricading and cast iron grating placement.', created_at: '2026-10-06T15:00:00Z' },
    ],
    confidential_accountability_reports: [
      { id: 'acc-001', case_reference_id: 'ACC-2026-00012', reporter_user_id: 'user-citizen-anand', complaint_id: 'comp-003', complaint_reference_id: 'CIV-2026-00045', reported_councillor_user_id: 'user-councillor-subramanian', reported_ward_id: 'ward-12-tirunelveli', concern_type: 'FALSE_CLAIM_OF_RESOLUTION', description: 'Public grievance for open stormwater catch basin was marked as completed in the internal register despite open pit continuing to endanger evening traffic without barricade.', timeline_dates_text: 'Reported on Sept 28; marked closed on Oct 2; photo taken Oct 4 shows open hole', follow_up_attempts_text: 'Attempted 3 phone calls to ward office; no response given', expected_action_and_outcome: 'Independent field inspection by District Oversight Board and penalization of false sign-off', status: 'Under Review', is_anonymity_requested: true, created_at: '2026-10-04T11:00:00Z' },
    ],
    accountability_review_assignments: [
      { id: 'ara-001', report_id: 'acc-001', reviewer_user_id: 'user-reviewer-kalyani', assigned_by_user_id: 'user-admin-ramanathan', is_active: true, assigned_at: '2026-10-04T12:00:00Z' },
    ],
    accountability_case_history: [
      { id: 'ach-001', report_id: 'acc-001', actor_id: 'user-citizen-anand', actor_role: 'CITIZEN', action_type: 'SUBMISSION', findings_or_notes: 'Confidential report submitted with time-stamped geotagged photograph showing unaddressed hazard.', referred_to_authority: null, is_visible_to_reporter: true, created_at: '2026-10-04T11:00:00Z' },
      { id: 'ach-002', report_id: 'acc-001', actor_id: 'user-admin-ramanathan', actor_role: 'ADMIN', action_type: 'ASSIGNMENT', findings_or_notes: 'Case routed to Independent Accountability Reviewer Smt. V. Kalyani. Reported councillor barred from access.', referred_to_authority: null, is_visible_to_reporter: true, created_at: '2026-10-04T12:00:00Z' },
      { id: 'ach-003', report_id: 'acc-001', actor_id: 'user-reviewer-kalyani', actor_role: 'ACCOUNTABILITY_REVIEWER', action_type: 'FINDING_RECORDED', findings_or_notes: 'Preliminary review indicates contractor submitted closure without field inspection photo. Notice served to Tirunelveli Engineering Cell.', referred_to_authority: 'Directorate of Municipal Administration, Chennai', is_visible_to_reporter: true, created_at: '2026-10-08T15:30:00Z' },
    ],
    accountability_evidence: [
      { id: 'ae-001', report_id: 'acc-001', file_name: 'evidence_manhole_unclosed_oct4.jpg', file_path_private: 'private/evidence_manhole_unclosed_oct4.jpg', file_size_bytes: 420000, mime_type: 'image/jpeg', uploaded_by_user_id: 'user-citizen-anand', description: 'Photo taken on Oct 4 with newspaper showing ongoing pit', created_at: '2026-10-04T11:05:00Z' },
    ],
    ward_groups: [
      { id: 'wg-43', ward_id: 'ward-43-thoothukudi', title: 'Ward 43 Citizen Community Forum', rules_notice: 'Civic discussions only. Be respectful. No political campaigning or spam.', created_at: '2026-08-01T08:00:00Z' },
      { id: 'wg-45', ward_id: 'ward-45-thoothukudi', title: 'Ward 45 Citizen Community Forum', rules_notice: 'Civic discussions only.', created_at: '2026-08-01T08:00:00Z' },
      { id: 'wg-12', ward_id: 'ward-12-tirunelveli', title: 'Ward 12 Palayamkottai Community Forum', rules_notice: 'Civic discussions only.', created_at: '2026-08-01T08:00:00Z' },
      { id: 'wg-08', ward_id: 'ward-08-tenkasi', title: 'Ward 8 Tenkasi Community Forum', rules_notice: 'Civic discussions only.', created_at: '2026-08-01T08:00:00Z' },
    ],
    ward_announcements: [
      { id: 'wa-01', ward_id: 'ward-43-thoothukudi', author_user_id: 'user-councillor-senthil', title: 'Pre-Monsoon Storm Water Drain De-silting Schedule for Ward 43', content: 'De-silting work along Millerpuram Main Road and Bryant Nagar drains commences this Thursday. Residents are requested not to park vehicles over storm culverts between 7:00 AM and 1:00 PM.', priority: 'IMPORTANT', expires_at: '2026-10-31T23:59:59Z', created_at: '2026-10-05T09:00:00Z' },
      { id: 'wa-02', ward_id: 'ward-43-thoothukudi', author_user_id: 'user-councillor-senthil', title: 'Source Segregation of Solid Waste: New Green & Blue Bins Distribution', content: 'Corporation conservancy staff will distribute paired household waste bins this Saturday at the Ward 43 Sub-Office from 9:00 AM to 5:00 PM.', priority: 'NORMAL', expires_at: '2026-10-25T23:59:59Z', created_at: '2026-10-07T10:00:00Z' },
    ],
    messages: [
      { id: 'msg-01', ward_id: 'ward-43-thoothukudi', sender_user_id: 'user-councillor-senthil', sender_name: 'Councillor M. Senthil Nathan', sender_role: 'WARD_COUNCILLOR', message_text: 'Vanakkam ward residents. Please report any drainage leaks or clogged culverts early before monsoon rains.', complaint_ref_link: null, is_announcement: false, is_moderated: false, created_at: '2026-10-06T08:00:00Z' },
      { id: 'msg-02', ward_id: 'ward-43-thoothukudi', sender_user_id: 'user-citizen-anand', sender_name: 'Anand Kumar', sender_role: 'CITIZEN', message_text: 'Thank you Councillor. We have submitted complaint CIV-2026-00043 regarding waste dumping opposite Millerpuram school.', complaint_ref_link: 'CIV-2026-00043', is_announcement: false, is_moderated: false, created_at: '2026-10-06T09:35:00Z' },
      { id: 'msg-03', ward_id: 'ward-43-thoothukudi', sender_user_id: 'user-councillor-senthil', sender_name: 'Councillor M. Senthil Nathan', sender_role: 'WARD_COUNCILLOR', message_text: 'Noted Anand. Bobcat excavator is scheduled for 6:30 AM tomorrow morning.', complaint_ref_link: 'CIV-2026-00043', is_announcement: false, is_moderated: false, created_at: '2026-10-06T11:20:00Z' },
      { id: 'msg-04', ward_id: 'ward-43-thoothukudi', sender_user_id: 'user-citizen-karthik', sender_name: 'Karthik Selvam', sender_role: 'CITIZEN', message_text: 'Can we also get mosquito fogging done in Bryant Nagar 4th and 5th streets this week?', complaint_ref_link: null, is_announcement: false, is_moderated: false, created_at: '2026-10-07T14:10:00Z' },
    ],
    notifications: [
      { id: 'notif-01', user_id: 'user-citizen-anand', title: 'Resolution Proposed for CIV-2026-00044', message: 'Water Works department has proposed resolution for your drinking water pipeline issue. Please inspect and confirm or dispute.', type: 'RESOLUTION_PROPOSED', related_entity_type: 'COMPLAINT', related_entity_id: 'comp-002', is_read: false, created_at: '2026-10-10T10:00:00Z' },
      { id: 'notif-02', user_id: 'user-citizen-anand', title: 'Deadline Assigned to CIV-2026-00043', message: 'Resolution target date 14 Oct 2026 committed by Solid Waste Management department.', type: 'DEADLINE_SET', related_entity_type: 'COMPLAINT', related_entity_id: 'comp-001', is_read: true, created_at: '2026-10-07T10:00:00Z' },
      { id: 'notif-03', user_id: 'user-councillor-senthil', title: 'New Complaint Reported in Ward 43', message: 'Citizen Anand Kumar submitted CIV-2026-00043: Garbage dumping near Millerpuram school.', type: 'STATUS_CHANGED', related_entity_type: 'COMPLAINT', related_entity_id: 'comp-001', is_read: true, created_at: '2026-10-06T09:30:00Z' },
    ],
    official_escalation_contacts: [
      { id: 'oec-01', portal_name: 'Tamil Nadu Chief Minister Helpline (Mudalvarin Mugavari)', authority_level: 'STATE_LEVEL', district_id: null, department_name: 'Public Grievance Redressal Dept', helpline_number: '1100 (Toll Free)', website_url: 'https://cmhelpline.tnega.org', escalation_instructions: 'Use CM Helpline if ward-level or municipal body issues remain unresolved beyond the designated citizen charter SLA or after formal appeal.', last_verified_date: '2026-09-15', is_verified: true },
      { id: 'oec-02', portal_name: 'Thoothukudi City Corporation 24x7 Control Room', authority_level: 'MUNICIPAL_CORPORATION', district_id: 'dist-thoothukudi', department_name: 'Corporation General Grievances', helpline_number: '0461-2326901 / 1800-425-4244', website_url: 'https://thoothukudicorporation.tn.gov.in', escalation_instructions: 'Direct corporation grievance line for urgent civic failures, uncollected waste dumps, and water supply ruptures across Wards 1 to 60.', last_verified_date: '2026-09-20', is_verified: true },
      { id: 'oec-03', portal_name: 'Tirunelveli Corporation Citizen WhatsApp Service', authority_level: 'MUNICIPAL_CORPORATION', district_id: 'dist-tirunelveli', department_name: 'Municipal Administration', helpline_number: '94437-01234', website_url: 'https://tirunelvelicorporation.tn.gov.in', escalation_instructions: 'Send photo, location coordinates, and description for automated token generation with the Commissioner office.', last_verified_date: '2026-08-30', is_verified: true },
      { id: 'oec-04', portal_name: 'TANGEDCO (Electricity Board) Minnagam Central Control', authority_level: 'DEPARTMENTAL_DIRECTORATE', district_id: null, department_name: 'Tamil Nadu Generation and Distribution Corp', helpline_number: '94987 94987', website_url: 'https://www.tangedco.gov.in', escalation_instructions: 'Report sparking transformers, sagging high-tension conductors, power outages, and broken utility poles 24x7.', last_verified_date: '2026-10-01', is_verified: true },
      { id: 'oec-05', portal_name: 'TWAD Board Drinking Water Emergency Helpline', authority_level: 'DEPARTMENTAL_DIRECTORATE', district_id: null, department_name: 'Tamil Nadu Water Supply & Drainage Board', helpline_number: '1916 / 044-28524907', website_url: 'https://www.twadboard.tn.gov.in', escalation_instructions: 'Escalate bulk water transmission breakdowns, regional water scheme pump failures, and canal water supply issues.', last_verified_date: '2026-09-10', is_verified: true },
    ],
    deadline_rules: [
      { id: 'dr-01', category_id: 'cat-garbage', severity: 'MEDIUM', standard_resolution_days: 3, max_permitted_extension_days: 3, requires_department_written_quote: true, description: 'Solid waste clearance standard SLA' },
      { id: 'dr-02', category_id: 'cat-roads', severity: 'HIGH', standard_resolution_days: 10, max_permitted_extension_days: 7, requires_department_written_quote: true, description: 'Pothole asphalt patch and leveling' },
      { id: 'dr-03', category_id: 'cat-streetlights', severity: 'MEDIUM', standard_resolution_days: 4, max_permitted_extension_days: 3, requires_department_written_quote: false, description: 'Streetlight repair & bulb replacement' },
      { id: 'dr-04', category_id: 'cat-sewage', severity: 'CRITICAL', standard_resolution_days: 3, max_permitted_extension_days: 3, requires_department_written_quote: true, description: 'Open manhole and sewer overflow emergency SLA' },
      { id: 'dr-05', category_id: 'cat-water', severity: 'HIGH', standard_resolution_days: 4, max_permitted_extension_days: 2, requires_department_written_quote: true, description: 'Municipal drinking water pipeline repair' },
    ],
    audit_logs: [
      { id: 'al-01', actor_id: 'user-councillor-senthil', actor_role: 'WARD_COUNCILLOR', action: 'STATUS_TRANSITION', resource_type: 'COMPLAINT', resource_id: 'comp-001', ip_address: '127.0.0.1', metadata_json: JSON.stringify({ from: 'Acknowledged', to: 'In Progress' }), created_at: '2026-10-08T09:00:00Z' },
    ],
    approval_requests: [
      {
        id: 'appr-demo-01',
        user_id: 'user-citizen-karthik',
        user_name: 'Karthik Selvam',
        user_email: 'karthik.selvam@civicmail.in',
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        phone: '9842100003',
        requested_role: 'CITIZEN',
        requested_ward_id: 'ward-43-thoothukudi',
        requested_ward_name: 'Millerpuram - Bryant Nagar (Ward 43)',
        requested_department_id: null,
        address_line: '12, Kamaraj Nagar 3rd Cross',
        pincode: '628008',
        status: 'PENDING',
        notes: 'Submitted resident address proof for verification',
        rejection_reason: null,
        reviewed_by_user_id: null,
        reviewed_by_name: null,
        reviewed_at: null,
        created_at: '2026-10-18T10:00:00Z',
      },
    ],
    refresh_tokens: [],
  };
}

// ═══════════════════════════════════════════════════════════════
// DB state + pool + timers
// ═══════════════════════════════════════════════════════════════
let pool = null;
let inMemoryStore = null;

const DB_STATE = Object.freeze({
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  RECONNECTING: 'RECONNECTING',
});

let dbState = DB_STATE.DISCONNECTED;
let healthTimer = null;
let reconnectTimer = null;

const HEALTH_CHECK_INTERVAL_MS = 30_000;
const RECONNECT_INTERVAL_MS = 30_000;

export const getDBState = () => dbState;
export const isUsingMySQL = () => dbState === DB_STATE.CONNECTED;

// ═══════════════════════════════════════════════════════════════
// Pool
// ═══════════════════════════════════════════════════════════════
export function createPool() {
  if (pool) 
    return pool;

  pool = mysql.createPool({
    host: ENV.DB.HOST || 'localhost',
    port: Number(ENV.DB.PORT || 3306),
    user: ENV.DB.USER || 'root',
    password: ENV.DB.PASSWORD || '',
    database: ENV.DB.NAME || 'civic_grievance',
    waitForConnections: true,
    connectionLimit: Number(ENV.DB.POOL_LIMIT || 10),
    queueLimit: 0,
    connectTimeout: 10_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: 'Z',
    charset: 'utf8mb4',
  });

  return pool;
}

export async function pingDB() 
{
  if (!pool) 
    return false;
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } 
  catch {
    return false;
  }
}

export async function query(sql, params = []) {
  if (!pool) 
    createPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function withTransaction(fn) {
  if (!pool) 
    createPool();
  const conn = await pool.getConnection();
  try 
  {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } 
  catch (err) 
  {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ═══════════════════════════════════════════════════════════════
// Health check (every 30s while CONNECTED)
// ═══════════════════════════════════════════════════════════════
function startHealthCheck() {
  if (healthTimer) 
    return;

  healthTimer = setInterval(async () => {
    const alive = await pingDB();

    if (alive) 
    {
      if (dbState !== DB_STATE.CONNECTED) 
      {
        dbState = DB_STATE.CONNECTED;
        console.log('✅ DB health OK — state = CONNECTED');
      }
      return;
    }

    // DB lost during runtime
    if (dbState === DB_STATE.CONNECTED) 
    {
      console.warn('⚠️  DB connection LOST during runtime');
      dbState = DB_STATE.DISCONNECTED;
      stopHealthCheck();
      startReconnectLoop();
    }
  }, HEALTH_CHECK_INTERVAL_MS);
}

function stopHealthCheck() {
  if (healthTimer) 
  {
    clearInterval(healthTimer);
    healthTimer = null;
    console.log('🛑 Health-check timer stopped');
  }
}

// ═══════════════════════════════════════════════════════════════
// Reconnect loop (every 30s while DISCONNECTED, max 3 attempts)
// ═══════════════════════════════════════════════════════════════
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

function startReconnectLoop() {
  if (reconnectTimer) 
    return;

  reconnectAttempts = 0;
  dbState = DB_STATE.RECONNECTING;
  console.log(`🔁 Background MySQL check initialized (max ${MAX_RECONNECT_ATTEMPTS} attempts)...`);

  const attempt = async () => 
  {
    reconnectAttempts++;
    // Fresh pool — old connections are dead after a crash
    if (pool) 
    {
      try { 
        await pool.end(); 
      }
      catch 
      { /* ignore */ }
      pool = null;
    }

    createPool();
    const ok = await pingDB();

    if (ok) {
      console.log('✅ DB reconnected successfully!');
      dbState = DB_STATE.CONNECTED;
      stopReconnectLoop();
      startHealthCheck();
    } 
    else 
    {
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log(`ℹ️ MySQL connection retry limit reached (${MAX_RECONNECT_ATTEMPTS}). Remaining in resilient JSON store mode.`);
        stopReconnectLoop();
        dbState = DB_STATE.DISCONNECTED;
      }
    }
  };

  attempt();
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectTimer = setInterval(attempt, RECONNECT_INTERVAL_MS);
  }
}

function stopReconnectLoop() {
  if (reconnectTimer) {
    clearInterval(reconnectTimer);
    reconnectTimer = null;
    console.log('🛑 Reconnect timer stopped');
  }
}

// ═══════════════════════════════════════════════════════════════
// JSON fallback store
// ═══════════════════════════════════════════════════════════════
function loadJSONStore() {
  if (inMemoryStore) 
    return inMemoryStore;

  if (fs.existsSync(DATA_STORE_PATH)) {
    try {
      const raw = fs.readFileSync(DATA_STORE_PATH, 'utf8');
      inMemoryStore = JSON.parse(raw);
      if (!inMemoryStore.departments || inMemoryStore.departments.length === 0) 
      {
        inMemoryStore.departments = getInitialSeedData().departments;
      }
      if (!inMemoryStore.approval_requests) 
      {
        inMemoryStore.approval_requests = getInitialSeedData().approval_requests || [];
      }
      if (inMemoryStore.users) 
      {
        inMemoryStore.users.forEach((u) => {
          if (!u.approval_status) u.approval_status = 'APPROVED';
        });
      }
      persistDB();
    } 
    catch (e) 
    {
      console.warn('Could not read store file, reseeding:', e.message);
      inMemoryStore = getInitialSeedData();
      persistDB();
    }
  } else {
    inMemoryStore = getInitialSeedData();
    persistDB();
  }

  return inMemoryStore;
}

export function persistDB() {
  if (!inMemoryStore) 
    return;
  try {
    const dir = path.dirname(DATA_STORE_PATH);
    if (!fs.existsSync(dir)) 
      fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(inMemoryStore, null, 2), 'utf8');
  } 
  catch (err) {
    console.error('Error writing data_store.json:', err.message);
  }
}

export function getDB() {
  if (!inMemoryStore) 
    loadJSONStore();
  return inMemoryStore;
}

// ═══════════════════════════════════════════════════════════════
// Initializer + shutdown
// ═══════════════════════════════════════════════════════════════
export async function initDB() {
  createPool();
  const ok = await pingDB();

  if (ok) {
    dbState = DB_STATE.CONNECTED;
    console.log('✅ MySQL connected');
    console.log('🚀 Running on MySQL');
    startHealthCheck();
  } 
  else 
  {
    dbState = DB_STATE.DISCONNECTED;
    console.log('ℹ️  MySQL offline or not configured — JSON store active');
    if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
      startReconnectLoop();
    }
  }

  loadJSONStore();
  return { state: dbState, store: inMemoryStore };
}

export async function closePool() {
  stopHealthCheck();
  stopReconnectLoop();
  if (pool) 
    {
    try 
    { await pool.end(); } 
    catch { /* ignore */ }
    pool = null;
  }
  dbState = DB_STATE.DISCONNECTED;
  console.log('MySQL pool closed & timers stopped');
}

export default {
  initDB,
  getDB,
  persistDB,
  loadJSONStore,
  createPool,
  pingDB,
  query,
  withTransaction,
  closePool,
  getDBState,
  isUsingMySQL,
};