
'use client';

import { useEffect, useState } from 'react';
import { getAnnouncementsPublic, getEventPublic, getStagesPublic } from '@/lib/public.event.client';

export default function EventPublicPage({ params }: { params: { eventId: string } }) {
  const eventId = params.eventId;
  const [event,setEvent] = useState<any>(null);
  const [stages,setStages] = useState<any[]>([]);
  const [anns,setAnns] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ (async()=>{
    setLoading(true);
    const [ev, st, an] = await Promise.all([
      getEventPublic(eventId),
      getStagesPublic(eventId),
      getAnnouncementsPublic(eventId),
    ]);
    setEvent(ev);
    setStages(st);
    setAnns(an);
    setLoading(false);
  })(); },[eventId]);

  if (loading) return <Wrap><Sk/></Wrap>;
  if (!event) return <Wrap><h1 className="text-xl font-semibold">Event not found or not public</h1></Wrap>;

  return (
    <Wrap>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-sm text-neutral-400">
          {fmtRange(event?.dates)} {event?.location ? `• ${event.location}` : ''}
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Stages</h2>
        <div className="overflow-hidden rounded-2xl border border-neutral-800">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-900/70"><tr><Th>#</Th><Th>Name</Th><Th>Start</Th><Th>Status</Th></tr></thead>
            <tbody className="divide-y divide-neutral-800">
              {stages.map(s => (
                <tr key={s.id} className="hover:bg-neutral-900/40">
                  <Td className="w-14">{s.order ?? ''}</Td>
                  <Td>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-neutral-500">{s.location || ''} {s.distanceKm ? `• ${s.distanceKm} km` : ''}</div>
                  </Td>
                  <Td className="whitespace-nowrap">{fmt(s.startAt)}</Td>
                  <Td>{badge(s.status)}</Td>
                </tr>
              ))}
              {stages.length === 0 && <tr><Td colSpan={4}><div className="p-4 text-center text-neutral-400">No stages yet.</div></Td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Announcements</h2>
        <div className="space-y-3">
          {anns.map(a => (
            <article key={a.id} className="rounded-2xl border border-neutral-800 p-4">
              <div className="mb-1 flex items-center gap-2">
                {a.pinned && <span className="rounded-full border border-yellow-800 bg-yellow-900/40 px-2 py-0.5 text-xs text-yellow-200">Pinned</span>}
                <h3 className="font-medium">{a.title}</h3>
                <span className="ml-auto text-xs text-neutral-500">{fmt(a.publishedAt)}</span>
              </div>
              {a.body && <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: md(a.body) }} />}
            </article>
          ))}
          {anns.length === 0 && <div className="rounded-2xl border border-neutral-800 p-4 text-center text-neutral-400">No announcements yet.</div>}
        </div>
      </section>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }){ return <div className="mx-auto max-w-4xl p-6">{children}</div>; }
function Sk(){ return <div className="h-40 animate-pulse rounded-2xl bg-neutral-800/70" />; }
function Th({ children }: { children: React.ReactNode }){ return <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">{children}</th>; }
function Td({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }){ return <td className={`px-4 py-3 text-sm ${className||''}`} colSpan={colSpan}>{children}</td>; }

function fmt(ts:any){ try{ const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null; return d? d.toLocaleString():''; }catch{ return ''; } }
function fmtRange(dates:any){
  const from = dates?.from?.toDate ? dates.from.toDate() : dates?.from ? new Date(dates.from) : null;
  const to   = dates?.to?.toDate   ? dates.to.toDate()   : dates?.to   ? new Date(dates.to)   : null;
  if (!from && !to) return '';
  const f = from?.toLocaleDateString() || '';
  const t = to?.toLocaleDateString() || '';
  return (f && t && f!==t) ? `${f} – ${t}` : (f || t);
}

// very light markdown to HTML (bold/italic/line breaks) to avoid extra deps
function md(s:string){
  let html = (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function badge(v:string){
  const map: Record<string,string> = {
    scheduled: 'border-neutral-700 bg-neutral-800 text-neutral-200',
    ongoing:   'border-emerald-800 bg-emerald-900/40 text-emerald-200',
    completed: 'border-blue-800 bg-blue-900/40 text-blue-200',
    delayed:   'border-yellow-800 bg-yellow-900/40 text-yellow-200',
    cancelled: 'border-red-800 bg-red-900/40 text-red-200',
  };
  return <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${map[v]||map.scheduled}`}>{v}</span>;
}
