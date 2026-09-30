import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Landmark, LayoutDashboard, FilePlus2, Map, BellRing, Scale, Home, UsersRound, Files, CalendarClock, BarChart3, BrainCircuit, ShieldCheck, LogOut, Search, Bell, Menu, ChevronDown, CheckCircle2, AlertTriangle, Clock3, ArrowRight, ClipboardList, Database, Smartphone, Globe2 } from 'lucide-react';
import { useAuth, roleLabels } from '@/context/AuthContext';
import { useAcquisition } from '@/context/AcquisitionContext';

const navItems = [
 {id:'dashboard',label:'National Dashboard',icon:LayoutDashboard,section:'Monitoring'},
 {id:'proposals',label:'Acquisition Proposals',icon:FilePlus2,section:'Acquisition'},
 {id:'parcels',label:'Land Parcels',icon:Map,section:'Acquisition'},
 {id:'notifications',label:'Notifications',icon:BellRing,section:'Acquisition'},
 {id:'awards',label:'Awards & Compensation',icon:Scale,section:'Acquisition'},
 {id:'possession',label:'Possession',icon:Home,section:'Acquisition'},
 {id:'rr',label:'R&R Management',icon:UsersRound,section:'Acquisition'},
 {id:'documents',label:'Documents',icon:Files,section:'Governance'},
 {id:'audit',label:'Audit Trail',icon:ClipboardList,section:'Governance'},
 {id:'integrations',label:'System Integrations',icon:Database,section:'Governance'},
 {id:'field',label:'Field Verification',icon:Smartphone,section:'Operations'},
 {id:'timeline',label:'Milestones & Timeline',icon:CalendarClock,section:'Governance'},
 {id:'reports',label:'MIS & Reports',icon:BarChart3,section:'Governance'},
 {id:'analytics',label:'Risk Analytics',icon:BrainCircuit,section:'Governance'},
 {id:'admin',label:'Administration',icon:ShieldCheck,section:'Governance'},
 {id:'public',label:'Public Status Portal',icon:Globe2,section:'Transparency'},
];

type Notice = { id:number; title:string; detail:string; time:string; type:'warning'|'danger'|'info'; view:string };
const notices:Notice[] = [
 {id:1,title:'Compensation review pending',detail:'National Highway Expansion – Package IV',time:'12 min ago',type:'warning',view:'awards'},
 {id:2,title:'Possession milestone delayed',detail:'Eastern Freight Connectivity',time:'34 min ago',type:'danger',view:'possession'},
 {id:3,title:'New acquisition proposal submitted',detail:'Industrial Corridor Node – Phase I',time:'1 hr ago',type:'info',view:'proposals'},
];

