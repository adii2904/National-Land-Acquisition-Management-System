import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, MapPin, Maximize2, Minus, Plus, RefreshCw } from 'lucide-react';
import type { AcquisitionCase, Parcel } from '@/lib/acquisitionData';

// Leaflet is loaded from the official CDN at runtime so the prototype does not
// require a GIS package in the build. A small SVG fallback is rendered offline.
declare global {
  interface Window { L?: any }
}

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

const geometry: Record<string, [number, number][]> = {
  'UP-LKO-000421': [[26.8781,80.7820],[26.8788,80.7844],[26.8770,80.7860],[26.8758,80.7834]],
  'UP-LKO-000422': [[26.8752,80.7840],[26.8770,80.7860],[26.8754,80.7881],[26.8738,80.7860]],
  'UP-LKO-000423': [[26.8735,80.7890],[26.8754,80.7881],[26.8747,80.7912],[26.8729,80.7910]],
  'RJ-JOD-000211': [[26.7190,72.9400],[26.7204,72.9421],[26.7186,72.9440],[26.7171,72.9416]],
  'BR-PAT-000318': [[25.5600,84.8700],[25.5616,84.8722],[25.5597,84.8740],[25.5583,84.8717]],
};

const statusClass = (status: Parcel['status']) => {
  if (status === 'Possessed' || status === 'Paid') return 'bg-emerald-500';
  if (status === 'Awarded') return 'bg-amber-500';
  if (status === 'Possession Pending') return 'bg-red-500';
  return 'bg-blue-500';
};

