import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, Download, ExternalLink, MessageCircle, Phone, RefreshCw, Save, Search, ShieldCheck, Wrench } from "lucide-react";
import { supabaseRest } from "@/lib/supabase";
import { REPAIR_STATUSES, type RepairStatus } from "@/lib/repair-platform";

type RepairRow={
  id:string;reference:string;customer_name:string;phone:string;email:string|null;city:string;address:string;
  brand:string;model:string;problem_type:string;problem_description:string;notes:string|null;pickup:boolean;
  service_mode:string;appointment_date:string|null;appointment_time:string|null;estimated_price:number;
  estimated_duration:string|null;final_price:number|null;status:RepairStatus;technician_notes:string|null;
  parts_used:unknown[];before_photos:string[];after_photos:string[];warranty_text:string|null;
  customer_approved:boolean|null;rating:number|null;review:string|null;created_at:string;updated_at:string;
  imei:string|null;serial_number:string|null;parts_cost:number;labor_cost:number;delivery_cost:number;
  warranty_days:number|null;warranty_end:string|null;
};

const statusOrder:RepairStatus[]=["received","diagnostic","awaiting_approval","approved","repairing","quality_check","ready","completed","cancelled"];
const statusTone:Record<string,string>={
  received:"border-sky-500/30 bg-sky-500/10",
  diagnostic:"border-violet-500/30 bg-violet-500/10",
  awaiting_approval:"border-amber-500/30 bg-amber-500/10",
  approved:"border-emerald-500/30 bg-emerald-500/10",
  repairing:"border-blue-500/30 bg-blue-500/10",
  quality_check:"border-cyan-500/30 bg-cyan-500/10",
  ready:"border-green-500/30 bg-green-500/10",
  completed:"border-emerald-600/30 bg-emerald-600/10",
  cancelled:"border-red-500/30 bg-red-500/10"
};

