-- seed.sql
-- Development Seed Data for Tamil Nadu Civic Grievance System
-- Fictional entities and demonstration accounts for Thoothukudi, Tirunelveli, and Tenkasi

USE civic_grievance;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
('role-citizen', 'CITIZEN', 'Registered citizen reporting and tracking civic problems'),
('role-councillor', 'WARD_COUNCILLOR', 'Authorized representative managing ward-level issues'),
('role-department', 'DEPARTMENT_HANDLER', 'Authorized departmental engineer/inspector recording field progress'),
('role-reviewer', 'ACCOUNTABILITY_REVIEWER', 'Independent authorized reviewer for confidential accountability cases'),
('role-admin', 'ADMIN', 'System administrator with platform governance authority')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Insert Districts
INSERT INTO districts (id, name, state, code, headquarters) VALUES
('dist-thoothukudi', 'Thoothukudi', 'Tamil Nadu', 'TN-TK', 'Thoothukudi'),
('dist-tirunelveli', 'Tirunelveli', 'Tamil Nadu', 'TN-TV', 'Tirunelveli'),
('dist-tenkasi', 'Tenkasi', 'Tamil Nadu', 'TN-TS', 'Tenkasi'),
('dist-chennai', 'Chennai', 'Tamil Nadu', 'TN-CH', 'Chennai'),
('dist-madurai', 'Madurai', 'Tamil Nadu', 'TN-MD', 'Madurai')
ON DUPLICATE KEY UPDATE name=name;

-- 3. Insert Local Bodies
INSERT INTO local_bodies (id, district_id, name, body_type, code, contact_email, contact_phone) VALUES
('lb-thoothukudi-corp', 'dist-thoothukudi', 'Thoothukudi City Municipal Corporation', 'CORPORATION', 'TCMC', 'commissioner@thoothukudicorporation.tn.gov.in', '0461-2326901'),
('lb-tirunelveli-corp', 'dist-tirunelveli', 'Tirunelveli City Municipal Corporation', 'CORPORATION', 'VCMC', 'commissioner@tirunelvelicorporation.tn.gov.in', '0462-2329325'),
('lb-tenkasi-muni', 'dist-tenkasi', 'Tenkasi Municipality', 'MUNICIPALITY', 'TKM', 'commr.tenkasi@tn.gov.in', '04633-222238')
ON DUPLICATE KEY UPDATE name=name;

-- 4. Insert Wards
INSERT INTO wards (id, local_body_id, ward_number, ward_name, councillor_user_id, councillor_name, population_approx, area_sq_km) VALUES
('ward-43-thoothukudi', 'lb-thoothukudi-corp', 43, 'Millerpuram - Bryant Nagar (Ward 43)', 'user-councillor-senthil', 'Councillor M. Senthil Nathan', 12400, 3.2),
('ward-45-thoothukudi', 'lb-thoothukudi-corp', 45, 'Cruz Fernandez Avenue - Cruzpuram (Ward 45)', 'user-councillor-meenakshi', 'Councillor R. Meenakshi', 14800, 2.8),
('ward-12-tirunelveli', 'lb-tirunelveli-corp', 12, 'Palayamkottai Central (Ward 12)', 'user-councillor-subramanian', 'Councillor K. Subramanian', 18200, 4.1),
('ward-08-tenkasi', 'lb-tenkasi-muni', 8, 'Old Bus Stand - Kasi Viswanathar Temple Ward (Ward 8)', 'user-councillor-kanagaraj', 'Councillor S. Kanagaraj', 9600, 2.1)
ON DUPLICATE KEY UPDATE ward_name=ward_name;

