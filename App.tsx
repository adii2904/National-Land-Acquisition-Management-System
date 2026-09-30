import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import DashboardLayout from '@/components/DashboardLayout';
import P0Dashboard from '@/pages/P0Dashboard';
import { AcquisitionProvider } from '@/context/AcquisitionContext';
import { GovernanceProvider } from '@/context/GovernanceContext';
import AppErrorBoundary from '@/components/AppErrorBoundary';

function Dashboard(){const [view,setView]=useState(()=>typeof window!=='undefined'&&window.location.hash?window.location.hash.slice(1)||'dashboard':'dashboard'); useEffect(()=>{const onHash=()=>setView(window.location.hash.slice(1)||'dashboard'); window.addEventListener('hashchange',onHash); return()=>window.removeEventListener('hashchange',onHash)},[]); const navigate=(next:string)=>{setView(next); if(typeof window!=='undefined') window.history.replaceState(null,'',`#${next}`)}; return <DashboardLayout activeView={view} onViewChange={navigate}><P0Dashboard view={view} onView={navigate}/></DashboardLayout>}
function AppContent(){const {isAuthenticating}=useAuth();return isAuthenticating?<Dashboard/>:<Login/>}
export default function App(){return <AppErrorBoundary><AuthProvider><GovernanceProvider><AcquisitionProvider><AppContent/></AcquisitionProvider></GovernanceProvider></AuthProvider></AppErrorBoundary>}
