const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_5YVfTtHWQgE7@ep-icy-firefly-apke13ta-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

const BENEFITS = `Competitive salary based on experience and location
Medical insurance
International career development and training
Relocation or accommodation support for selected assignments
Annual leave and performance-based incentives
Visa sponsorship where applicable`;

const jobs = [
  // LEGAL & COMPLIANCE
  { jobId:"MTC-JOB-2026-0001", title:"Group Legal Counsel", dept:"Legal & Compliance", division:"Legal & Compliance", location:"Washington DC, USA", country:"USA", type:"Full-time", level:"Executive", workMode:"Hybrid",
    description:"Lead all legal affairs of MTC Group of Companies across international jurisdictions. Provide strategic legal counsel to the Board and executive leadership on corporate, commercial, regulatory and compliance matters.",
    responsibilities:`Advise senior management on all legal, regulatory and contractual matters\nDraft, review and negotiate complex commercial contracts and joint venture agreements\nOversee litigation strategy and manage external legal counsel\nEnsure group-wide compliance with local and international laws\nLead corporate governance and board secretariat functions\nManage intellectual property, real estate and M&A legal due diligence`,
    requirements:`LLB or LLM from a recognised university\nMinimum 12 years post-call experience in corporate, commercial or international law\nAdmission to the Bar in at least one jurisdiction (Nigeria, USA, UK or relevant)\nProven experience in energy, infrastructure or multinational corporate law\nStrong drafting, negotiation and communication skills` },

  { jobId:"MTC-JOB-2026-0002", title:"Legal Officer", dept:"Legal & Compliance", division:"Legal & Compliance", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Support the Group Legal Counsel in managing day-to-day legal operations, contract management, regulatory filings and compliance monitoring across MTC Group entities.",
    responsibilities:`Draft and review commercial contracts, MoUs and service agreements\nConduct legal research on Nigerian and international regulatory requirements\nMaintain the company's legal register and contract database\nAssist with litigation management and court documentation\nSupport regulatory filings with CAC, SEC and other agencies`,
    requirements:`LLB and BL (Call to the Nigerian Bar)\nMinimum 3 years post-call experience in commercial, corporate or energy law\nStrong knowledge of Nigerian company law, CAMA 2020 and regulatory frameworks\nExcellent drafting and analytical skills` },

  // HSE
  { jobId:"MTC-JOB-2026-0003", title:"Senior HSE Director", dept:"HSE", division:"HSE", location:"London, UK", country:"UK", type:"Full-time", level:"Senior", workMode:"Hybrid",
    description:"Provide strategic leadership for Health, Safety and Environment programmes across all MTC Group operations globally. Champion a zero-incident safety culture and ensure compliance with international HSE standards.",
    responsibilities:`Develop and implement group-wide HSE strategy, policies and management systems\nLead HSE audits, risk assessments and incident investigations\nEnsure compliance with ISO 14001, ISO 45001, OHSAS 18001 and industry standards\nReport to Board on HSE performance metrics and improvement plans\nManage HSE teams across multiple jurisdictions`,
    requirements:`Degree in Engineering, Environmental Science or related field\nNEBOSH International Diploma or equivalent\nMinimum 15 years HSE experience, 5 years at director level\nExperience in oil & gas, refinery or offshore operations\nISO 14001 and ISO 45001 Lead Auditor certification` },

  { jobId:"MTC-JOB-2026-0004", title:"HSE Officer", dept:"HSE", division:"HSE", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Implement and monitor HSE policies, procedures and programmes at MTC Group operational sites to ensure regulatory compliance and a safe working environment.",
    responsibilities:`Conduct daily site HSE inspections and toolbox talks\nInvestigate incidents, near-misses and compile HSE reports\nMaintain HSE documentation, permits to work and emergency response plans\nDeliver HSE induction and training programmes to staff and contractors\nEnsure compliance with DPR, NOSDRA and international HSE regulations`,
    requirements:`Degree or HND in Engineering, Environmental Science or related field\nNEBOSH International General Certificate or equivalent\nMinimum 4 years HSE experience in oil & gas or industrial operations\nIOSH Managing Safely certificate\nKnowledge of Nigerian HSE regulations and DPR requirements` },

  // PETROLEUM & PROCESS ENGINEERING
  { jobId:"MTC-JOB-2026-0005", title:"Petroleum Engineer", dept:"Oil & Gas", division:"Oil & Gas", location:"Doha, Qatar", country:"Qatar", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Lead reservoir evaluation, well planning, production optimisation and reserves management for MTC Group upstream oil and gas assets across the Middle East region.",
    responsibilities:`Design and optimise well completion programmes and production strategies\nConduct reservoir simulation and reserves estimation (SPE-PRMS standards)\nAnalyse production data and recommend EOR and IOR techniques\nPrepare field development plans and liaise with government regulatory bodies\nSupervise drilling operations and evaluate well test results`,
    requirements:`BSc in Petroleum Engineering or related field\nMinimum 8 years experience in upstream oil and gas operations\nProficiency in reservoir simulation software (Eclipse, CMG)\nSPE membership and knowledge of PRMS reserves classification\nIWCF or IADC Well Control certification preferred` },

  { jobId:"MTC-JOB-2026-0006", title:"Process Engineer", dept:"Refinery Operations", division:"Refinery Operations", location:"Riyadh, Saudi Arabia", country:"Saudi Arabia", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Optimise refinery process operations, troubleshoot process upsets and lead process safety and efficiency improvement projects at MTC Group refinery facilities.",
    responsibilities:`Monitor and optimise refinery process unit performance (CDU, VDU, FCC, HDS)\nDevelop process flow diagrams, heat and mass balances and PFDs\nConduct HAZOP studies and process safety reviews\nLead debottlenecking studies and capacity improvement projects\nPrepare technical reports for management and regulatory submission`,
    requirements:`BEng or BSc in Chemical or Process Engineering\nMinimum 7 years experience in refinery or petrochemical operations\nProficiency in Aspen HYSYS or PROII simulation software\nKnowledge of API, ASME and international refinery standards\nProcess Safety Management (PSM) experience preferred` },

  { jobId:"MTC-JOB-2026-0007", title:"Mechanical Engineer", dept:"Engineering", division:"Engineering", location:"Cairo, Egypt", country:"Egypt", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide mechanical engineering support for MTC Group facility operations, maintenance programmes and capital project execution.",
    responsibilities:`Design and review mechanical systems including piping, pressure vessels and rotating equipment\nDevelop and implement planned maintenance programmes (PM/PdM)\nConduct mechanical integrity inspections and fitness-for-service assessments\nSupport procurement of mechanical equipment and review vendor documentation\nLead root cause analysis for mechanical failures`,
    requirements:`BEng in Mechanical Engineering\nMinimum 5 years experience in oil & gas, refinery or industrial facilities\nKnowledge of API 510, API 570, ASME B31.3 codes\nExperience with CMMS (SAP PM or Maximo)\nProfessional engineering registration preferred` },

  { jobId:"MTC-JOB-2026-0008", title:"Electrical Engineer", dept:"Engineering", division:"Engineering", location:"Amsterdam, Netherlands", country:"Netherlands", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Design, install, test and maintain electrical systems for MTC Group industrial facilities and offshore platforms.",
    responsibilities:`Design electrical power distribution systems, motor control centres and instrumentation\nPrepare electrical design documents including SLDs, cable schedules and equipment layouts\nConduct arc flash analysis, load flow and short circuit studies\nOversee electrical maintenance and testing programmes\nEnsure compliance with IEC, IEEE and local electrical codes`,
    requirements:`BEng in Electrical Engineering\nMinimum 5 years experience in industrial or offshore electrical systems\nKnowledge of IEC 60079 (hazardous area classification)\nProficiency in ETAP or SKM Power Tools\nCertified Electrical Inspector or equivalent preferred` },

  { jobId:"MTC-JOB-2026-0009", title:"Instrumentation Engineer", dept:"Engineering", division:"Engineering", location:"Manama, Bahrain", country:"Bahrain", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Design, commission and maintain instrumentation and control systems for MTC Group refinery and processing facilities.",
    responsibilities:`Design and configure DCS, PLC and SCADA systems\nPrepare instrument datasheets, loop diagrams and instrument indexes\nConduct SIL assessments and safety instrumented system (SIS) design\nOversee field instrumentation calibration and maintenance\nSupport FAT, SAT and commissioning activities`,
    requirements:`BEng in Instrumentation, Control or Electrical Engineering\nMinimum 5 years experience in oil & gas or petrochemical instrumentation\nKnowledge of ISA standards, IEC 61511 and functional safety\nExperience with Honeywell, Yokogawa or ABB DCS systems\nFunctional Safety Engineer (TÜV) certification preferred` },

  { jobId:"MTC-JOB-2026-0010", title:"Pipeline Engineer", dept:"Oil & Gas", division:"Oil & Gas", location:"Muscat, Oman", country:"Oman", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Lead the engineering design, integrity management and operations support for MTC Group oil and gas pipeline systems.",
    responsibilities:`Design pipeline systems including route selection, hydraulic modelling and wall thickness calculations\nDevelop pipeline integrity management programmes (ILI, CP, corrosion monitoring)\nConduct risk assessments using ASME B31.8S and DNV standards\nOversee pipeline construction, hydrotesting and commissioning\nPrepare pipeline management plans and regulatory submissions`,
    requirements:`BEng in Mechanical, Civil or Pipeline Engineering\nMinimum 8 years pipeline engineering experience\nKnowledge of ASME B31.4, B31.8 and API 1160\nExperience with pipeline simulation software (OLGA, SPS)\nILI data analysis experience preferred` },

  { jobId:"MTC-JOB-2026-0011", title:"Corrosion Engineer", dept:"Engineering", division:"Engineering", location:"Helsinki, Finland", country:"Finland", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Develop and implement corrosion management strategies to protect MTC Group assets and extend equipment service life across oil, gas and marine operations.",
    responsibilities:`Conduct corrosion risk assessments and develop corrosion management plans\nSelect and specify corrosion inhibitors, coatings and cathodic protection systems\nInspect and monitor asset integrity using NDT techniques (UT, RT, MFL)\nAnalyse corrosion failures and prepare fitness-for-service reports\nMaintain corrosion monitoring databases and KPI reporting`,
    requirements:`BEng in Metallurgy, Materials Science, Chemical or Mechanical Engineering\nMinimum 6 years corrosion engineering experience in oil & gas\nNACE CP Technologist or Corrosion Technologist certification\nKnowledge of API 570, API 571 and NACE SP0169\nNDT Level II certification (UT or RT) preferred` },

  // PROCUREMENT & SUPPLY CHAIN
  { jobId:"MTC-JOB-2026-0012", title:"Procurement Specialist", dept:"Procurement", division:"Procurement", location:"London, UK", country:"UK", type:"Full-time", level:"Mid-level", workMode:"Hybrid",
    description:"Manage the sourcing and procurement of goods, services and equipment for MTC Group operations globally, ensuring cost efficiency, quality and timely delivery.",
    responsibilities:`Develop and execute procurement strategies for capex and opex categories\nIssue RFQs, evaluate bids and negotiate contracts with suppliers\nManage supplier relationships and conduct vendor performance reviews\nEnsure compliance with procurement policies and ethical sourcing standards\nCoordinate with logistics and operations teams for timely delivery`,
    requirements:`Degree in Supply Chain, Business Administration or Engineering\nMinimum 5 years procurement experience in oil & gas or industrial sectors\nCIPS Level 4 or equivalent professional qualification preferred\nExperience with SAP MM or Oracle procurement modules\nStrong negotiation and contract management skills` },

  { jobId:"MTC-JOB-2026-0013", title:"Contracts Administrator", dept:"Procurement", division:"Procurement", location:"Doha, Qatar", country:"Qatar", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Administer and manage contracts for MTC Group projects and operations, ensuring compliance with contractual obligations and effective resolution of commercial issues.",
    responsibilities:`Draft, review and administer contracts (FIDIC, NEC, LOGIC, bespoke forms)\nMonitor contractor performance against KPIs and SLAs\nProcess contract variations, claims and extension of time requests\nMaintain contract registers and ensure all obligations are tracked\nCoordinate contract close-out and final account settlement`,
    requirements:`Degree in Quantity Surveying, Law, Engineering or Business\nMinimum 5 years contracts administration experience in oil & gas or construction\nKnowledge of FIDIC, NEC or LOGIC contract forms\nCIOB or RICS membership preferred\nProficiency in contract management software` },

  { jobId:"MTC-JOB-2026-0014", title:"Logistics Coordinator", dept:"Procurement", division:"Logistics", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Coordinate the movement of goods, equipment and materials for MTC Group operations, managing freight forwarding, customs clearance and last-mile delivery.",
    responsibilities:`Coordinate import and export of goods including customs documentation and clearing\nManage relationships with freight forwarders, shipping agents and customs brokers\nTrack shipments and proactively resolve delivery delays or discrepancies\nMaintain logistics KPIs and prepare management reports\nEnsure compliance with SON, NAFDAC, NCS and DPR import regulations`,
    requirements:`Degree or HND in Logistics, Supply Chain or Business Administration\nMinimum 4 years logistics or freight forwarding experience in Nigeria\nStrong knowledge of Nigerian import/export regulations and HS codes\nExperience with freight management systems\nCILT or equivalent professional qualification preferred` },

  { jobId:"MTC-JOB-2026-0015", title:"Supply Chain Officer", dept:"Procurement", division:"Procurement", location:"Cairo, Egypt", country:"Egypt", type:"Full-time", level:"Junior", workMode:"On-site",
    description:"Support supply chain operations for MTC Group facilities, coordinating with suppliers, stores and operations to ensure material availability and inventory accuracy.",
    responsibilities:`Process purchase requisitions and purchase orders in ERP system\nMonitor stock levels and coordinate replenishment with approved vendors\nConduct stock reconciliations and cycle count inventories\nLiaise with customs agents for import clearance\nMaintain supplier database and procurement records`,
    requirements:`Degree or HND in Supply Chain, Business or Engineering\nMinimum 2 years supply chain or procurement experience\nBasic knowledge of ERP systems (SAP or Oracle)\nStrong organisational and communication skills` },

  { jobId:"MTC-JOB-2026-0016", title:"Document Controller", dept:"Operations", division:"Operations", location:"Riyadh, Saudi Arabia", country:"Saudi Arabia", type:"Full-time", level:"Junior", workMode:"On-site",
    description:"Manage and control technical and commercial documentation for MTC Group projects and operations, ensuring version control, distribution and secure archiving.",
    responsibilities:`Maintain document management systems (DMS) for projects and operations\nControl document numbering, revisions and distribution matrices\nReceive, log, transmit and archive all project and operational documents\nLiaise with engineering, procurement and construction teams on document requirements\nPrepare document status reports and follow up on outstanding deliverables`,
    requirements:`Diploma or Degree in Information Management, Engineering or Business\nMinimum 3 years document control experience in oil & gas or construction\nProficiency in Aconex, SharePoint, or ProjectWise document management systems\nKnowledge of ISO 9001 document control requirements\nStrong attention to detail and organisational skills` },

  // OPERATIONS
  { jobId:"MTC-JOB-2026-0017", title:"Operations Supervisor", dept:"Operations", division:"Operations", location:"Manama, Bahrain", country:"Bahrain", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Supervise day-to-day operations at MTC Group processing and storage facilities, ensuring safe, efficient and compliant operations within defined production targets.",
    responsibilities:`Supervise shift operations teams ensuring safe execution of all activities\nMonitor plant parameters and take corrective action on process deviations\nConduct daily operations meetings, shift handovers and safety briefings\nEnsure all permits to work are properly issued and closed\nPrepare daily operations reports and KPI tracking`,
    requirements:`Degree or HND in Engineering or equivalent operational qualification\nMinimum 7 years operations experience in refinery, terminal or processing facility\nSupervisory experience managing multi-discipline operations teams\nKnowledge of permit-to-work systems and operational risk management\nHSE certification (NEBOSH or equivalent)` },

  { jobId:"MTC-JOB-2026-0018", title:"Refinery Technician", dept:"Refinery Operations", division:"Refinery Operations", location:"Port Harcourt, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Operate and maintain refinery process units and equipment at MTC Group refinery facilities, ensuring safe, efficient and on-spec production.",
    responsibilities:`Operate process units (CDU, VDU, utilities) in accordance with operating procedures\nPerform routine equipment checks, readings and operator rounds\nAssist with planned maintenance shutdowns and turnarounds\nRespond to process alarms and emergency situations\nComplete shift logs, work orders and operational records`,
    requirements:`OND, HND or BSc in Chemical, Petroleum or Mechanical Engineering\nMinimum 4 years experience as a process operator in a refinery or petrochemical plant\nKnowledge of refinery process operations and safety systems\nHSE training and permit-to-work experience\nOPITO BOSIET or equivalent safety certification preferred` },

  { jobId:"MTC-JOB-2026-0019", title:"Laboratory Analyst", dept:"Refinery Operations", division:"Refinery Operations", location:"Port Harcourt, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Conduct quality control testing of crude oil, refined products and process streams to ensure product specifications and regulatory compliance at MTC Group refinery.",
    responsibilities:`Perform physical and chemical testing of crude oil, petroleum products and process samples\nOperate and maintain laboratory instruments including GC, HPLC and spectrophotometers\nPrepare laboratory reports and certificates of analysis\nEnsure compliance with ASTM, IP and ISO test methods\nMaintain laboratory safety standards and equipment calibration records`,
    requirements:`BSc or HND in Chemistry, Biochemistry or Chemical Engineering\nMinimum 4 years laboratory experience in petroleum, petrochemical or refinery environment\nProficiency in ASTM and IP standard test methods\nExperience with gas chromatography and petroleum product testing\nNABL or ISO 17025 quality system experience preferred` },

  // MARINE & OFFSHORE
  { jobId:"MTC-JOB-2026-0020", title:"Marine Engineer", dept:"Offshore Marine", division:"Offshore Marine", location:"Rotterdam, Netherlands", country:"Netherlands", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Manage the engineering operations, maintenance and certification of MTC Group marine vessels and offshore floating assets.",
    responsibilities:`Oversee engine room operations, maintenance and machinery management\nEnsure compliance with SOLAS, MARPOL, MLC 2006 and flag state requirements\nManage classification society surveys, dry-docking and vessel certification\nLead engineering department personnel and coordinate with vessel management company\nPrepare engineering budgets, maintenance plans and technical reports`,
    requirements:`Class 2 or Class 1 Marine Engineer Officer Certificate of Competency (STCW)\nMinimum 8 years sea-going experience as marine engineer, 3 years as Chief Engineer\nKnowledge of ISM Code, SOLAS and MARPOL regulations\nBSc in Marine Engineering or equivalent (preferred)\nSTCW certificates: STCW VI/1, VI/2, VI/3, VI/4` },

  { jobId:"MTC-JOB-2026-0021", title:"Vessel Superintendent", dept:"Offshore Marine", division:"Offshore Marine", location:"London, UK", country:"UK", type:"Full-time", level:"Senior", workMode:"Hybrid",
    description:"Oversee the technical and operational management of MTC Group vessels from onshore, ensuring safe operations, regulatory compliance and cost-effective maintenance.",
    responsibilities:`Provide technical oversight for assigned vessels including maintenance planning and dry-dock management\nReview and approve planned maintenance system (PMS) records and repair specifications\nConduct vessel inspections, vetting audits (SIRE, CDI) and flag state inspection support\nManage vessel operating budgets and technical procurement\nLiaise with port agents, charterers and flag state administrations`,
    requirements:`Class 1 Marine Engineer or Master Mariner Certificate of Competency\nMinimum 5 years onshore vessel superintendent experience\nKnowledge of ISM Code, OCIMF SIRE and CDI vetting requirements\nExperience with IACS classification society requirements\nSTCW III/2 or II/2 COC` },

  { jobId:"MTC-JOB-2026-0022", title:"Offshore HSE Officer", dept:"HSE", division:"Offshore Marine", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Implement and monitor HSE management systems on MTC Group offshore vessels and platforms, ensuring safe operations and compliance with international offshore safety standards.",
    responsibilities:`Conduct daily HSE inspections, safety observations and toolbox talks on offshore assets\nInvestigate accidents, incidents and near-misses and prepare reports\nDeliver HSE training including BOSIET, emergency response and PTW\nMaintain emergency response plans and conduct emergency drills\nEnsure compliance with OPITO, IADC and NUPRC offshore HSE requirements`,
    requirements:`BSc or HND in HSE, Engineering or related field\nNEBOSH International General Certificate or NEBOSH Oil & Gas Certificate\nMinimum 4 years offshore HSE experience\nBOSIET / HUET certification (valid)\nOPITO-approved qualifications preferred` },

  { jobId:"MTC-JOB-2026-0023", title:"Port Operations Coordinator", dept:"Offshore Marine", division:"Logistics", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Coordinate port operations, vessel berthing, cargo handling and documentation for MTC Group marine logistics activities.",
    responsibilities:`Coordinate vessel arrivals, departures, berthing and unberthing operations\nManage cargo loading, discharge and tallying operations\nPrepare port documentation including Bills of Lading, cargo manifests and customs declarations\nLiaise with NPA, NIMASA, customs and port agents\nMonitor port costs and prepare port disbursement accounts`,
    requirements:`Degree or HND in Maritime Studies, Logistics or Business Administration\nMinimum 4 years port operations experience in Nigeria\nKnowledge of NPA regulations, NIMASA requirements and Nigerian customs procedures\nFamiliarity with port management systems\nMembership of NIMASA or relevant maritime body preferred` },

  // HEALTHCARE
  { jobId:"MTC-JOB-2026-0024", title:"Hospital Operations Director", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Executive", workMode:"On-site",
    description:"Provide executive leadership for MTC Group healthcare facility operations, overseeing clinical services, administration, finance and regulatory compliance to deliver world-class patient care.",
    responsibilities:`Lead overall hospital operations including clinical, administrative and support services\nDevelop and implement hospital strategic plans, budgets and performance targets\nEnsure compliance with HEFAMAA, MDCN and JCI accreditation standards\nOversee patient safety, quality improvement and clinical governance programmes\nBuild and develop high-performing leadership teams across all hospital departments`,
    requirements:`MBBS or equivalent medical degree (preferred) or Masters in Healthcare Management/Hospital Administration\nMinimum 12 years healthcare management experience, 5 years at senior/executive level\nDemonstrated experience managing a multi-specialty hospital\nKnowledge of Nigerian healthcare regulations and HEFAMAA requirements\nFellow of the Nigerian Institute of Health Care Management or equivalent preferred` },

  { jobId:"MTC-JOB-2026-0025", title:"General Practitioner (GP)", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide primary healthcare services to patients at MTC Group healthcare facilities, delivering high-quality clinical assessment, diagnosis, treatment and health promotion.",
    responsibilities:`Conduct patient consultations, history taking, physical examination and clinical assessment\nDiagnose and treat a wide range of acute and chronic medical conditions\nOrder and interpret laboratory investigations, imaging and specialist referrals\nMaintain accurate electronic medical records\nParticipate in health education, immunisation and preventive care programmes`,
    requirements:`MBBS or MBBCh from a recognised medical school\nFull registration with the Medical and Dental Council of Nigeria (MDCN)\nMinimum 2 years post-internship clinical experience\nBasic Life Support (BLS) and ACLS certification\nFmCGP (Family Medicine) or NYSC discharge certificate` },

  { jobId:"MTC-JOB-2026-0026", title:"Internal Medicine Physician", dept:"Healthcare", division:"Healthcare", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Provide specialist internal medicine services, managing complex medical conditions and supporting clinical teaching at MTC Group healthcare facilities.",
    responsibilities:`Diagnose and manage complex adult medical conditions across subspecialties\nLead ward rounds and supervise junior medical officers and residents\nPerform and interpret diagnostic procedures relevant to internal medicine\nParticipate in multidisciplinary team meetings and case conferences\nContribute to clinical research and continuing medical education`,
    requirements:`MBBS plus Fellowship of WACP or equivalent postgraduate qualification\nFull MDCN registration with specialist recognition in Internal Medicine\nMinimum 5 years post-fellowship experience\nAtLS, ACLS certification\nSubspecialty interest in Cardiology, Endocrinology or Gastroenterology preferred` },

  { jobId:"MTC-JOB-2026-0027", title:"Cardiologist", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Provide specialist cardiology services including diagnostic, interventional and preventive cardiology at MTC Group hospital facilities.",
    responsibilities:`Manage patients with cardiac conditions including heart failure, arrhythmias, IHD and valvular disease\nPerform and interpret echocardiography, ECG, stress tests and Holter monitoring\nConduct cardiac catheterisation and percutaneous coronary interventions (where applicable)\nParticipate in MDT meetings, cardiac rehabilitation and clinical teaching\nDevelop and implement cardiology department protocols`,
    requirements:`MBBS plus Fellowship of the Nigerian Cardiac Society or WACP (Cardiology)\nFull MDCN registration with specialist recognition in Cardiology\nMinimum 5 years post-fellowship cardiology experience\nProficiency in echocardiography (TTE and TOE)\nAcLS and BLS certification` },

  { jobId:"MTC-JOB-2026-0028", title:"Neurologist", dept:"Healthcare", division:"Healthcare", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Provide specialist neurological services including diagnosis and management of neurological disorders at MTC Group medical facilities.",
    responsibilities:`Diagnose and manage neurological conditions including stroke, epilepsy, MS, Parkinson's and neuropathies\nInterpret EEG, EMG, nerve conduction studies and neuroimaging\nConduct and supervise lumbar puncture and other neurological procedures\nParticipate in stroke team and neurology MDT meetings\nProvide neurological consultations across hospital departments`,
    requirements:`MBBS plus Fellowship in Neurology (WACP, WANS or equivalent)\nFull MDCN registration with specialist recognition in Neurology\nMinimum 5 years post-fellowship experience\nExperience in stroke management and acute neurology\nACLS and BLS certification` },

  { jobId:"MTC-JOB-2026-0029", title:"Orthopedic Surgeon", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Perform surgical and non-surgical management of musculoskeletal conditions at MTC Group hospital facilities.",
    responsibilities:`Perform elective and emergency orthopedic surgical procedures\nManage fractures, joint replacements, sports injuries and spinal conditions\nConduct outpatient orthopedic clinics and post-operative review\nParticipate in on-call duties and trauma team activities\nSupervise and train junior surgical staff and residents`,
    requirements:`MBBS plus Fellowship of the West African College of Surgeons (FWACS) or FMCS in Orthopedics\nFull MDCN registration with surgical specialist recognition\nMinimum 5 years post-fellowship surgical experience\nAtLS certification\nExperience in arthroplasty and trauma surgery preferred` },

  { jobId:"MTC-JOB-2026-0030", title:"Radiologist", dept:"Healthcare", division:"Healthcare", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Provide diagnostic radiology reporting and interventional radiology services at MTC Group hospital and diagnostic imaging centres.",
    responsibilities:`Report plain radiographs, ultrasound, CT and MRI examinations\nPerform and supervise image-guided interventional procedures\nProvide radiology consultation and participate in MDT meetings\nQuality assure imaging protocols and radiation protection compliance\nSupervise and train radiography staff and junior radiologists`,
    requirements:`MBBS plus Fellowship in Radiology (FWAC Radiology or equivalent)\nFull MDCN registration with specialist recognition in Radiology\nMinimum 5 years post-fellowship experience\nProficiency in CT, MRI and ultrasound reporting\nInterventional radiology experience preferred` },

  { jobId:"MTC-JOB-2026-0031", title:"Registered Nurse", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide high-quality nursing care to patients across medical, surgical and specialty wards at MTC Group healthcare facilities.",
    responsibilities:`Assess patient health status and develop individualised nursing care plans\nAdminister medications, treatments and nursing procedures as prescribed\nMonitor patient vital signs and respond to clinical deterioration\nMaintain accurate nursing documentation and patient records\nProvide patient and family education and discharge planning`,
    requirements:`BSc Nursing or RN qualification from an accredited institution\nCurrent registration with the Nursing and Midwifery Council of Nigeria (NMCN)\nMinimum 3 years clinical nursing experience\nBLS certification\nPost-basic nursing qualification (preferred)` },

  { jobId:"MTC-JOB-2026-0032", title:"ICU Nurse", dept:"Healthcare", division:"Healthcare", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Deliver specialist critical care nursing to ICU patients at MTC Group hospital, managing complex, life-threatening conditions with precision and compassion.",
    responsibilities:`Provide intensive nursing care to critically ill patients on ventilators, inotropes and continuous monitoring\nAssess and respond to acute changes in patient condition\nAdminister vasoactive drugs, anticoagulants and complex IV therapies\nOperate and troubleshoot ICU equipment (ventilators, CRRT, haemofiltration)\nParticipate in ward rounds with ICU medical team and document care accurately`,
    requirements:`BSc Nursing plus post-basic Critical Care Nursing qualification\nCurrent NMCN registration\nMinimum 3 years ICU or critical care experience\nACLS, BLS and CCRN certification preferred\nVentilator management experience essential` },

  { jobId:"MTC-JOB-2026-0033", title:"Emergency Room Nurse", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide emergency nursing care to patients presenting with acute and life-threatening conditions at MTC Group emergency departments.",
    responsibilities:`Triage patients using Manchester Triage System or equivalent\nProvide emergency nursing care for trauma, cardiac, respiratory and medical emergencies\nAssist with resuscitation, procedures and emergency interventions\nMaintain accurate and timely emergency nursing documentation\nCollaborate with emergency physicians, paramedics and specialty teams`,
    requirements:`BSc Nursing plus post-basic Emergency Nursing qualification\nCurrent NMCN registration\nMinimum 3 years emergency or acute care nursing experience\nACLS, BLS and ATLS support certification\nTriage training and emergency nursing certification preferred` },

  { jobId:"MTC-JOB-2026-0034", title:"Pharmacist", dept:"Healthcare", division:"Healthcare", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide clinical and dispensing pharmacy services at MTC Group healthcare facilities, ensuring safe, effective and rational medicine use.",
    responsibilities:`Dispense and verify prescriptions accurately and counsel patients on medication use\nConduct clinical pharmacy reviews on hospital wards and outpatient clinics\nManage drug inventory, expiry monitoring and controlled drug records\nParticipate in antibiotic stewardship, pharmacovigilance and drug information activities\nEnsure compliance with NAFDAC and PCN regulations`,
    requirements:`BPharm or PharmD from an accredited institution\nCurrent registration with the Pharmacists Council of Nigeria (PCN)\nMinimum 3 years hospital pharmacy experience\nKnowledge of clinical pharmacology and drug interactions\nClinical pharmacy or hospital pharmacy training preferred` },

  { jobId:"MTC-JOB-2026-0035", title:"Medical Laboratory Scientist", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Perform clinical laboratory investigations and quality assurance activities at MTC Group hospital laboratory.",
    responsibilities:`Perform haematology, clinical chemistry, microbiology, immunology and blood bank tests\nOperate and maintain laboratory analysers and equipment\nEnsure quality control and participate in external quality assurance (EQA) programmes\nReport laboratory results accurately and within turnaround time targets\nComply with biosafety and infection control standards`,
    requirements:`BSc Medical Laboratory Science from an accredited institution\nCurrent registration with the Medical Laboratory Science Council of Nigeria (MLSCN)\nMinimum 3 years hospital laboratory experience\nKnowledge of ISO 15189 laboratory quality management\nExperience in phlebotomy and point-of-care testing` },

  { jobId:"MTC-JOB-2026-0036", title:"Physiotherapist", dept:"Healthcare", division:"Healthcare", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide physiotherapy assessment, rehabilitation and treatment services to patients across medical, surgical, orthopedic and neurological units at MTC Group hospital.",
    responsibilities:`Assess patients and develop individualised physiotherapy treatment plans\nProvide musculoskeletal, neurological and cardiorespiratory physiotherapy\nConduct pre and post-operative rehabilitation programmes\nDeliver physiotherapy in wards, outpatient clinics and ICU\nDocument treatment progress and participate in MDT case reviews`,
    requirements:`BSc Physiotherapy from an accredited institution\nCurrent registration with the Medical Rehabilitation Therapists Board of Nigeria (MRTBN)\nMinimum 3 years clinical physiotherapy experience\nBLS certification\nSpecialist qualification in musculoskeletal or neurological physiotherapy preferred` },

  { jobId:"MTC-JOB-2026-0037", title:"Dietitian / Nutritionist", dept:"Healthcare", division:"Healthcare", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide clinical nutrition assessment, dietary counselling and nutritional support services at MTC Group hospital.",
    responsibilities:`Conduct nutritional assessments and develop individualised nutrition care plans\nProvide medical nutrition therapy for diabetes, renal disease, oncology and surgical patients\nManage enteral and parenteral nutrition programmes\nDeliver nutrition education to patients, families and healthcare staff\nCollaborate with MDT on nutrition support for complex patients`,
    requirements:`BSc Human Nutrition and Dietetics or equivalent\nCurrent registration with the Dietitians Association of Nigeria or equivalent body\nMinimum 3 years clinical dietetics experience in a hospital setting\nKnowledge of medical nutrition therapy protocols\nEnteral and parenteral nutrition experience preferred` },

  { jobId:"MTC-JOB-2026-0038", title:"Medical Records Officer", dept:"Healthcare", division:"Healthcare", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Junior", workMode:"On-site",
    description:"Manage patient medical records and health information systems at MTC Group healthcare facilities to support clinical care and regulatory compliance.",
    responsibilities:`Maintain accurate and confidential patient medical records (paper and electronic)\nCode diagnoses and procedures using ICD-10 and CPT coding systems\nProcess records requests from clinicians, patients and insurance providers\nManage medical records release in compliance with patient confidentiality laws\nGenerate statistics and reports on patient activity for management and HEFAMAA`,
    requirements:`Diploma or BSc in Health Information Management or Medical Records\nCurrent registration with the Health Records Officers Registration Board of Nigeria (HRORBN)\nMinimum 2 years medical records experience in a hospital\nKnowledge of ICD-10 coding and electronic health records (EHR) systems\nStrong attention to detail and confidentiality` },

  // AGRICULTURE
  { jobId:"MTC-JOB-2026-0039", title:"Agribusiness Manager", dept:"Agriculture", division:"Operations", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Lead the commercial and operational management of MTC Group agribusiness portfolio, driving revenue growth and developing strategic partnerships in the agricultural value chain.",
    responsibilities:`Develop and implement agribusiness strategies, business development plans and commercial frameworks\nIdentify and develop market opportunities for agricultural produce export and domestic sales\nNegotiate offtake agreements, strategic partnerships and supply contracts\nOversee farm operations budget, P&L management and financial reporting\nBuild relationships with government agricultural agencies, development banks and investors`,
    requirements:`BSc or MSc in Agribusiness, Agricultural Economics or Agriculture\nMinimum 8 years agribusiness management experience\nProven track record in agricultural commodity trading or value chain development\nKnowledge of Nigerian agricultural policies, NIRSAL and CBN agricultural finance schemes\nExperience with export certification (NAQS, NAFDAC, NEPC)` },

  { jobId:"MTC-JOB-2026-0040", title:"Farm Manager", dept:"Agriculture", division:"Operations", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"On-site",
    description:"Manage day-to-day farm operations at MTC Group agricultural estates, overseeing crop production, livestock management, resource planning and team supervision.",
    responsibilities:`Plan, supervise and evaluate all crop and livestock production activities\nDevelop seasonal crop calendars, input procurement plans and irrigation schedules\nManage farm workers, contractors and seasonal labour\nMaintain farm records, production data and financial accounts\nImplement best agricultural practices and sustainability measures`,
    requirements:`BSc in Agriculture, Crop Science or Animal Science\nMinimum 7 years farm management experience (crop and/or livestock)\nKnowledge of modern farming techniques, drip irrigation and precision agriculture\nExperience with farm management software\nValid driver's licence and willingness to live on or near farm site` },

  { jobId:"MTC-JOB-2026-0041", title:"Agronomist", dept:"Agriculture", division:"Operations", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide agronomic expertise to optimise crop yield, soil health and production efficiency at MTC Group agricultural estates.",
    responsibilities:`Conduct soil testing, crop monitoring and agronomic assessments\nDevelop crop production programmes including planting schedules, fertiliser and pest management\nTrain farm workers on good agricultural practices (GAP)\nEvaluate and recommend improved crop varieties and inputs\nPrepare agronomic reports and yield forecasts for management`,
    requirements:`BSc in Agronomy, Crop Science or Agriculture\nMinimum 4 years practical agronomy experience\nKnowledge of soil science, crop nutrition and integrated pest management\nExperience with precision agriculture tools and soil testing\nMembership of the Agronomy Society of Nigeria preferred` },

  { jobId:"MTC-JOB-2026-0042", title:"Veterinary Doctor", dept:"Agriculture", division:"Operations", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Provide veterinary health services for livestock at MTC Group farms, managing animal health, disease prevention and productivity optimisation.",
    responsibilities:`Conduct regular veterinary inspections, health assessments and disease surveillance\nDiagnose and treat livestock diseases and injuries\nImplement vaccination programmes and disease prevention protocols\nOversee animal welfare standards and biosecurity measures\nMaintain veterinary records and prepare health reports`,
    requirements:`DVM or BVSc from an accredited veterinary school\nFull registration with the Veterinary Council of Nigeria (VCN)\nMinimum 4 years large animal or production animal experience\nKnowledge of NAFDAC veterinary drug regulations\nExperience in cattle, poultry or aquaculture health management preferred` },

  { jobId:"MTC-JOB-2026-0043", title:"Irrigation Specialist", dept:"Agriculture", division:"Engineering", location:"Abuja, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Design, install and manage irrigation systems at MTC Group farm estates to maximise water use efficiency and crop productivity.",
    responsibilities:`Design drip, sprinkler and surface irrigation systems for various crop types\nSupervise installation, commissioning and maintenance of irrigation infrastructure\nDevelop irrigation scheduling programmes based on crop water requirements and soil moisture data\nTrain farm staff on irrigation system operation and maintenance\nMonitor water usage, prepare irrigation reports and recommend improvements`,
    requirements:`BSc in Irrigation Engineering, Agricultural Engineering or Water Resources\nMinimum 5 years irrigation design and management experience\nProficiency in irrigation design software (NetiNET, Irricad or similar)\nKnowledge of FAO irrigation planning standards\nExperience with fertigation and precision irrigation systems preferred` },

  // FINANCE & AUDIT
  { jobId:"MTC-JOB-2026-0044", title:"Internal Auditor", dept:"Finance", division:"Corporate Finance", location:"London, UK", country:"UK", type:"Full-time", level:"Mid-level", workMode:"Hybrid",
    description:"Conduct independent internal audits of MTC Group financial, operational and compliance processes to provide assurance to management and the Board.",
    responsibilities:`Plan and execute risk-based internal audit assignments across MTC Group entities\nEvaluate internal controls, identify weaknesses and recommend improvements\nConduct fraud investigations and special reviews as directed by the Audit Committee\nPrepare clear, evidence-based audit reports with actionable recommendations\nFollow up on audit findings to ensure management actions are implemented`,
    requirements:`BSc in Accounting, Finance or Business\nACA, ACCA, CIA or CPA qualification\nMinimum 5 years internal audit experience in energy, financial services or multinational company\nKnowledge of IIA standards, COSO framework and risk-based auditing\nExperience with audit management software (TeamMate, ACL/Galvanize preferred)` },

  { jobId:"MTC-JOB-2026-0045", title:"Accountant", dept:"Finance", division:"Corporate Finance", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Manage financial accounting, reporting and compliance activities for MTC Group entities, ensuring accurate books of account and statutory filings.",
    responsibilities:`Prepare monthly management accounts, financial statements and budget variance reports\nManage accounts payable, accounts receivable and bank reconciliations\nEnsure timely filing of FIRS tax returns (VAT, CIT, WHT, PAYE)\nMaintain fixed asset register and depreciation schedules\nSupport external audit and statutory financial statement preparation`,
    requirements:`BSc in Accounting or Finance\nACA (ICAN) or ACCA qualification (or finalist)\nMinimum 4 years accounting experience\nProficiency in accounting software (Sage, QuickBooks or SAP)\nKnowledge of IFRS, Nigerian tax laws and FIRS requirements` },

  // HR
  { jobId:"MTC-JOB-2026-0046", title:"HR Manager", dept:"Human Resources", division:"Human Resources", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Senior", workMode:"Hybrid",
    description:"Lead the Human Resources function for MTC Group Nigeria operations, driving talent acquisition, performance management, employee relations and HR policy implementation.",
    responsibilities:`Develop and implement HR strategies aligned to MTC Group business objectives\nOversee end-to-end recruitment, onboarding and employee lifecycle management\nManage performance management systems, appraisals and succession planning\nEnsure compliance with Nigerian Labour Act, employee relations and disciplinary procedures\nAdminister payroll, benefits and compensation benchmarking`,
    requirements:`BSc or MSc in Human Resources, Business Administration or related field\nCIHR (CIPM) or CIPD Level 5 or equivalent qualification\nMinimum 8 years HR generalist experience in a multinational or large Nigerian organisation\nStrong knowledge of Nigerian Labour Act, PENCOM, ITF and NSITF regulations\nExperience with HRIS systems (SAP HR, Oracle HCM or equivalent)` },

  { jobId:"MTC-JOB-2026-0047", title:"Recruitment Specialist", dept:"Human Resources", division:"Human Resources", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Mid-level", workMode:"On-site",
    description:"Manage the full-cycle recruitment process for MTC Group, sourcing, screening and placing qualified candidates across technical, professional and executive roles globally.",
    responsibilities:`Partner with hiring managers to define job requirements and develop recruitment strategies\nSource candidates through LinkedIn, job boards, professional networks and headhunting\nConduct CV screening, telephone interviews and competency-based assessments\nManage the ATS system and maintain accurate recruitment records\nCoordinate offer management, reference checks and pre-employment screening`,
    requirements:`BSc in Human Resources, Business or related field\nCIPM or CIPD qualification preferred\nMinimum 4 years technical or specialist recruitment experience\nExperience recruiting for oil & gas, healthcare or engineering roles preferred\nProficiency with LinkedIn Recruiter and applicant tracking systems` },

  // IT
  { jobId:"MTC-JOB-2026-0048", title:"Cybersecurity Specialist", dept:"Information Technology", division:"Information Technology", location:"Washington DC, USA", country:"USA", type:"Full-time", level:"Senior", workMode:"Hybrid",
    description:"Lead cybersecurity operations, threat intelligence and security architecture for MTC Group IT and OT systems globally.",
    responsibilities:`Design and implement cybersecurity architecture, policies and controls across MTC Group\nManage SIEM platform, threat monitoring and incident response operations\nConduct vulnerability assessments, penetration testing and security audits\nDevelop and deliver cybersecurity awareness training\nEnsure compliance with NIST CSF, ISO 27001 and relevant sector regulations`,
    requirements:`BSc in Computer Science, Cybersecurity or Information Technology\nCISSP, CISM or CEH certification\nMinimum 7 years cybersecurity experience, including OT/ICS security in oil & gas\nExperience with SIEM tools (Splunk, Microsoft Sentinel or QRadar)\nKnowledge of NIST Cybersecurity Framework and ISO 27001` },

  { jobId:"MTC-JOB-2026-0049", title:"Data Analyst", dept:"Information Technology", division:"Information Technology", location:"London, UK", country:"UK", type:"Full-time", level:"Mid-level", workMode:"Hybrid",
    description:"Analyse business and operational data to generate actionable insights that support MTC Group management decisions across energy, healthcare and commercial operations.",
    responsibilities:`Collect, clean and analyse large datasets from operations, finance and commercial sources\nDevelop dashboards, reports and data visualisations using Power BI and Tableau\nBuild predictive models and perform statistical analysis to identify trends\nWork with IT and business teams to define data requirements and KPIs\nPrepare data-driven management reports and board presentations`,
    requirements:`BSc in Data Science, Statistics, Mathematics or Computer Science\nMinimum 4 years data analysis experience\nProficiency in SQL, Python or R for data manipulation and analysis\nExperience with Power BI, Tableau or Looker for data visualisation\nKnowledge of machine learning concepts preferred` },

  { jobId:"MTC-JOB-2026-0050", title:"IT Support Engineer", dept:"Information Technology", division:"Information Technology", location:"Lagos, Nigeria", country:"Nigeria", type:"Full-time", level:"Junior", workMode:"On-site",
    description:"Provide first and second line IT support to MTC Group staff across Lagos offices, managing hardware, software, network and telecoms infrastructure.",
    responsibilities:`Provide technical support to end users via helpdesk, phone and on-site visits\nInstall, configure and maintain desktops, laptops, printers and mobile devices\nManage user accounts, access permissions and Active Directory\nMonitor network infrastructure, troubleshoot connectivity issues and liaise with ISPs\nMaintain IT asset register and prepare monthly IT support reports`,
    requirements:`BSc or HND in Computer Science, IT or related field\nCompTIA A+, Network+ or Microsoft 365 certification\nMinimum 2 years IT support experience\nKnowledge of Windows Server, Active Directory and Office 365 administration\nExperience with ticketing systems (Freshdesk, Jira Service Desk or similar)` },
];

