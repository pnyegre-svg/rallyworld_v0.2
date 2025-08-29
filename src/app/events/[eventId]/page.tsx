
import type { Metadata } from 'next';
import EventPublicClient from './EventPublicClient';

type FirestoreDoc = {
  fields?: Record<string, any>;
};

function getField(fields: Record<string, any> | undefined, path: string): any {
  if (!fields) return undefined;
  // Supports top-level or one-level nested (e.g., "dates.from")
  const [a, b] = path.split('.');
  const node = b ? fields[a]?.mapValue?.fields?.[b] : fields[a];
  if (!node) return undefined;
  // Basic Firestore value kinds used here
  return node.stringValue ?? node.timestampValue ?? node.booleanValue ?? node.integerValue ?? node.doubleValue ?? undefined;
}

async function fetchEventForMeta(eventId: string) {
  const projectId = process.env.NEXT_PUBLIC_FB_PROJECT_ID!;
  const apiKey = process.env.NEXT_PUBLIC_FB_API_KEY!;
  if (!projectId || !apiKey) return null;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/events/${encodeURIComponent(eventId)}?key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = (await res.json()) as FirestoreDoc;
  const fields = json.fields || {};

  const isPublic = getField(fields, 'public') === true;
  if (!isPublic) return null;

  const title = getField(fields, 'title') || 'Event';
  const location = getField(fields, 'hqLocation') || '';
  const from = getField(fields, 'dates.from');
  const to = getField(fields, 'dates.to');
  const fmt = (ts?: string) => {
    if (!ts) return '';
    try { return new Date(ts).toLocaleDateString(); } catch { return ''; }
  };
  const dateStr = from && to ? `${fmt(from)} – ${fmt(to)}` : fmt(from) || fmt(to) || '';

  // Optional cover field if you have one; otherwise use fallback image
  const coverUrl = getField(fields, 'coverImage') || '/og-event.png';

  return {
    title: String(title),
    description: [dateStr, location].filter(Boolean).join(' • '),
    image: String(coverUrl),
  };
}

export async function generateMetadata(
  { params }: { params: { eventId: string } }
): Promise<Metadata> {
  const meta = await fetchEventForMeta(params.eventId);

  const title = meta?.title ? `${meta.title} – Rally World` : 'Event – Rally World';
  const description = meta?.description || 'Live stages and announcements.';
  const image = meta?.image || '/og-event.png';
  const url = `/events/${params.eventId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title, description, images: [image]
    }
  };
}

export default function Page({ params }: { params: { eventId: string } }) {
  return <EventPublicClient eventId={params.eventId} />;
}