export function RepairRequestsPanel(){
  const [rows,setRows]=useState<RepairRow[]>([]);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState<RepairRow|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [finalPrice,setFinalPrice]=useState("");
  const [notes,setNotes]=useState("");
  const [warranty,setWarranty]=useState("");
  const [parts,setParts]=useState("");
  const [imei,setImei]=useState("");
  const [partsCost,setPartsCost]=useState("0");
  const [laborCost,setLaborCost]=useState("0");
  const [deliveryCost,setDeliveryCost]=useState("0");
  const [warrantyDays,setWarrantyDays]=useState("0");
  const checkLabels=[
    ["screen","Écran / tactile"],["camera","Caméras"],["speaker","Haut-parleur"],["microphone","Microphone"],
    ["charging","Charge / USB"],["wifi","Wi-Fi"],["bluetooth","Bluetooth"],["network","Réseau / SIM"],
    ["buttons","Boutons"],["biometric","Face ID / Touch ID"],["battery","Batterie"],["vibration","Vibration"]
  ] as const;
  const [checks,setChecks]=useState<Record<string,boolean>>({});

  const load=async()=>{
    setBusy(true);
    try{
      const data=await supabaseRest<RepairRow[]>("rpc/admin_list_repair_requests",{method:"POST",body:{}});
      setRows(data||[]);
      if(selected){
        const fresh=(data||[]).find(x=>x.id===selected.id);
        if(fresh)setSelected(fresh);
      }
    }catch(e){setMessage(e instanceof Error?e.message:"Impossible de charger les réparations.")}
    finally{setBusy(false)}
  };

  useEffect(()=>{void load()},[]);

  const filtered=useMemo(()=>rows.filter(r=>
    (filter==="all"||r.status===filter) &&
    (r.reference+" "+r.customer_name+" "+r.phone+" "+r.brand+" "+r.model).toLowerCase().includes(search.toLowerCase())
  ),[rows,filter,search]);

  const open=async(r:RepairRow)=>{
    setSelected(r);
    setMessage("");
    setFinalPrice(r.final_price==null?"":String(r.final_price));
    setNotes(r.technician_notes||"");
    setWarranty(r.warranty_text||"");
    setParts(Array.isArray(r.parts_used)?r.parts_used.map(x=>typeof x==="string"?x:JSON.stringify(x)).join("\n"):"");
    setImei(r.imei||"");
    setPartsCost(String(r.parts_cost||0));
    setLaborCost(String(r.labor_cost||0));
    setDeliveryCost(String(r.delivery_cost||0));
    setWarrantyDays(String(r.warranty_days||0));
    try{
      const op=await supabaseRest<Record<string,any>>("rpc/admin_repair_operations",{method:"POST",body:{p_id:r.id}});
      const next:Record<string,boolean>={};
      (Array.isArray(op?.tests)?op.tests:[]).forEach((x:any)=>{if(x?.check_key)next[x.check_key]=Boolean(x.passed)});
      setChecks(next);
    }catch{setChecks({})}
  };

  const save=async()=>{
    if(!selected)return;
    setBusy(true);
    try{
      const data=Object.fromEntries(checkLabels.map(([key,label])=>[key,{key,label,passed:Boolean(checks[key])}]));
      await supabaseRest("rpc/admin_update_repair_request",{method:"POST",body:{
        p_id:selected.id,p_status:selected.status,p_final_price:finalPrice===""?null:Number(finalPrice),
        p_technician_notes:notes,p_parts_used:parts.split("\n").map(x=>x.trim()).filter(Boolean),
        p_warranty_text:warranty,p_customer_approved:selected.customer_approved,p_rating:selected.rating,p_review:selected.review
      }});
      await supabaseRest("rpc/admin_save_repair_diagnostic",{method:"POST",body:{p_repair_id:selected.id,p_data:{imei,notes}}});
      await supabaseRest("rpc/admin_save_repair_checks",{method:"POST",body:{p_repair_id:selected.id,p_checks:Object.values(data)}});
      await supabaseRest("rpc/admin_update_repair_financials",{method:"POST",body:{
        p_id:selected.id,p_parts_cost:Number(partsCost)||0,p_labor_cost:Number(laborCost)||0,
        p_delivery_cost:Number(deliveryCost)||0,p_warranty_days:Number(warrantyDays)||0,p_warranty_text:warranty
      }});
      setMessage("Dossier complet enregistré.");
      await load();
    }catch(e){setMessage(e instanceof Error?e.message:"Mise à jour impossible.")}
    finally{setBusy(false)}
  };

  const printBon=(r:RepairRow)=>{
    const qr="https://quickchart.io/qr?text="+encodeURIComponent(window.location.origin+"/reparation?reference="+r.reference)+"&size=220";
    const w=window.open("","_blank");
    if(!w)return;
    w.document.write("<!doctype html><html><head><title>"+r.reference+" · OROTRONIX</title><style>body{font-family:Arial;padding:32px;max-width:760px;margin:auto}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border:1px solid #ddd;padding:9px;text-align:left}.qr{float:right;width:140px}</style></head><body><img class='qr' src='"+qr+"'><h1>OROTRONIX</h1><p>Bon de réparation</p><h2>"+r.reference+"</h2><table><tr><th>Client</th><td>"+r.customer_name+" · "+r.phone+"</td></tr><tr><th>Appareil</th><td>"+r.brand+" "+r.model+"</td></tr><tr><th>Panne</th><td>"+r.problem_type+"</td></tr><tr><th>Estimation</th><td>"+Number(r.estimated_price||0).toLocaleString("fr-MA")+" MAD</td></tr><tr><th>Prix final</th><td>"+(r.final_price==null?"À confirmer":Number(r.final_price).toLocaleString("fr-MA")+" MAD")+"</td></tr><tr><th>Statut</th><td>"+(REPAIR_STATUSES[r.status]||r.status)+"</td></tr></table><p style='margin-top:40px'>Garantie: "+(warranty||"Selon conditions")+"</p><script>setTimeout(()=>window.print(),400)</script></body></html>");
    w.document.close();
  };

  const whatsapp=(r:RepairRow)=>{
    const n=r.phone.replace(/\D/g,"");
    const p=n.startsWith("0")?"212"+n.slice(1):n;
    window.open("https://wa.me/"+p+"?text="+encodeURIComponent("Bonjour "+r.customer_name+", OROTRONIX concernant votre réparation "+r.reference+" — statut : "+(REPAIR_STATUSES[r.status]||r.status)+"."),"_blank","noopener,noreferrer");
  };

  const exportCsv=()=>{
    const header=["Référence","Client","Téléphone","Appareil","Panne","Statut","Prix estimé","Prix final","Date"];
    const csv=[header,...filtered.map(r=>[
      r.reference,r.customer_name,r.phone,r.brand+" "+r.model,r.problem_type,REPAIR_STATUSES[r.status]||r.status,
      String(r.estimated_price),r.final_price==null?"":String(r.final_price),new Date(r.created_at).toLocaleString("fr-MA")
    ])].map(a=>a.map(v=>"\""+String(v).replace(/\"/g,"\"\"")+"\"").join(";")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv"}));
    a.download="orotronix-reparations.csv";
    a.click();
  };

  return <section className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {statusOrder.slice(0,4).map((s,i)=>{
        const tones=["border-sky-500/30 bg-sky-500/10","border-violet-500/30 bg-violet-500/10","border-amber-500/30 bg-amber-500/10","border-blue-500/30 bg-blue-500/10"];
        return <button key={s} type="button" onClick={()=>setFilter(s)} className={"rounded-2xl border p-4 text-left transition hover:brightness-110 "+tones[i]}>
          <p className="text-xs text-muted-foreground">{REPAIR_STATUSES[s]}</p>
          <p className="mt-2 font-display text-2xl font-bold">{rows.filter(r=>r.status===s).length}</p>
        </button>;
      })}
    </div>

    <div className="grid gap-5 xl:grid-cols-[1fr_440px]">
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input className="bg-surface pl-9" placeholder="Référence, client, téléphone, modèle…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select className="h-10 rounded-md border border-border bg-surface px-3 text-sm" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous les statuts</option>{statusOrder.map(s=><option key={s} value={s}>{REPAIR_STATUSES[s]}</option>)}</select>
          <Button variant="outline" onClick={()=>void load()} disabled={busy}><RefreshCw className={"mr-2 h-4 w-4 "+(busy?"animate-spin":"")}/>Actualiser</Button>
          <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4"/>CSV</Button>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(r=><button key={r.id} type="button" onClick={()=>void open(r)} className={"block w-full p-4 text-left hover:bg-surface/60 "+(selected?.id===r.id?"bg-gold/5":"")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{r.reference}</span>
              <span className={"rounded-full border px-2 py-1 text-[11px] "+(statusTone[r.status]||"border-border bg-surface")}>{REPAIR_STATUSES[r.status]}</span>
            </div>
            <p className="mt-1 text-sm">{r.customer_name} · {r.phone}</p>
            <p className="mt-1 text-xs text-muted-foreground">{r.brand} {r.model} · {r.problem_type} · {new Date(r.created_at).toLocaleString("fr-MA")}</p>
          </button>)}
          {!filtered.length&&<div className="p-8 text-center text-sm text-muted-foreground">Aucune demande de réparation.</div>}
        </div>
      </div>

      {selected?<div className="h-fit space-y-4 lg:sticky lg:top-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs text-gold">{selected.reference}</p><h2 className="mt-1 font-display text-xl font-semibold">{selected.brand} {selected.model}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.customer_name} · {selected.phone}</p></div>
            <Wrench className="h-5 w-5 text-gold"/>
          </div>
        </div>

        <Section tone="blue" icon={<ClipboardCheck className="h-5 w-5"/>} title="1 · Informations & diagnostic">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Panne" value={selected.problem_type}/><Info label="Ville" value={selected.city}/>
            <Info label="Mode" value={selected.service_mode}/><Info label="Rendez-vous" value={(selected.appointment_date||"—")+" "+(selected.appointment_time||"")}/>
            <Info label="Estimation" value={Number(selected.estimated_price||0)>0?Number(selected.estimated_price).toLocaleString("fr-MA")+" MAD":"Sur diagnostic"}/>
            <Info label="Adresse" value={selected.address}/>
          </div>
          <div className="mt-3 rounded-xl bg-background/60 p-4"><p className="text-xs text-muted-foreground">Description client</p><p className="mt-1 text-sm leading-6">{selected.problem_description}</p></div>
          {selected.before_photos?.length>0&&<div className="mt-3 flex flex-wrap gap-2">{selected.before_photos.map(url=><a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt="" className="h-16 w-16 rounded-lg border border-border object-cover"/></a>)}</div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><Label>IMEI</Label><Input className="mt-2 bg-background" value={imei} onChange={e=>setImei(e.target.value)} placeholder="Optionnel"/></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {checkLabels.map(([key,label])=><label key={key} className="flex items-center gap-2 rounded-lg border border-border bg-background/70 p-2 text-xs"><input type="checkbox" checked={Boolean(checks[key])} onChange={e=>setChecks(x=>({...x,[key]:e.target.checked}))}/>{label}</label>)}
          </div>
        </Section>

        <Section tone="amber" icon={<Wrench className="h-5 w-5"/>} title="2 · Coûts & garantie">
          <div className="grid grid-cols-2 gap-3">
            <MoneyField label="Coût pièces" value={partsCost} setValue={setPartsCost}/>
            <MoneyField label="Main-d'œuvre" value={laborCost} setValue={setLaborCost}/>
            <MoneyField label="Livraison" value={deliveryCost} setValue={setDeliveryCost}/>
            <div><Label>Garantie (jours)</Label><Input className="mt-2 bg-background" type="number" min="0" value={warrantyDays} onChange={e=>setWarrantyDays(e.target.value)}/></div>
          </div>
          <div className="mt-3"><Label>Conditions de garantie</Label><Input className="mt-2 bg-background" value={warranty} onChange={e=>setWarranty(e.target.value)} placeholder="Ex. 3 mois selon conditions"/></div>
        </Section>

        <Section tone="green" icon={<ShieldCheck className="h-5 w-5"/>} title="3 · Validation client & état">
          <div><Label>Statut</Label><select className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value as RepairStatus})}>{statusOrder.map(s=><option key={s} value={s}>{REPAIR_STATUSES[s]}</option>)}</select></div>
          <div className="mt-3"><Label>Prix final</Label><Input className="mt-2 bg-background" type="number" min="0" value={finalPrice} onChange={e=>setFinalPrice(e.target.value)} placeholder="Ex. 450"/></div>
          <div className="mt-3 rounded-xl bg-background/60 p-3 text-xs text-muted-foreground">
            Validation client: <strong className="text-foreground">{selected.customer_approved===true?"Acceptée":selected.customer_approved===false?"Refusée":"En attente"}</strong>
            {selected.rating?<> · Note: <strong className="text-foreground">{selected.rating}/5</strong></>:null}
          </div>
        </Section>

        <Section tone="violet" icon={<Save className="h-5 w-5"/>} title="4 · Notes & pièces utilisées">
          <div><Label>Notes technicien / diagnostic</Label><Textarea className="mt-2 bg-background" rows={4} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Diagnostic, intervention, résultat des tests…"/></div>
          <div className="mt-3"><Label>Pièces utilisées</Label><Textarea className="mt-2 bg-background" rows={3} value={parts} onChange={e=>setParts(e.target.value)} placeholder="Une pièce par ligne"/></div>
        </Section>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap gap-2">
            <Button onClick={()=>void save()} disabled={busy}><Save className="mr-2 h-4 w-4"/>Enregistrer</Button>
            <Button variant="outline" onClick={()=>printBon(selected)}><ExternalLink className="mr-2 h-4 w-4"/>Bon + QR</Button>
            <Button variant="outline" onClick={()=>whatsapp(selected)}><MessageCircle className="mr-2 h-4 w-4"/>WhatsApp</Button>
            <a className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm" href={"tel:"+selected.phone}><Phone className="mr-2 h-4 w-4"/>Appeler</a>
          </div>
          {message&&<p className="mt-3 text-xs text-gold">{message}</p>}
        </div>
      </div>:<div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Sélectionnez une demande pour ouvrir son dossier.</div>}
    </div>
  </section>;
}

function Section({tone,icon,title,children}:{tone:"blue"|"amber"|"green"|"violet";icon:React.ReactNode;title:string;children:React.ReactNode}){
  const tones={blue:"border-blue-500/30 bg-blue-500/10",amber:"border-amber-500/30 bg-amber-500/10",green:"border-emerald-500/30 bg-emerald-500/10",violet:"border-violet-500/30 bg-violet-500/10"};
  return <section className={"rounded-2xl border p-5 "+tones[tone]}><div className="flex items-center gap-2"><span className="text-foreground">{icon}</span><h3 className="font-display font-semibold">{title}</h3></div><div className="mt-4">{children}</div></section>;
}
function MoneyField({label,value,setValue}:{label:string;value:string;setValue:(v:string)=>void}){return <div><Label>{label}</Label><Input className="mt-2 bg-background" type="number" min="0" value={value} onChange={e=>setValue(e.target.value)}/></div>}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-background/60 p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>}
