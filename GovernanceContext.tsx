import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AuditEvent = { id:string; time:string; user:string; role:string; action:string; target:string; module:string; result:'Success'|'Pending'|'Warning' };
export type DocumentRecord = { id:string; name:string; caseId:string; version:number; uploadedBy:string; date:string; classification:'Official'|'Restricted'|'Public'; size:string };
export type Integration = { id:string; name:string; owner:string; status:'Connected'|'Sandbox'|'Planned'; lastSync:string };

const auditSeed:AuditEvent[]=[
 {id:'AUD-1001',time:'28 Sep 2026 · 16:42',user:'Rajesh Kumar',role:'Administrator',action:'Approved workflow stage',target:'LA-UP-2026-00124',module:'Acquisition',result:'Success'},
 {id:'AUD-1002',time:'28 Sep 2026 · 16:18',user:'Anita Verma',role:'State Nodal Officer',action:'Uploaded document v3',target:'DPR-LA-UP-2026-00124',module:'Documents',result:'Success'},
 {id:'AUD-1003',time:'28 Sep 2026 · 15:54',user:'Rohit Singh',role:'District Officer',action:'Updated parcel status',target:'UP-LKO-000423',module:'GIS / Parcels',result:'Success'},
];
const docSeed:DocumentRecord[]=[
 {id:'DOC-001',name:'DPR – National Highway Expansion.pdf',caseId:'LA-UP-2026-00124',version:3,uploadedBy:'Anita Verma',date:'28 Sep 2026',classification:'Restricted',size:'4.8 MB'},
 {id:'DOC-002',name:'Social Impact Assessment.pdf',caseId:'LA-BR-2026-00141',version:2,uploadedBy:'Rohit Singh',date:'27 Sep 2026',classification:'Official',size:'2.1 MB'},
 {id:'DOC-003',name:'Cadastral Parcel Map.geojson',caseId:'LA-RJ-2026-00087',version:1,uploadedBy:'GIS Cell',date:'26 Sep 2026',classification:'Official',size:'8.6 MB'},
];
const integrationSeed:Integration[]=[
 {id:'land-records',name:'Land Records / RoR',owner:'Revenue Department',status:'Sandbox',lastSync:'28 Sep 2026 · 15:20'},
 {id:'cadastral',name:'Cadastral Map Service',owner:'National GIS Cell',status:'Connected',lastSync:'28 Sep 2026 · 16:05'},
 {id:'finance',name:'Compensation / Payment Gateway',owner:'Finance Integration Layer',status:'Sandbox',lastSync:'28 Sep 2026 · 14:40'},
 {id:'rr',name:'R&R Registry',owner:'Rehabilitation Cell',status:'Planned',lastSync:'—'},
];
const KEY='nlams-p1-governance';
function load<T>(key:string,fallback:T):T{try{const r=localStorage.getItem(key);return r?JSON.parse(r):fallback}catch{return fallback}}
interface Ctx{audit:AuditEvent[];documents:DocumentRecord[];integrations:Integration[];addAudit:(event:Omit<AuditEvent,'id'|'time'>)=>void;addDocumentVersion:(id:string,user:string)=>void;addDocument:(doc:Omit<DocumentRecord,'id'|'version'|'date'>)=>void;syncIntegration:(id:string)=>void;resetGovernance:()=>void}
const GovernanceCtx=createContext<Ctx|null>(null);
export function GovernanceProvider({children}:{children:ReactNode}){
 const [audit,setAudit]=useState(()=>load<AuditEvent[]>(`${KEY}-audit`,auditSeed));
 const [documents,setDocuments]=useState(()=>load<DocumentRecord[]>(`${KEY}-docs`,docSeed));
 const [integrations,setIntegrations]=useState(integrationSeed);
 useEffect(()=>localStorage.setItem(`${KEY}-audit`,JSON.stringify(audit)),[audit]);
 useEffect(()=>localStorage.setItem(`${KEY}-docs`,JSON.stringify(documents)),[documents]);
 const value=useMemo<Ctx>(()=>({audit,documents,integrations,
  addAudit:(event)=>setAudit(a=>[{...event,id:`AUD-${Date.now()}`,time:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),},...a].slice(0,100)),
  addDocumentVersion:(id,user)=>setDocuments(ds=>ds.map(d=>d.id===id?{...d,version:d.version+1,uploadedBy:user,date:'28 Sep 2026'}:d)),
  addDocument:(doc)=>setDocuments(ds=>[{...doc,id:`DOC-${Date.now()}`,version:1,date:'28 Sep 2026'},...ds]),
  syncIntegration:(id)=>{setIntegrations(items=>items.map(i=>i.id===id?{...i,status:i.status==='Connected'?'Connected':'Sandbox',lastSync:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}:i));setAudit(a=>[{id:`AUD-${Date.now()}`,time:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),user:'Rajesh Kumar',role:'Administrator',action:'Triggered integration sync',target:id,module:'System Integrations',result:'Success'},...a].slice(0,100));},
  resetGovernance:()=>{setAudit(auditSeed);setDocuments(docSeed);setIntegrations(integrationSeed)}
 }),[audit,documents,integrations]);
 return <GovernanceCtx.Provider value={value}>{children}</GovernanceCtx.Provider>
}
export function useGovernance(){const c=useContext(GovernanceCtx);if(!c)throw new Error('useGovernance must be used inside GovernanceProvider');return c}
