'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';


type Toast = { id: string; text: string; kind?: 'success'|'error'|'info' };
const Ctx = createContext<{ push:(t:Omit<Toast,'id'>)=>void }>({ push: ()=>{} });


export function useToast(){ return useContext(Ctx); }


export default function Toaster({ children }: { children: React.ReactNode }){
const [items, setItems] = useState<Toast[]>([]);
const push = useCallback((t: Omit<Toast,'id'>) => {
const id = Math.random().toString(36).slice(2);
setItems((xs)=>[...xs,{ id, ...t }]);
setTimeout(()=> setItems(xs=> xs.filter(i=> i.id!==id)), 3000);
},[]);
const ctx = useMemo(()=>({ push }),[push]);
return (
<Ctx.Provider value={ctx}>
{children}
<div className="fixed bottom-4 right-4 z-50 space-y-2">
{items.map((t)=> (
<div key={t.id} className={`rounded-xl border p-3 shadow-lg ${
t.kind==='error' ? 'border-destructive/50 bg-destructive text-destructive-foreground' :
t.kind==='success' ? 'border-green-500/50 bg-green-500/10 text-green-500' :
'border-border bg-background text-foreground'}`}>{t.text}</div>
))}
</div>
</Ctx.Provider>
);
}