export default function DashboardLayout({activeView,onViewChange,children}:{activeView:string;onViewChange:(v:string)=>void;children:ReactNode}){
 const {user,logout}=useAuth();
 const {cases,parcels,selectCase}=useAcquisition();
 const [open,setOpen]=useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
 const [profile,setProfile]=useState(false);
 const [notificationsOpen,setNotificationsOpen]=useState(false);
 const [search,setSearch]=useState('');
 const [searchOpen,setSearchOpen]=useState(false);
 const searchRef=useRef<HTMLDivElement>(null);
 const groups=['Monitoring','Acquisition','Governance','Operations','Transparency'];

 useEffect(()=>{
   const close=(event:MouseEvent)=>{
     if(searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
   };
   document.addEventListener('mousedown',close);
   return()=>document.removeEventListener('mousedown',close);
 },[]);

 const searchResults=useMemo(()=>{
   const q=search.trim().toLowerCase();
   if(!q) return [];
   const caseResults=cases.filter(c=>[c.id,c.project,c.state,c.district,c.stage,c.status].some(v=>String(v).toLowerCase().includes(q))).slice(0,5).map(c=>({type:'case' as const,id:c.id,title:c.project,detail:`${c.id} · ${c.state} · ${c.district}`,view:'dashboard'}));
   const parcelResults=parcels.filter(p=>[p.id,p.village,p.tehsil,p.caseId,p.status].some(v=>String(v).toLowerCase().includes(q))).slice(0,4).map(p=>({type:'parcel' as const,id:p.id,title:p.id,detail:`${p.village} · ${p.tehsil} · ${p.area} Ha`,view:'parcels'}));
   return [...caseResults,...parcelResults].slice(0,7);
 },[search]);

 const handleSearchKey=(e:React.KeyboardEvent<HTMLInputElement>)=>{
   if(e.key==='Escape'){setSearch('');setSearchOpen(false);return;}
   if(e.key==='Enter' && searchResults.length){
     onViewChange(searchResults[0].view);setSearchOpen(false);
   }
 };

 const toggleSidebar=()=>setOpen(v=>!v);
 return <div className="min-h-screen bg-[#f4f7fa] flex">
  <aside className={`fixed top-0 left-0 h-screen w-72 bg-[#102a43] text-white z-50 transition-transform duration-200 ${open?'translate-x-0':'-translate-x-full'}`}>
   <div className="h-full flex flex-col">
    <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
      <div className="w-11 h-11 bg-[#d49b2a] flex items-center justify-center rounded-sm"><Landmark/></div>
      <div><div className="text-sm font-bold">Government of India</div><div className="text-[10px] text-slate-300">National Land Acquisition<br/> & Management System</div></div>
      
    </div>
    <div className="px-4 py-3 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">Authorized Officer Portal</div>
    <nav className="sidebar-nav flex-1 overflow-y-auto p-3">
      {groups.map(g=><div key={g} className="mb-4"><div className="px-3 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{g}</div>{navItems.filter(n=>n.section===g).map(n=>{const I=n.icon;return <button key={n.id} onClick={()=>{onViewChange(n.id);if(window.innerWidth<1024)setOpen(false)}} className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-sm rounded-sm ${activeView===n.id?'bg-[#1e4f73] text-white border-l-4 border-[#d49b2a]':'text-slate-300 hover:bg-white/5 hover:text-white'}`}><I size={17}/>{n.label}</button>})}</div>)}
    </nav>
    <div className="p-4 border-t border-white/10"><div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-full bg-[#d49b2a] flex items-center justify-center font-bold">{user?.name.split(' ').map(n=>n[0]).join('')}</div><div className="min-w-0"><div className="text-sm truncate">{user?.name}</div><div className="text-[10px] text-slate-400">{user?roleLabels[user.role]:''}</div></div></div><button onClick={logout} className="mt-3 w-full flex items-center gap-2 text-xs text-slate-400 hover:text-white px-2"><LogOut size={14}/> Sign out</button></div>
   </div>
  </aside>
  {open&&<div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={()=>setOpen(false)}/>} 
  <div className={`flex-1 min-w-0 transition-[margin] duration-200 ${open?'lg:ml-72':''}`}>
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button aria-label="Toggle navigation menu" title="Toggle navigation menu" className="p-2 text-[#102a43] hover:bg-slate-50 shrink-0" onClick={toggleSidebar}><Menu size={22}/></button>
          <div className="min-w-0"><div className="flex items-center gap-2 min-w-0"><div className="text-xs text-slate-500 truncate">Government of India · National Land Acquisition & Management System</div><span className="hidden xl:inline-flex text-[9px] uppercase tracking-wider px-2 py-1 border border-amber-200 bg-amber-50 text-amber-700 shrink-0">SIH Demo</span></div><h1 className="text-lg font-bold text-[#102a43] truncate">{navItems.find(n=>n.id===activeView)?.label || 'National Dashboard'}</h1></div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <div ref={searchRef} className="relative hidden sm:block">
            <div className={`flex items-center border bg-slate-50 px-3 py-2 w-56 lg:w-64 ${searchOpen?'border-[#1e4f73] bg-white':'border-slate-200'}`}>
              <Search size={16} className="text-slate-400 shrink-0"/><input value={search} onChange={e=>{setSearch(e.target.value);setSearchOpen(true)}} onFocus={()=>setSearchOpen(true)} onKeyDown={handleSearchKey} placeholder="Search acquisition ID, project..." className="bg-transparent outline-none text-xs ml-2 w-full"/>
              {search&&<button aria-label="Clear search" onClick={()=>{setSearch('');setSearchOpen(false)}} className="text-slate-400 hover:text-slate-700 text-sm">×</button>}
            </div>
            {searchOpen&&search&&<div className="absolute top-full right-0 mt-1 w-80 bg-white border border-slate-200 shadow-xl z-[60]">
              {searchResults.length ? searchResults.map(r=><button key={`${r.type}-${r.id}`} onClick={()=>{if(r.type==='case') selectCase(r.id); onViewChange(r.view); setSearchOpen(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"><div className="flex items-center justify-between gap-2"><b className="text-xs text-[#102a43] truncate">{r.title}</b><ArrowRight size={13} className="text-slate-400 shrink-0"/></div><div className="text-[10px] text-slate-500 mt-1">{r.detail}</div></button>) : <div className="px-4 py-5 text-xs text-slate-500">No acquisition or parcel records found.</div>}
            </div>}
          </div>
          <div className="relative">
            <button aria-label="Notifications" title="Notifications" onClick={()=>setNotificationsOpen(v=>!v)} className={`relative p-2 border ${notificationsOpen?'border-[#1e4f73] bg-slate-50':'border-transparent'} hover:bg-slate-50`}><Bell size={19}/><span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">{notices.length}</span></button>
            {notificationsOpen&&<div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-xl z-[60]">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center"><div><b className="text-sm text-[#102a43]">Notifications</b><p className="text-[10px] text-slate-500">{notices.length} items requiring attention</p></div><button onClick={()=>setNotificationsOpen(false)} className="text-xs text-slate-500">Close</button></div>
              {notices.map(n=><button key={n.id} onClick={()=>{onViewChange(n.view);setNotificationsOpen(false)}} className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 flex gap-3"><div className={`w-7 h-7 shrink-0 flex items-center justify-center ${n.type==='danger'?'bg-red-50 text-red-600':n.type==='warning'?'bg-amber-50 text-amber-600':'bg-blue-50 text-blue-600'}`}>{n.type==='danger'?<AlertTriangle size={14}/>:n.type==='warning'?<Clock3 size={14}/>:<CheckCircle2 size={14}/>}</div><div className="min-w-0"><b className="block text-xs text-[#102a43]">{n.title}</b><p className="text-[10px] text-slate-500 mt-0.5 truncate">{n.detail}</p><span className="text-[9px] text-slate-400">{n.time}</span></div></button>)}
              <button onClick={()=>{onViewChange('notifications');setNotificationsOpen(false)}} className="w-full px-4 py-3 text-xs text-[#1e4f73] font-semibold hover:bg-slate-50">View all notifications</button>
            </div>}
          </div>
          <div className="relative"><button onClick={()=>setProfile(!profile)} className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#102a43] text-white text-xs font-bold flex items-center justify-center">{user?.name.split(' ').map(n=>n[0]).join('')}</div><ChevronDown size={15}/></button>{profile&&<div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 shadow-lg p-4 z-50"><b className="text-sm">{user?.name}</b><p className="text-xs text-slate-500">{user?.email}</p><p className="text-xs text-slate-400 mt-2">{user?.department}</p><button onClick={logout} className="mt-3 text-xs text-red-600">Sign out</button></div>}</div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#f0a52b] via-white to-[#138808]"/>
    </header>
    <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
  </div>
 </div>
}
