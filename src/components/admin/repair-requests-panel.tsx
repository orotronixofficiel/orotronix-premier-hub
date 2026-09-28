import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, ExternalLink, MessageCircle, Phone, RefreshCw, Save, Search, Wrench } from "lucide-react";
import { supabaseRest } from "@/lib/supabase";
import { REPAIR_STATUSES, type RepairStatus } from "@/lib/repair-platform";

type RepairRow={
 id:string;reference:string;customer_name:string;phone:string;email:string|null;city:string;address:string;
 brand:string;model:string;problem_type:string;problem_description:string;notes:string|null;pickup:boolean;
 service_mode:string;appointment_date:string|null;appointment_time:string|null;estimated_price:number;
 estimated_duration:string|null;final_price:number|null;status:RepairStatus;technician_notes:string|null;
 parts_used:unknown[];before_photos:string[];after_photos:string[];warranty_text:string|null;
 customer_approved:boolean|null;rating:number|null;review:string|null;created_at:string;updated_at:string;
};

const statusOrder:RepairStatus[]=["received","diagnostic","awaiting_approval","approved","repairing","quality_check","ready","completed","cancelled"];

export function RepairRequestsPanel(){
 const [rows,setRows]=useState<RepairRow[]>([]); const [search,setSearch]=useState(""); const [filter,setFilter]=useState("all");
 const [selected,setSelected]=useState<RepairRow|null>(null); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 const [finalPrice,setFinalPrice]=useState(""); const [notes,setNotes]=useState(""); const [warranty,setWarranty]=useState(""); const [parts,setParts]=useState("");
 const load=async()=>{setBusy(true);try{const data=await supabaseRest<RepairRow[]>("rpc/admin_list_repair_requests",{method:"POST",body:{}});setRows(data||[]);if(selected){const fresh=(data||[]).find(x=>x.id===selected.id);if(fresh)setSelected(fresh)}}catch(e){setMessage(e instanceof Error?e.message:"Impossible de charger les réparations.")}finally{setBusy(false)}};
 useEffect(()=>{void load()},[]);
 const filtered=useMemo(()=>rows.filter(r=>(filter==="all"||r.status===filter)&&(r.reference+" "+r.customer_name+" "+r.phone+" "+r.brand+" "+r.model).toLowerCase().includes(search.toLowerCase())),[rows,filter,search]);
 const open=(r:RepairRow)=>{setSelected(r);setFinalPrice(r.final_price==null?"":String(r.final_price));setNotes(r.technician_notes||"");setWarranty(r.warranty_text||"");setParts(Array.isArray(r.parts_used)?r.parts_used.map(x=>typeof x==="string"?x:JSON.stringify(x)).join("\n"):"")};
 const save=async()=>{if(!selected)return;setBusy(true);try{const partsUsed=parts.split("\n").map(x=>x.trim()).filter(Boolean);await supabaseRest("rpc/admin_update_repair_request",{method:"POST",body:{p_id:selected.id,p_status:selected.status,p_final_price:finalPrice===""?null:Number(finalPrice),p_technician_notes:notes,p_parts_used:partsUsed,p_warranty_text:warranty,p_customer_approved:selected.customer_approved,p_rating:selected.rating,p_review:selected.review}});setMessage("Réparation mise à jour.");await load()}catch(e){setMessage(e instanceof Error?e.message:"Mise à jour impossible")}finally{setBusy(false)}};
 const whatsapp=(r:RepairRow)=>{const n=r.phone.replace(/\D/g,"");const p=n.startsWith("0")?"212"+n.slice(1):n;window.open("https://wa.me/"+p+"?text="+encodeURIComponent("Bonjour "+r.customer_name+", OROTRONIX concernant votre réparation "+r.reference+" — statut : "+(REPAIR_STATUSES[r.status]||r.status)+"."),"_blank","noopener,noreferrer")};
 const exportCsv=()=>{const h=["Référence","Client","Téléphone","Appareil","Panne","Statut","Prix estimé","Prix final","Date"];const csv=[h,...filtered.map(r=>[r.reference,r.customer_name,r.phone,r.brand+" "+r.model,r.problem_type,REPAIR_STATUSES[r.status]||r.status,String(r.estimated_price),r.final_price==null?"":String(r.final_price),new Date(r.created_at).toLocaleString("fr-MA")])].map(a=>a.map(v=>"\"" + String(v).replace(/\"/g, "\"\"") + "\"").join(";")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv"}));a.download="orotronix-reparations.csv";a.click()};
 return <section className="space-y-5">
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{statusOrder.slice(0,4).map(s=><button key={s} type="button" onClick={()=>setFilter(s)} className="rounded-2xl border border-border bg-card p-4 text-left hover:border-gold/40"><p className="text-xs text-muted-foreground">{REPAIR_STATUSES[s]}</p><p className="mt-2 font-display text-2xl font-bold">{rows.filter(r=>r.status===s).length}</p></button>)}</div>
  <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
   <div className="rounded-2xl border border-border bg-card"><div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input className="bg-surface pl-9" placeholder="Référence, client, téléphone, modèle…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select className="h-10 rounded-md border border-border bg-surface px-3 text-sm" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous les statuts</option>{statusOrder.map(s=><option key={s} value={s}>{REPAIR_STATUSES[s]}</option>)}</select><Button variant="outline" onClick={()=>void load()} disabled={busy}><RefreshCw className={"mr-2 h-4 w-4 "+(busy?"animate-spin":"")}/>Actualiser</Button><Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4"/>CSV</Button></div>
    <div className="divide-y divide-border">{filtered.map(r=><button key={r.id} type="button" onClick={()=>open(r)} className={"block w-full p-4 text-left hover:bg-surface/60 "+(selected?.id===r.id?"bg-gold/5":"")}><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{r.reference}</span><span className="rounded-full border border-gold/30 bg-gold/5 px-2 py-1 text-[11px] text-gold">{REPAIR_STATUSES[r.status]}</span></div><p className="mt-1 text-sm">{r.customer_name} · {r.phone}</p><p className="mt-1 text-xs text-muted-foreground">{r.brand} {r.model} · {r.problem_type} · {new Date(r.created_at).toLocaleString("fr-MA")}</p></button>)}{!filtered.length&&<div className="p-8 text-center text-sm text-muted-foreground">Aucune demande de réparation.</div>}</div>
   </div>
   {selected?<div className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-gold">{selected.reference}</p><h2 className="mt-1 font-display text-xl font-semibold">{selected.brand} {selected.model}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.customer_name} · {selected.phone}</p></div><Wrench className="h-5 w-5 text-gold"/></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Panne" value={selected.problem_type}/><Info label="Ville" value={selected.city}/><Info label="Adresse" value={selected.address}/><Info label="Mode" value={selected.service_mode}/><Info label="Rendez-vous" value={(selected.appointment_date||"—")+" "+(selected.appointment_time||"")}/><Info label="Estimation" value={Number(selected.estimated_price||0)>0?selected.estimated_price+" MAD":"Diagnostic"}/></div>
    <div className="mt-4 rounded-xl bg-surface p-4"><p className="text-xs text-muted-foreground">Description</p><p className="mt-1 text-sm leading-6">{selected.problem_description}</p></div>
    {selected.before_photos?.length>0&&<div className="mt-4 flex flex-wrap gap-2">{selected.before_photos.map(url=><a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt="" className="h-16 w-16 rounded-lg border border-border object-cover"/></a>)}</div>}
    <div className="mt-5"><Label>Statut</Label><select className="mt-2 h-10 w-full rounded-md border border-border bg-surface px-3" value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value as RepairStatus})}>{statusOrder.map(s=><option key={s} value={s}>{REPAIR_STATUSES[s]}</option>)}</select></div>
    <div className="mt-4"><Label>Prix final</Label><Input className="mt-2 bg-surface" type="number" min="0" value={finalPrice} onChange={e=>setFinalPrice(e.target.value)} placeholder="Ex. 450"/></div>
    <div className="mt-4"><Label>Notes technicien / diagnostic</Label><Textarea className="mt-2 bg-surface" rows={4} value={notes} onChange={e=>setNotes(e.target.value)}/></div>
    <div className="mt-4"><Label>Pièces utilisées (une par ligne)</Label><Textarea className="mt-2 bg-surface" rows={3} value={parts} onChange={e=>setParts(e.target.value)}/></div>
    <div className="mt-4"><Label>Garantie</Label><Input className="mt-2 bg-surface" value={warranty} onChange={e=>setWarranty(e.target.value)} placeholder="Ex. 3 mois selon conditions"/></div>
    <div className="mt-5 flex flex-wrap gap-2"><Button onClick={()=>void save()} disabled={busy}><Save className="mr-2 h-4 w-4"/>Enregistrer</Button><Button variant="outline" onClick={()=>whatsapp(selected)}><MessageCircle className="mr-2 h-4 w-4"/>WhatsApp</Button><a className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm" href={"tel:"+selected.phone}><Phone className="mr-2 h-4 w-4"/>Appeler</a></div>
    {message&&<p className="mt-3 text-xs text-gold">{message}</p>}
   </div>:<div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Sélectionnez une demande pour voir son dossier complet.</div>}
  </div>
 </section>;
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-surface p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>}