-- 5. Insert Categories
INSERT INTO categories (id, name, slug, description, icon_name, default_priority, estimated_sla_days) VALUES
('cat-garbage', 'Garbage & Waste Collection', 'garbage-waste', 'Solid waste dumping, uncollected trash bins, organic waste accumulation', 'Trash2', 'MEDIUM', 3),
('cat-roads', 'Damaged Roads & Potholes', 'damaged-roads', 'Potholes, broken tar, missing paver blocks, asphalt erosion', 'Construction', 'HIGH', 10),
('cat-streetlights', 'Streetlight Failures', 'streetlights', 'Non-functional streetlights, broken fixtures, dark stretch hazards', 'Lightbulb', 'MEDIUM', 4),
('cat-drainage', 'Drainage Leakage & Blockage', 'drainage-leakage', 'Clogged storm water drains, overflow on roads, structural damage to culverts', 'Droplets', 'HIGH', 5),
('cat-sewage', 'Sewage & Sanitation', 'sewage-sanitation', 'Underground sewer overflow, open manholes, contaminated wastewater leakage', 'Biohazard', 'CRITICAL', 3),
('cat-water', 'Water Supply Issues', 'water-supply', 'Pipe ruptures, low pressure, contaminated municipal drinking water, valve leaks', 'GlassWater', 'HIGH', 4),
('cat-infrastructure', 'Public Infrastructure', 'public-infrastructure', 'Damaged bus shelters, broken park benches, perilous compound walls', 'Building2', 'MEDIUM', 14),
('cat-electricity', 'Electricity-Related Civic Issues', 'electricity-civic', 'Hanging low-tension wires, sparking transformers, leaning electric poles', 'Zap', 'CRITICAL', 2),
('cat-traffic', 'Traffic & Road Obstruction', 'traffic-obstruction', 'Abandoned construction debris, unauthorized road blockages, missing warning signs', 'ShieldAlert', 'MEDIUM', 3),
('cat-other', 'Other Civic Problems', 'other-civic', 'General civic issues not covered under specific departmental categories', 'HelpCircle', 'LOW', 7)
ON DUPLICATE KEY UPDATE name=name;

