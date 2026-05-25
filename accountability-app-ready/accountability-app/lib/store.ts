// lib/store.ts
export type ServiceType = 'static_post' | 'reel' | 'carousel' | 'story' | 'caption' | 'ad_creative' | 'edit';

export const SERVICE_LABELS: Record<ServiceType, string> = {
  static_post: 'Static Post',
  reel: 'Reel / Video',
  carousel: 'Carousel',
  story: 'Story Design',
  caption: 'Caption Writing',
  ad_creative: 'Ad Creative',
  edit: 'Feedback / Edit',
};

export const SERVICE_COLORS: Record<ServiceType, string> = {
  static_post: 'bg-blue-100 text-blue-800',
  reel: 'bg-purple-100 text-purple-800',
  carousel: 'bg-orange-100 text-orange-800',
  story: 'bg-pink-100 text-pink-800',
  caption: 'bg-green-100 text-green-800',
  ad_creative: 'bg-red-100 text-red-800',
  edit: 'bg-gray-100 text-gray-700',
};

export interface Client {
  id: string;
  name: string;
  business: string;
  package: string;
  whatsapp: string;
  email: string;
  status: 'active' | 'paused' | 'inactive';
  joinDate: string;
  notes: string;
  color: string;
}

export interface ServiceEntry {
  id: string;
  clientId: string;
  month: string; // "2025-05"
  services: Partial<Record<ServiceType, number>>;
  notes: string;
  createdAt: string;
  deliveryDate: string;
}

const CLIENTS_KEY = 'zac_clients_v2';
const ENTRIES_KEY = 'zac_entries_v2';

const CLIENT_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500',
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
];

export function getClients(): Client[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
  } catch { return []; }
}

export function saveClients(clients: Client[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function getEntries(): ServiceEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  } catch { return []; }
}

export function saveEntries(entries: ServiceEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getRandomColor(): string {
  return CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)];
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function formatMonth(m: string): string {
  const [year, month] = m.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getLast12Months(): string[] {
  const months: string[] = [];
  const d = new Date();
  for (let i = 0; i < 12; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export function getClientStats(clientId: string, entries: ServiceEntry[]) {
  const clientEntries = entries.filter(e => e.clientId === clientId);
  const totalServices = clientEntries.reduce((acc, e) => {
    return acc + Object.values(e.services).reduce((a, b) => a + (b || 0), 0);
  }, 0);
  const lastEntry = clientEntries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return { totalEntries: clientEntries.length, totalServices, lastEntry };
}