function loadLeaflet() {
  return new Promise<any>((resolve, reject) => {
    if (window.L) return resolve(window.L);
    const existing = document.querySelector<HTMLScriptElement>('script[data-nlams-leaflet]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      return;
    }
    if (!document.querySelector('link[data-nlams-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = LEAFLET_CSS; link.dataset.nlamsLeaflet = 'true';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS; script.async = true; script.dataset.nlamsLeaflet = 'true';
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable'));
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function GISMap({ parcels, cases, selectedId, onSelect, compact = false }: {
  parcels: Parcel[];
  cases: AcquisitionCase[];
  selectedId?: string;
  onSelect: (parcel: Parcel) => void;
  compact?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [zoom, setZoom] = useState(12);

  const visible = useMemo(() => parcels.filter(p => geometry[p.id]), [parcels]);
  const selected = visible.find(p => p.id === selectedId);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !mapRef.current || mapInstance.current) return;
      const first = visible[0];
      const center = first ? geometry[first.id][0] : [26.877, 80.786];
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: true }).setView(center, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      map.on('zoomend', () => setZoom(map.getZoom()));
      mapInstance.current = map;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 100);
    }).catch(() => { if (!cancelled) setMapError(true); });
    return () => { cancelled = true; };
  }, [visible]);

  useEffect(() => {
    const map = mapInstance.current;
    const L = window.L;
    if (!map || !L) return;
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];
    visible.forEach(parcel => {
      const isSelected = parcel.id === selectedId;
      const polygon = L.polygon(geometry[parcel.id], {
        color: isSelected ? '#102a43' : '#1e4f73',
        weight: isSelected ? 4 : 2,
        fillColor: isSelected ? '#f0a52b' : parcel.status === 'Possession Pending' ? '#ef4444' : parcel.status === 'Possessed' || parcel.status === 'Paid' ? '#16a34a' : '#3b82f6',
        fillOpacity: isSelected ? 0.72 : 0.42,
      }).addTo(map);
      polygon.bindTooltip(`${parcel.id} · ${parcel.area} Ha`, { sticky: true });
      polygon.on('click', () => onSelect(parcel));
      layersRef.current.push(polygon);
    });
  }, [visible, selectedId, onSelect]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedId || !geometry[selectedId]) return;
    map.fitBounds(geometry[selectedId], { padding: [80, 80], maxZoom: 15, animate: true });
  }, [selectedId]);

  const fitAll = () => {
    const map = mapInstance.current;
    if (!map || !visible.length || !window.L) return;
    const points = visible.flatMap(p => geometry[p.id]);
    map.fitBounds(window.L.latLngBounds(points), { padding: [35, 35], maxZoom: 13 });
  };

  if (mapError) return <OfflineParcelMap parcels={visible} cases={cases} selectedId={selectedId} onSelect={onSelect} />;

  return <div className={`relative bg-slate-100 ${compact ? 'h-[420px]' : 'h-[620px]'}`}>
    <div ref={mapRef} className="absolute inset-0 z-0" />
    {!ready && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100"><div className="text-center"><RefreshCw className="mx-auto animate-spin text-[#1e4f73]" size={24}/><p className="text-xs text-slate-500 mt-2">Loading GIS base map…</p></div></div>}
    <div className="absolute z-[500] top-3 left-3 bg-white border border-slate-200 shadow-sm p-3 w-56">
      <div className="flex items-center gap-2"><MapPin size={15} className="text-[#1e4f73]"/><b className="text-xs text-[#102a43]">Land Parcel GIS</b></div>
      <p className="text-[10px] text-slate-500 mt-1">Interactive parcel layer · {visible.length} mapped parcels</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-[10px] text-slate-600">
        {(['Possessed','Awarded','Possession Pending','Notified'] as Parcel['status'][]).map(s => <span key={s} className="flex items-center gap-1"><i className={`w-2.5 h-2.5 rounded-full ${statusClass(s)}`}/>{s}</span>)}
      </div>
    </div>
    <div className="absolute z-[500] top-3 right-3 flex gap-1">
      <button onClick={fitAll} title="Fit all parcels" className="bg-white border border-slate-200 shadow-sm p-2"><Maximize2 size={15}/></button>
      <button onClick={()=>mapInstance.current?.setZoom(Math.max(8, zoom-1))} className="bg-white border border-slate-200 shadow-sm p-2"><Minus size={15}/></button>
      <button onClick={()=>mapInstance.current?.setZoom(Math.min(18, zoom+1))} className="bg-white border border-slate-200 shadow-sm p-2"><Plus size={15}/></button>
      <button onClick={fitAll} title="Locate parcels" className="bg-white border border-slate-200 shadow-sm p-2"><LocateFixed size={15}/></button>
    </div>
    {selected && <div className="absolute z-[500] bottom-3 left-3 right-3 bg-white border border-slate-200 shadow-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-wide text-slate-500">Selected parcel</p><b className="text-sm text-[#102a43]">{selected.id}</b><p className="text-xs text-slate-500 mt-1">{selected.village}, {selected.tehsil} · {selected.area} Ha · {selected.status}</p></div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs"><span className="text-slate-500">Case</span><b>{selected.caseId}</b><span className="text-slate-500">Family ref.</span><b>{selected.ownerRef}</b></div>
        <button onClick={fitAll} className="text-xs font-semibold text-[#1e4f73] flex items-center gap-1">Fit all parcels <Maximize2 size={13}/></button>
      </div>
    </div>}
  </div>;
}

function OfflineParcelMap({ parcels, cases, selectedId, onSelect }: { parcels: Parcel[]; cases: AcquisitionCase[]; selectedId?: string; onSelect: (p: Parcel) => void }) {
  return <div className="h-[620px] bg-[#edf2ef] relative overflow-hidden">
    <div className="absolute inset-0 opacity-30 bg-[linear-gradient(25deg,transparent_49%,#94a3b8_50%,transparent_51%),linear-gradient(115deg,transparent_49%,#94a3b8_50%,transparent_51%)] bg-[length:120px_120px]"/>
    <div className="absolute inset-8 border-2 border-dashed border-slate-400/50 rounded-[28%] rotate-[-5deg]"/>
    <div className="absolute top-4 left-4 bg-white border shadow-sm p-3 z-10"><b className="text-xs text-[#102a43]">Offline GIS preview</b><p className="text-[10px] text-slate-500 mt-1">Basemap unavailable. Parcel geometry remains interactive.</p></div>
    {parcels.map((p,i) => <button key={p.id} onClick={()=>onSelect(p)} className={`absolute text-left border-2 transition-all ${p.id===selectedId?'border-[#102a43] bg-amber-300/75 scale-105 z-20':'border-[#1e4f73] bg-blue-300/45'} p-2`} style={{left:`${18+i*15}%`,top:`${22+(i%3)*18}%`,width:`${15+(i%2)*6}%`,height:`${14+(i%2)*5}%`}}><span className="text-[9px] font-bold text-[#102a43]">{p.id}</span><span className="block text-[9px] text-slate-700">{p.area} Ha</span></button>)}
    <div className="absolute bottom-4 left-4 right-4 bg-white border shadow-sm p-4"><div className="grid md:grid-cols-3 gap-4"><div><span className="text-[10px] text-slate-500">Mapped parcels</span><b className="block text-lg text-[#102a43]">{parcels.length}</b></div><div><span className="text-[10px] text-slate-500">Cases represented</span><b className="block text-lg text-[#102a43]">{new Set(parcels.map(p=>p.caseId)).size}</b></div><div><span className="text-[10px] text-slate-500">GIS layer</span><b className="block text-sm text-[#102a43]">Cadastral-ready</b></div></div></div>
    {cases.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">No parcel data matches the current filter.</div>}
  </div>;
}
