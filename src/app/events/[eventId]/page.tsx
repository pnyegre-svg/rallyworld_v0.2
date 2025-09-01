
'use client';

import { useEffect, useState } from 'react';
import { getAnnouncementsPublic, getEventPublic, getStagesPublic } from '@/lib/public.event.client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// very light markdown to HTML (bold/italic/line breaks) to avoid extra deps
function md(s:string){
  let html = (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function Wrap({ children }: { children: React.ReactNode }){ return <div className="mx-auto max-w-4xl p-6">{children}</div>; }
function Sk(){ return <div className="h-40 animate-pulse rounded-2xl bg-muted/70" />; }
function Th({ children }: { children: React.ReactNode }){ return <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{children}</th>; }
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

function statusBadge(v:string){
  const map: Record<string,string> = {
    scheduled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    ongoing:   'bg-green-500/10 text-green-400 border-green-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    delayed:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return <Badge variant="outline" className={`capitalize ${map[v]||map.scheduled}`}>{v}</Badge>;
}

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
        <p className="text-sm text-muted-foreground">
          {fmtRange(event?.dates)} {event?.hqLocation ? `• ${event.hqLocation}` : ''}
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Stages</h2>
        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50"><tr><Th>#</Th><Th>Name</Th><Th>Start</Th><Th>Status</Th></tr></thead>
            <tbody className="divide-y divide-border">
              {stages.map(s => (
                <tr key={s.id} className="hover:bg-muted/50">
                  <Td className="w-14 text-center">{s.order ?? ''}</Td>
                  <Td>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.location || ''} {s.distanceKm ? `• ${s.distanceKm} km` : ''}</div>
                  </Td>
                  <Td className="whitespace-nowrap font-mono">{fmt(s.startAt)}</Td>
                  <Td>{statusBadge(s.status)}</Td>
                </tr>
              ))}
              {stages.length === 0 && <tr><Td colSpan={4}><div className="p-4 text-center text-muted-foreground">No stages yet.</div></Td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Announcements</h2>
        <div className="space-y-3">
          {anns.map(a => (
            <article key={a.id} className="rounded-lg border p-4">
              <div className="mb-1 flex items-center gap-2">
                {a.pinned && <Badge variant="secondary">Pinned</Badge>}
                <h3 className="font-medium">{a.title}</h3>
                <span className="ml-auto text-xs text-muted-foreground">{fmt(a.publishedAt)}</span>
              </div>
              {a.body && <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: md(a.body) }} />}
            </article>
          ))}
          {anns.length === 0 && <div className="rounded-lg border p-4 text-center text-muted-foreground">No announcements yet.</div>}
        </div>
      </section>
    </Wrap>
  );
}
