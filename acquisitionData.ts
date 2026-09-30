export type Stage = 'Proposal'|'Scrutiny'|'Approved'|'Notification'|'Award'|'Compensation'|'Possession'|'R&R'|'Completed';

export interface AcquisitionCase {
  id:string; project:string; ministry:string; state:string; district:string; villages:number;
  landRequired:number; landAcquired:number; parcels:number; notified:number; award:number;
  compensationAssessed:number; compensationPaid:number; affectedFamilies:number; displacedFamilies:number;
  rrProgress:number; possession:number; stage:Stage; status:'On Track'|'Delayed'|'Attention'; target:string;
}

export interface Parcel { id:string; caseId:string; village:string; tehsil:string; area:number; status:'Proposed'|'Notified'|'Awarded'|'Paid'|'Possession Pending'|'Possessed'; ownerRef:string; }

export const cases: AcquisitionCase[] = [
 {id:'LA-UP-2026-00124',project:'National Highway Expansion – Package IV',ministry:'Ministry of Road Transport & Highways',state:'Uttar Pradesh',district:'Lucknow',villages:12,landRequired:842,landAcquired:621,parcels:1284,notified:96,award:74,compensationAssessed:184.2,compensationPaid:151.8,affectedFamilies:1842,displacedFamilies:624,rrProgress:68,possession:74,stage:'Compensation',status:'Attention',target:'15 Nov 2026'},
 {id:'LA-RJ-2026-00087',project:'Renewable Energy Corridor – Phase II',ministry:'Ministry of New & Renewable Energy',state:'Rajasthan',district:'Jodhpur',villages:18,landRequired:1240,landAcquired:940,parcels:2190,notified:100,award:82,compensationAssessed:312.6,compensationPaid:284.1,affectedFamilies:2310,displacedFamilies:712,rrProgress:81,possession:66,stage:'Possession',status:'On Track',target:'28 Dec 2026'},
 {id:'LA-BR-2026-00141',project:'Eastern Freight Connectivity',ministry:'Ministry of Railways',state:'Bihar',district:'Patna',villages:26,landRequired:965,landAcquired:488,parcels:1724,notified:88,award:52,compensationAssessed:226.8,compensationPaid:108.4,affectedFamilies:2960,displacedFamilies:1088,rrProgress:42,possession:39,stage:'Award',status:'Delayed',target:'31 Oct 2026'},
 {id:'LA-TN-2026-00062',project:'Industrial Corridor Node – Phase I',ministry:'Department for Promotion of Industry & Internal Trade',state:'Tamil Nadu',district:'Chennai',villages:9,landRequired:510,landAcquired:456,parcels:842,notified:100,award:96,compensationAssessed:98.4,compensationPaid:94.7,affectedFamilies:768,displacedFamilies:188,rrProgress:91,possession:88,stage:'R&R',status:'On Track',target:'20 Oct 2026'},
 {id:'LA-MH-2026-00033',project:'Mumbai–Nagpur Logistics Link',ministry:'Ministry of Road Transport & Highways',state:'Maharashtra',district:'Nashik',villages:21,landRequired:733,landAcquired:517,parcels:1408,notified:92,award:69,compensationAssessed:207.2,compensationPaid:139.6,affectedFamilies:2014,displacedFamilies:805,rrProgress:57,possession:51,stage:'Compensation',status:'Attention',target:'05 Jan 2027'}
];

export const parcels: Parcel[] = [
 {id:'UP-LKO-000421',caseId:'LA-UP-2026-00124',village:'Kakori',tehsil:'Kakori',area:2.48,status:'Awarded',ownerRef:'AF-00128'},
 {id:'UP-LKO-000422',caseId:'LA-UP-2026-00124',village:'Kakori',tehsil:'Kakori',area:1.76,status:'Paid',ownerRef:'AF-00129'},
 {id:'UP-LKO-000423',caseId:'LA-UP-2026-00124',village:'Bani',tehsil:'Malihabad',area:3.12,status:'Possession Pending',ownerRef:'AF-00131'},
 {id:'RJ-JOD-000211',caseId:'LA-RJ-2026-00087',village:'Osian',tehsil:'Osian',area:5.42,status:'Possessed',ownerRef:'AF-00317'},
 {id:'BR-PAT-000318',caseId:'LA-BR-2026-00141',village:'Bihta',tehsil:'Bihta',area:4.07,status:'Notified',ownerRef:'AF-00421'},
];

export const states = [
 ['Uttar Pradesh',84,52],['Rajasthan',76,64],['Bihar',58,39],['Maharashtra',71,51],['Tamil Nadu',82,88],['Madhya Pradesh',64,47],['Gujarat',69,61],['West Bengal',55,42]
] as const;

export const workflow: Stage[] = ['Proposal','Scrutiny','Approved','Notification','Award','Compensation','Possession','R&R','Completed'];