async function seed() {
  console.log(`Seeding ${jobs.length} jobs...`);
  let count = 0;

  for (const j of jobs) {
    try {
      await pool.query(
        `INSERT INTO job_postings 
          (job_id, title, department, division, location, country, type, level, work_mode, 
           description, responsibilities, requirements, benefits, status, published_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'published',NOW(),NOW(),NOW())
         ON CONFLICT (job_id) DO UPDATE SET
           title=EXCLUDED.title, department=EXCLUDED.department, division=EXCLUDED.division,
           location=EXCLUDED.location, country=EXCLUDED.country, type=EXCLUDED.type,
           level=EXCLUDED.level, work_mode=EXCLUDED.work_mode, description=EXCLUDED.description,
           responsibilities=EXCLUDED.responsibilities, requirements=EXCLUDED.requirements,
           benefits=EXCLUDED.benefits, status='published', published_at=NOW(), updated_at=NOW()`,
        [j.jobId, j.title, j.dept, j.division, j.location, j.country, j.type, j.level,
         j.workMode, j.description, j.responsibilities, j.requirements, BENEFITS]
      );
      console.log(`✓ ${j.jobId} — ${j.title}`);
      count++;
    } catch (e) {
      console.error(`✗ ${j.title}:`, e.message);
    }
  }

  console.log(`\n${count}/${jobs.length} jobs seeded successfully!`);
  await pool.end();
}

seed().catch(e => { console.error(e); pool.end(); });