-- 6. Insert Users
INSERT INTO users (id, google_id, email, full_name, avatar_url, phone, ward_id, role) VALUES
('user-citizen-anand', 'demo-google-anand-01', 'anand.kumar@civicmail.in', 'Anand Kumar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', '9842100001', 'ward-43-thoothukudi', 'CITIZEN'),
('user-citizen-priya', 'demo-google-priya-02', 'priya.natarajan@civicmail.in', 'Priya Natarajan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', '9842100002', 'ward-45-thoothukudi', 'CITIZEN'),
('user-citizen-karthik', 'demo-google-karthik-03', 'karthik.selvam@civicmail.in', 'Karthik Selvam', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', '9842100003', 'ward-43-thoothukudi', 'CITIZEN'),
('user-councillor-senthil', 'demo-google-senthil-04', 'councillor.ward43@thoothukudi.gov.in', 'Councillor M. Senthil Nathan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '9443300043', 'ward-43-thoothukudi', 'WARD_COUNCILLOR'),
('user-councillor-meenakshi', 'demo-google-meenakshi-05', 'councillor.ward45@thoothukudi.gov.in', 'Councillor R. Meenakshi', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', '9443300045', 'ward-45-thoothukudi', 'WARD_COUNCILLOR'),
('user-councillor-subramanian', 'demo-google-subramanian-06', 'councillor.ward12@tirunelveli.gov.in', 'Councillor K. Subramanian', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '9443300012', 'ward-12-tirunelveli', 'WARD_COUNCILLOR'),
('user-department-murugan', 'demo-google-murugan-07', 'eng.murugan@thoothukudicorporation.tn.gov.in', 'Er. K. Murugan (Asst. Exec. Engineer)', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', '9443100101', 'ward-43-thoothukudi', 'DEPARTMENT_HANDLER'),
('user-reviewer-kalyani', 'demo-google-kalyani-08', 'reviewer.kalyani@accountability.tn.gov.in', 'Smt. V. Kalyani (Retd. District Officer)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', '9442200202', 'ward-43-thoothukudi', 'ACCOUNTABILITY_REVIEWER'),
('user-admin-ramanathan', 'demo-google-admin-09', 'admin.ramanathan@civicgrievance.tn.gov.in', 'K. Ramanathan (System Administrator)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '9444400099', 'ward-43-thoothukudi', 'ADMIN')
ON DUPLICATE KEY UPDATE email=email;

-- 7. Insert User Details
INSERT INTO user_details (user_id, address_line, pincode, is_ward_verified, designation, department_name) VALUES
('user-citizen-anand', '42/A, Millerpuram 2nd Street', '628008', TRUE, 'Resident Citizen', NULL),
('user-citizen-priya', '18, Cruzpuram Beach Road', '628001', TRUE, 'Resident Citizen', NULL),
('user-citizen-karthik', '115, Bryant Nagar 5th Street', '628008', TRUE, 'Resident Citizen', NULL),
('user-councillor-senthil', 'Ward 43 Councillor Office, Millerpuram Main Rd', '628008', TRUE, 'Elected Ward Councillor', 'Thoothukudi Corporation Council'),
('user-councillor-meenakshi', 'Ward 45 Councillor Office, Cruzpuram', '628001', TRUE, 'Elected Ward Councillor', 'Thoothukudi Corporation Council'),
('user-councillor-subramanian', 'Ward 12 Office, Palayamkottai Market Road', '627002', TRUE, 'Elected Ward Councillor', 'Tirunelveli Corporation Council'),
('user-department-murugan', 'Engineering Wing, Central Zone, Thoothukudi Corp', '628002', TRUE, 'Assistant Executive Engineer', 'Public Works & Roads Wing'),
('user-reviewer-kalyani', 'District Vigilance & Grievance Review Chamber', '628001', TRUE, 'Independent Accountability Reviewer', 'Civil Services Oversight Board'),
('user-admin-ramanathan', 'State Civic Tech Operations Cell, Secretariat', '600009', TRUE, 'Principal Administrator', 'Information Technology Department')
ON DUPLICATE KEY UPDATE address_line=address_line;

-- 8. Insert Ward Memberships
INSERT INTO ward_members (id, ward_id, user_id, is_verified) VALUES
('wm-01', 'ward-43-thoothukudi', 'user-citizen-anand', TRUE),
('wm-02', 'ward-43-thoothukudi', 'user-citizen-karthik', TRUE),
('wm-03', 'ward-43-thoothukudi', 'user-councillor-senthil', TRUE),
('wm-04', 'ward-45-thoothukudi', 'user-citizen-priya', TRUE),
('wm-05', 'ward-45-thoothukudi', 'user-councillor-meenakshi', TRUE),
('wm-06', 'ward-12-tirunelveli', 'user-councillor-subramanian', TRUE)
ON DUPLICATE KEY UPDATE is_verified=is_verified;

-- 9. Insert Seed Complaints
INSERT INTO complaints (id, reference_id, title, description, category_id, user_id, ward_id, district_id, local_body_id, latitude, longitude, address_text, landmark, status, deadline_condition, verification_state, priority, supports_count, comments_count) VALUES
('comp-001', 'CIV-2026-00043', 'Severe garbage dumping and waste overflow opposite Millerpuram School', 'Commercial vegetable crates and decomposing municipal solid waste have been dumped openly along the school perimeter road for over 5 days. Cattle and stray animals are scattering garbage onto the carriageway, blocking pedestrian movement.', 'cat-garbage', 'user-citizen-anand', 'ward-43-thoothukudi', 'dist-thoothukudi', 'lb-thoothukudi-corp', 8.8042100, 78.1348000, 'Millerpuram Main Road, Ward 43, Thoothukudi', 'Opposite St. Thomas Higher Secondary School Gate', 'In Progress', 'ON_TRACK', 'PENDING_PROPOSAL', 'HIGH', 14, 3),

('comp-002', 'CIV-2026-00044', 'Underground drinking water main line burst at Bryant Nagar 3rd Street', 'Treated municipal drinking water is spewing continuously from a burst underground pipeline joint, flooding the street and causing acute drinking water pressure drops in neighbouring residential blocks.', 'cat-water', 'user-citizen-anand', 'ward-43-thoothukudi', 'dist-thoothukudi', 'lb-thoothukudi-corp', 8.7981200, 78.1399400, 'Bryant Nagar 3rd Street West, Ward 43, Thoothukudi', 'Near CSI Church intersection', 'Resolution Proposed', 'ON_TRACK', 'AWAITING_CITIZEN_CONFIRMATION', 'HIGH', 22, 5),

('comp-003', 'CIV-2026-00045', 'Hazardous open manhole without warning barricade near Palayamkottai Bus Terminal', 'Heavy commercial bus vibrations broke the concrete slab of a stormwater catch basin. The deep opening poses an immediate fatal hazard to two-wheelers and pedestrians, especially after sunset.', 'cat-sewage', 'user-citizen-karthik', 'ward-12-tirunelveli', 'dist-tirunelveli', 'lb-tirunelveli-corp', 8.7184000, 77.7492000, 'Tiruchendur Road, Palayamkottai, Ward 12, Tirunelveli', '50m from Palayamkottai Main Bus Stand Entry', 'Under Review', 'OVERDUE', 'PENDING_PROPOSAL', 'CRITICAL', 38, 7),

('comp-004', 'CIV-2026-00046', 'Deep craters and broken bitumen on Tenkasi Temple Street causing vehicle damage', 'Monsoon runoff created deep 2-foot trenches in the main road connecting Old Bus Stand to Kasi Viswanathar Temple. Several school buses and autos are getting stuck daily.', 'cat-roads', 'user-citizen-anand', 'ward-08-tenkasi', 'dist-tenkasi', 'lb-tenkasi-muni', 8.9592000, 77.3146000, 'Temple Car Street, Ward 8, Tenkasi', 'Near Kasi Viswanathar Temple North Arch', 'Submitted', 'APPROACHING', 'PENDING_PROPOSAL', 'MEDIUM', 9, 2),

('comp-005', 'CIV-2026-00047', 'Broken LED streetlight pole leaning precariously after localized storm', 'Streetlight pole fixture #ST-45-12 was struck by a falling palm branch. It is dark at night, creating safety issues for fishermen returning home late.', 'cat-streetlights', 'user-citizen-priya', 'ward-45-thoothukudi', 'dist-thoothukudi', 'lb-thoothukudi-corp', 8.8122000, 78.1561000, 'Cruz Fernandez Avenue, Ward 45, Thoothukudi', 'Opposite Cruzpuram Community Hall', 'Resolved', 'ON_TRACK', 'CONFIRMED_RESOLVED', 'MEDIUM', 18, 4)
ON DUPLICATE KEY UPDATE title=title;

-- 10. Insert Complaint Images
INSERT INTO complaint_images (id, complaint_id, image_url, caption, is_primary) VALUES
('img-001', 'comp-001', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80', 'Debris and garbage overflow spilling onto road carriageway', TRUE),
('img-002', 'comp-002', 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80', 'Water pipeline rupture pooling into roadside drain', TRUE),
('img-003', 'comp-003', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80', 'Open manhole pit near busy bus terminal corridor', TRUE),
('img-004', 'comp-004', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80', 'Extensive pothole formation on temple approach road', TRUE),
('img-005', 'comp-005', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80', 'Damaged light fixture prior to repair', TRUE)
ON DUPLICATE KEY UPDATE image_url=image_url;

-- 11. Insert Deadlines (Transparent, Evidence-Based)
INSERT INTO complaint_deadlines (id, complaint_id, original_target_date, current_target_date, deadline_type, responsible_department, supporting_source_text, entered_by_user_id, entered_by_role) VALUES
('dl-001', 'comp-001', '2026-10-14', '2026-10-14', 'DEPARTMENT_PROVIDED_TARGET', 'Solid Waste Management & Health Wing', 'Official target committed by Sanitary Inspector Thiru S. Balan via Corporation Memo SWM/2026/TK-89', 'user-councillor-senthil', 'WARD_COUNCILLOR'),
('dl-002', 'comp-002', '2026-10-12', '2026-10-12', 'VERIFIED_OFFICIAL_TIMELINE', 'City Water Works Department', 'Tamil Nadu Citizen Charter Rule 4(b) - Municipal Drinking Water Main Repairs within 48 hours', 'user-department-murugan', 'DEPARTMENT_HANDLER'),
('dl-003', 'comp-003', '2026-10-08', '2026-10-16', 'ESTIMATED_TARGET', 'Underground Drainage & Sewerage Division', 'Target revised following extension request due to specialized pre-cast manhole cover procurement delay', 'user-councillor-subramanian', 'WARD_COUNCILLOR'),
('dl-005', 'comp-005', '2026-10-09', '2026-10-09', 'DEPARTMENT_PROVIDED_TARGET', 'Electrical Maintenance Department', 'Contractor Work Order #EL-45-779 issued by Electrical Engineer', 'user-councillor-meenakshi', 'WARD_COUNCILLOR')
ON DUPLICATE KEY UPDATE current_target_date=current_target_date;

-- 12. Insert Status History
INSERT INTO complaint_status_history (id, complaint_id, previous_status, new_status, actor_id, actor_role, actor_name, reason, update_source) VALUES
('sh-001', 'comp-001', 'Submitted', 'Acknowledged', 'user-councillor-senthil', 'WARD_COUNCILLOR', 'Councillor M. Senthil Nathan', 'Inspected site during morning ward inspection; escalated to Sanitary Inspector for dumper deployment.', 'COUNCILLOR'),
('sh-002', 'comp-001', 'Acknowledged', 'In Progress', 'user-councillor-senthil', 'WARD_COUNCILLOR', 'Councillor M. Senthil Nathan', 'Sanitary team with bobcat loader deployed for complete site clearance.', 'COUNCILLOR'),
('sh-003', 'comp-002', 'Submitted', 'Under Review', 'user-department-murugan', 'DEPARTMENT_HANDLER', 'Er. K. Murugan', 'Emergency valve isolated to stop wastage; welding team dispatched with 150mm ductile iron sleeve.', 'DEPARTMENT_OFFICER'),
('sh-004', 'comp-002', 'Under Review', 'In Progress', 'user-department-murugan', 'DEPARTMENT_HANDLER', 'Er. K. Murugan', 'Excavation completed and replacement pipe joint installation underway.', 'DEPARTMENT_OFFICER'),
('sh-005', 'comp-002', 'In Progress', 'Resolution Proposed', 'user-department-murugan', 'DEPARTMENT_HANDLER', 'Er. K. Murugan', 'Pipeline successfully sleeved, pressure tested up to 3.5 bar, and asphalt patch backfilled.', 'DEPARTMENT_OFFICER'),
('sh-006', 'comp-005', 'Submitted', 'In Progress', 'user-councillor-meenakshi', 'WARD_COUNCILLOR', 'Councillor R. Meenakshi', 'Hydraulic bucket truck dispatched for replacement LED fitting installation.', 'COUNCILLOR'),
('sh-007', 'comp-005', 'In Progress', 'Resolved', 'user-councillor-meenakshi', 'WARD_COUNCILLOR', 'Councillor R. Meenakshi', '70W LED fixture replaced and tested; citizen confirmed night illumination is restored.', 'COUNCILLOR')
ON DUPLICATE KEY UPDATE new_status=new_status;

-- 13. Insert Resolution Evidence
INSERT INTO complaint_resolution_evidence (id, complaint_id, submitted_by_user_id, submitted_by_role, submitted_by_name, completion_date, description, evidence_image_url, source_of_resolution, is_disputed) VALUES
('re-002', 'comp-002', 'user-department-murugan', 'DEPARTMENT_HANDLER', 'Er. K. Murugan', '2026-10-10', '150mm ductile iron pipe joint replaced with high-grade flanged collar. Clean pressure reading verified at 3.5 bar without leaks. Trench compacted with wet gravel mix.', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80', 'Field Completion Inspection by Assistant Executive Engineer', FALSE),
('re-005', 'comp-005', 'user-councillor-meenakshi', 'WARD_COUNCILLOR', 'Councillor R. Meenakshi', '2026-10-09', 'Old rusted bracket dismantled and new Philips 70W warm-white LED luminaire mounted and wired to timer circuit.', 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80', 'Electrical Contractor Job Card #4592 signed by Field Wireman', FALSE)
ON DUPLICATE KEY UPDATE description=description;

-- 14. Insert Supports
INSERT INTO complaint_supports (id, complaint_id, user_id, ward_id) VALUES
('sup-01', 'comp-001', 'user-citizen-karthik', 'ward-43-thoothukudi'),
('sup-02', 'comp-002', 'user-citizen-karthik', 'ward-43-thoothukudi'),
('sup-03', 'comp-005', 'user-citizen-priya', 'ward-45-thoothukudi')
ON DUPLICATE KEY UPDATE ward_id=ward_id;

-- 15. Insert Comments
INSERT INTO complaint_comments (id, complaint_id, user_id, ward_id, comment_text, is_official) VALUES
('comm-01', 'comp-001', 'user-citizen-karthik', 'ward-43-thoothukudi', 'The stench is reaching inside classrooms during afternoon hours. Please expedite cleaning before Monday.', FALSE),
('comm-02', 'comp-001', 'user-councillor-senthil', 'ward-43-thoothukudi', 'Spoke to Sanitary Inspector Thiru Balan. A compactor truck has been allocated for early morning sweep at 6:30 AM.', TRUE),
('comm-03', 'comp-002', 'user-citizen-anand', 'ward-43-thoothukudi', 'Water supply to odd-numbered houses on 3rd street was disrupted since yesterday morning.', FALSE),
('comm-04', 'comp-002', 'user-department-murugan', 'ward-43-thoothukudi', 'Pipeline isolated at Valve #4. Main pressure restoration anticipated by 4:00 PM today.', TRUE)
ON DUPLICATE KEY UPDATE comment_text=comment_text;

-- 16. Insert Official Escalation Directory Contacts
INSERT INTO official_escalation_contacts (id, portal_name, authority_level, district_id, department_name, helpline_number, website_url, escalation_instructions, last_verified_date) VALUES
('oec-01', 'Tamil Nadu Chief Minister Helpline (Mudalvarin Mugavari)', 'STATE_LEVEL', NULL, 'Public Grievance Redressal Dept', '1100 (Toll Free)', 'https://cmhelpline.tnega.org', 'Use CM Helpline if ward-level or municipal body issues remain unresolved beyond the designated citizen charter SLA or after formal appeal.', '2026-09-15'),
('oec-02', 'Thoothukudi City Corporation 24x7 Control Room', 'MUNICIPAL_CORPORATION', 'dist-thoothukudi', 'Corporation General Grievances', '0461-2326901 / 1800-425-4244', 'https://thoothukudicorporation.tn.gov.in', 'Direct corporation grievance line for urgent civic failures, uncollected waste dumps, and water supply ruptures across Wards 1 to 60.', '2026-09-20'),
('oec-03', 'Tirunelveli Corporation Citizen WhatsApp Service', 'MUNICIPAL_CORPORATION', 'dist-tirunelveli', 'Municipal Administration', '94437-01234', 'https://tirunelvelicorporation.tn.gov.in', 'Send photo, location coordinates, and description for automated token generation with the Commissioner office.', '2026-08-30'),
('oec-04', 'TANGEDCO (Electricity Board) Minnagam Central Control', 'DEPARTMENTAL_DIRECTORATE', NULL, 'Tamil Nadu Generation and Distribution Corp', '94987 94987', 'https://www.tangedco.gov.in', 'Report sparking transformers, sagging high-tension conductors, power outages, and broken utility poles 24x7.', '2026-10-01'),
('oec-05', 'TWAD Board Drinking Water Emergency Helpline', 'DEPARTMENTAL_DIRECTORATE', NULL, 'Tamil Nadu Water Supply & Drainage Board', '1916 / 044-28524907', 'https://www.twadboard.tn.gov.in', 'Escalate bulk water transmission breakdowns, regional water scheme pump failures, and canal water supply issues.', '2026-09-10')
ON DUPLICATE KEY UPDATE helpline_number=helpline_number;

-- 17. Insert Confidential Accountability Seed Case
INSERT INTO confidential_accountability_reports (id, case_reference_id, reporter_user_id, complaint_id, complaint_reference_id, reported_councillor_user_id, reported_ward_id, concern_type, description, timeline_dates_text, follow_up_attempts_text, expected_action_and_outcome, status, is_anonymity_requested) VALUES
('acc-001', 'ACC-2026-00012', 'user-citizen-anand', 'comp-003', 'CIV-2026-00045', 'user-councillor-subramanian', 'ward-12-tirunelveli', 'FALSE_CLAIM_OF_RESOLUTION', 'Public grievance for open stormwater catch basin was marked as completed in the internal register despite open pit continuing to endanger evening traffic without barricade.', 'Reported on Sept 28; marked closed on Oct 2; photo taken Oct 4 shows open hole', 'Attempted 3 phone calls to ward office; no response given', 'Independent field inspection by District Oversight Board and penalization of false sign-off', 'Under Review', TRUE)
ON DUPLICATE KEY UPDATE status=status;

INSERT INTO accountability_review_assignments (id, report_id, reviewer_user_id, assigned_by_user_id) VALUES
('ara-001', 'acc-001', 'user-reviewer-kalyani', 'user-admin-ramanathan')
ON DUPLICATE KEY UPDATE reviewer_user_id=reviewer_user_id;

INSERT INTO accountability_case_history (id, report_id, actor_id, actor_role, action_type, findings_or_notes, referred_to_authority) VALUES
('ach-001', 'acc-001', 'user-citizen-anand', 'CITIZEN', 'SUBMISSION', 'Confidential report submitted with time-stamped geotagged photograph showing unaddressed hazard.', NULL),
('ach-002', 'acc-001', 'user-admin-ramanathan', 'ADMIN', 'ASSIGNMENT', 'Case routed to Independent Accountability Reviewer Smt. V. Kalyani. Reported councillor barred from access.', NULL),
('ach-003', 'acc-001', 'user-reviewer-kalyani', 'ACCOUNTABILITY_REVIEWER', 'FINDING_RECORDED', 'Preliminary review indicates contractor submitted closure without field inspection photo. Notice served to Tirunelveli Engineering Cell.', 'Directorate of Municipal Administration, Chennai')
ON DUPLICATE KEY UPDATE action_type=action_type;

-- 18. Insert Ward Community Announcements & Live Messages
INSERT INTO ward_groups (id, ward_id, title, rules_notice) VALUES
('wg-43', 'ward-43-thoothukudi', 'Ward 43 Citizen Community Forum', 'Civic discussions only. Be respectful. No political campaigning or spam.')
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO ward_announcements (id, ward_id, author_user_id, title, content, priority) VALUES
('wa-01', 'ward-43-thoothukudi', 'user-councillor-senthil', 'Pre-Monsoon Storm Water Drain De-silting Schedule for Ward 43', 'De-silting work along Millerpuram Main Road and Bryant Nagar drains commences this Thursday. Residents are requested not to park vehicles over storm culverts between 7:00 AM and 1:00 PM.', 'IMPORTANT'),
('wa-02', 'ward-43-thoothukudi', 'user-councillor-senthil', 'Source Segregation of Solid Waste: New Green & Blue Bins Distribution', 'Corporation conservancy staff will distribute paired household waste bins this Saturday at the Ward 43 Sub-Office from 9:00 AM to 5:00 PM.', 'NORMAL')
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO messages (id, ward_id, sender_user_id, sender_name, sender_role, message_text, complaint_ref_link) VALUES
('msg-01', 'ward-43-thoothukudi', 'user-councillor-senthil', 'Councillor M. Senthil Nathan', 'WARD_COUNCILLOR', 'Vanakkam ward residents. Please report any drainage leaks or clogged culverts early before monsoon rains.', NULL),
('msg-02', 'ward-43-thoothukudi', 'user-citizen-anand', 'Anand Kumar', 'CITIZEN', 'Thank you Councillor. We have submitted complaint CIV-2026-00043 regarding waste dumping opposite Millerpuram school.', 'CIV-2026-00043'),
('msg-03', 'ward-43-thoothukudi', 'user-councillor-senthil', 'Councillor M. Senthil Nathan', 'WARD_COUNCILLOR', 'Noted Anand. Bobcat excavator is scheduled for 6:30 AM tomorrow morning.', 'CIV-2026-00043'),
('msg-04', 'ward-43-thoothukudi', 'user-citizen-karthik', 'Karthik Selvam', 'CITIZEN', 'Can we also get mosquito fogging done in Bryant Nagar 4th and 5th streets this week?', NULL)
ON DUPLICATE KEY UPDATE message_text=message_text;

-- 19. Insert Notifications
INSERT INTO notifications (id, user_id, title, message, type, related_entity_type, related_entity_id, is_read) VALUES
('notif-01', 'user-citizen-anand', 'Resolution Proposed for CIV-2026-00044', 'Water Works department has proposed resolution for your drinking water pipeline issue. Please inspect and confirm or dispute.', 'RESOLUTION_PROPOSED', 'COMPLAINT', 'comp-002', FALSE),
('notif-02', 'user-citizen-anand', 'Deadline Assigned to CIV-2026-00043', 'Resolution target date 14 Oct 2026 committed by Solid Waste Management department.', 'DEADLINE_SET', 'COMPLAINT', 'comp-001', TRUE),
('notif-03', 'user-councillor-senthil', 'New Complaint Reported in Ward 43', 'Citizen Anand Kumar submitted CIV-2026-00043: Garbage dumping near Millerpuram school.', 'STATUS_CHANGED', 'COMPLAINT', 'comp-001', TRUE)
ON DUPLICATE KEY UPDATE title=title;
