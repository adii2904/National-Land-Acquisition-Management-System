import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cases as seedCases, parcels as seedParcels, type AcquisitionCase, type Parcel, type Stage } from '@/lib/acquisitionData';
import { useGovernance } from '@/context/GovernanceContext';

interface AcquisitionContextValue {
  cases: AcquisitionCase[];
  parcels: Parcel[];
  selectedCaseId: string | null;
  selectCase: (id: string | null) => void;
  updateCase: (id: string, patch: Partial<AcquisitionCase>) => void;
  advanceStage: (id: string, stage: Stage) => void;
  createCase: (input: Pick<AcquisitionCase,'project'|'ministry'|'state'|'district'|'landRequired'|'villages'>) => AcquisitionCase;
  updateParcel: (id: string, patch: Partial<Parcel>) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'nlams-p02-acquisition-state';
const SELECTED_KEY = 'nlams-p02-selected-case';
const Ctx = createContext<AcquisitionContextValue | null>(null);

function load<T>(key:string, fallback:T):T {
  try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

export function AcquisitionProvider({children}:{children:ReactNode}){
  const { addAudit } = useGovernance();
  const [state,setState]=useState(()=>load(STORAGE_KEY,{cases:seedCases,parcels:seedParcels}));
  const [selectedCaseId,setSelectedCaseId]=useState<string|null>(()=>load<string|null>(SELECTED_KEY,null));

  useEffect(()=>{ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); },[state]);
  useEffect(()=>{ if(selectedCaseId) localStorage.setItem(SELECTED_KEY,selectedCaseId); else localStorage.removeItem(SELECTED_KEY); },[selectedCaseId]);

  const value=useMemo<AcquisitionContextValue>(()=>({
    cases:state.cases, parcels:state.parcels, selectedCaseId,
    selectCase:(id)=>setSelectedCaseId(id),
    updateCase:(id,patch)=>{ addAudit({user:'Rajesh Kumar',role:'Administrator',action:'Updated acquisition case',target:id,module:'Acquisition',result:'Success'}); setState(s=>({ ...s, cases:s.cases.map(c=>c.id===id?{...c,...patch}:c) }))},
    advanceStage:(id,stage)=>{ addAudit({user:'Rajesh Kumar',role:'Administrator',action:`Advanced lifecycle to ${stage}`,target:id,module:'Workflow',result:'Success'}); setState(s=>({ ...s, cases:s.cases.map(c=>{ if(c.id!==id) return c; const patch:Partial<AcquisitionCase>={stage}; if(stage==='Notification') patch.notified=100; if(stage==='Award') patch.award=100; if(stage==='Compensation') patch.compensationPaid=c.compensationAssessed; if(stage==='Possession') patch.possession=100; if(stage==='R&R') patch.rrProgress=100; if(stage==='Completed'){ patch.notified=100; patch.award=100; patch.compensationPaid=c.compensationAssessed; patch.possession=100; patch.rrProgress=100; patch.status='On Track'; } return {...c,...patch}; }) }))},
    createCase:(input)=>{
      const n=state.cases.length+1;
      const id=`LA-${input.state.slice(0,2).toUpperCase()}-2026-${String(150+n).padStart(5,'0')}`;
      const item:AcquisitionCase={id,project:input.project,ministry:input.ministry,state:input.state,district:input.district,villages:input.villages,landRequired:input.landRequired,landAcquired:0,parcels:0,notified:0,award:0,compensationAssessed:0,compensationPaid:0,affectedFamilies:0,displacedFamilies:0,rrProgress:0,possession:0,stage:'Proposal',status:'On Track',target:'To be scheduled'};
      setState(s=>({...s,cases:[item,...s.cases]})); addAudit({user:'Rajesh Kumar',role:'Administrator',action:'Created acquisition proposal',target:id,module:'Acquisition',result:'Success'}); setSelectedCaseId(id); return item;
    },
    updateParcel:(id,patch)=>{ addAudit({user:'Rajesh Kumar',role:'Administrator',action:'Updated parcel record',target:id,module:'GIS / Parcels',result:'Success'}); setState(s=>({...s,parcels:s.parcels.map(p=>p.id===id?{...p,...patch}:p)}))},
    resetDemoData:()=>{setState({cases:seedCases,parcels:seedParcels});setSelectedCaseId(null);}
  }),[state,selectedCaseId,addAudit]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAcquisition(){ const value=useContext(Ctx); if(!value) throw new Error('useAcquisition must be used inside AcquisitionProvider'); return value; }
