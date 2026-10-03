import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Gift, Minus, Plus, QrCode, RefreshCw, Save, Search, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseRest, supabaseRpc } from "@/lib/supabase";
import { formatMAD } from "@/lib/format";

type Customer = { user_id:string; full_name:string|null; phone:string|null; loyalty_points:number; loyalty_tier:string };
type Reward = { id:string; name:string; description:string|null; points_cost:number; discount_type:"fixed"|"percent"; discount_value:number; active:boolean; sort_order:number };
type Tier = { id:string; name:string; min_points:number; reward_label:string|null; sort_order:number; active:boolean };
type Tx = { id:string; points:number; balance_after:number; type:string; description:string|null; created_at:string };
type Settings = { id:string; points_per_10_mad:number; min_purchase_mad:number; welcome_points:number };

const qrValue = (userId:string) => "OROLOYALTY:" + userId;
const qrUrl = (userId:string) => "https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=" + encodeURIComponent(qrValue(userId));

export function AdminLoyaltyPanel() {
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [rewards,setRewards]=useState<Reward[]>([]);
  const [tiers,setTiers]=useState<Tier[]>([]);
  const [settings,setSettings]=useState<Settings|null>(null);
  const [selected,setSelected]=useState<Customer|null>(null);
  const [history,setHistory]=useState<Tx[]>([]);
  const [search,setSearch]=useState("");
  const [amount,setAmount]=useState(10);
  const [reason,setReason]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [scannerOpen,setScannerOpen]=useState(false);
  const [scannerError,setScannerError]=useState("");
  const [rewardForm,setRewardForm]=useState<Reward>({id:"",name:"",description:"",points_cost:100,discount_type:"fixed",discount_value:20,active:true,sort_order:1});
  const videoRef=useRef<HTMLVideoElement|null>(null);
  const streamRef=useRef<MediaStream|null>(null);

  const load=async()=>{
    setBusy(true); setError("");
    try {
      const [c,r,t,s]=await Promise.all([
        supabaseRest<Customer[]>("customer_profiles",{query:"?select=user_id,full_name,phone,loyalty_points,loyalty_tier&order=updated_at.desc"}),
        supabaseRest<Reward[]>("loyalty_rewards",{query:"?select=*&order=sort_order.asc,created_at.desc"}),
        supabaseRest<Tier[]>("loyalty_tiers",{query:"?select=*&order=min_points.asc"}),
        supabaseRest<Settings[]>("loyalty_settings",{query:"?select=*&limit=1"}),
      ]);
      setCustomers(c||[]); setRewards(r||[]); setTiers(t||[]); setSettings(s?.[0]||null);
      if(selected){ const fresh=(c||[]).find(x=>x.user_id===selected.user_id); if(fresh){setSelected(fresh);await loadHistory(fresh.user_id);} }
    } catch(e){setError(e instanceof Error?e.message:"Erreur de chargement fidélité.");}
    finally{setBusy(false);}
  };
  const loadHistory=async(userId:string)=>{
    try{setHistory(await supabaseRest<Tx[]>("loyalty_transactions",{query:"?select=id,points,balance_after,type,description,created_at&user_id=eq."+encodeURIComponent(userId)+"&order=created_at.desc&limit=50"}));}
    catch(e){setError(e instanceof Error?e.message:"Impossible de charger l'historique.");}
  };
  useEffect(()=>{void load();},[]);

  const filtered=useMemo(()=>customers.filter(c=>((c.full_name||"")+" "+(c.phone||"")+" "+c.loyalty_tier).toLowerCase().includes(search.toLowerCase())),[customers,search]);

  const selectCustomer=async(c:Customer)=>{setSelected(c);setMessage("");await loadHistory(c.user_id);};
  const adjust=async(delta:number)=>{
    if(!selected||delta===0)return;
    setBusy(true);setError("");setMessage("");
    try{
      const fresh=await supabaseRpc<Customer>("admin_adjust_loyalty_points",{p_user_id:selected.user_id,p_points:delta,p_reason:reason.trim()||null});
      setCustomers(prev=>prev.map(c=>c.user_id===fresh.user_id?fresh:c));setSelected(fresh);setAmount(10);setReason("");await loadHistory(fresh.user_id);
      setMessage(delta>0?"Points ajoutés.":"Points retirés.");
    }catch(e){setError(e instanceof Error?e.message:"Impossible de modifier les points.");}finally{setBusy(false);}
  };
  const saveSettings=async()=>{
    if(!settings)return;
    setBusy(true);setError("");
    try{await supabaseRest("loyalty_settings",{method:"PATCH",query:"?id=eq."+settings.id,body:{points_per_10_mad:Math.max(0,Math.floor(settings.points_per_10_mad)),min_purchase_mad:Math.max(0,Number(settings.min_purchase_mad)||0),welcome_points:Math.max(0,Math.floor(settings.welcome_points))}});setMessage("Paramètres fidélité enregistrés.");}
    catch(e){setError(e instanceof Error?e.message:"Impossible d'enregistrer les paramètres.");}finally{setBusy(false);}
  };
  const saveReward=async()=>{
    if(!rewardForm.name.trim()||rewardForm.points_cost<=0||rewardForm.discount_value<=0){setError("Complétez correctement la récompense.");return;}
    setBusy(true);setError("");
    try{
      const body={name:rewardForm.name.trim(),description:rewardForm.description?.trim()||null,points_cost:Math.floor(rewardForm.points_cost),discount_type:rewardForm.discount_type,discount_value:Number(rewardForm.discount_value),active:rewardForm.active,sort_order:Math.floor(rewardForm.sort_order)||0};
      if(rewardForm.id) await supabaseRest("loyalty_rewards",{method:"PATCH",query:"?id=eq."+rewardForm.id,body});
      else await supabaseRest("loyalty_rewards",{method:"POST",body});
      setRewardForm({id:"",name:"",description:"",points_cost:100,discount_type:"fixed",discount_value:20,active:true,sort_order:1});
      await load();setMessage("Récompense enregistrée.");
    }catch(e){setError(e instanceof Error?e.message:"Impossible d'enregistrer la récompense.");}finally{setBusy(false);}
  };
  const deleteReward=async(id:string)=>{
    if(!window.confirm("Supprimer cette récompense ?"))return;
    setBusy(true);try{await supabaseRest("loyalty_rewards",{method:"DELETE",query:"?id=eq."+id});await load();}catch(e){setError(e instanceof Error?e.message:"Impossible de supprimer la récompense.");}finally{setBusy(false);}
  };
  const markRedemptionUsed=async(id:string)=>{
    setBusy(true);try{await supabaseRest("loyalty_redemptions",{method:"PATCH",query:"?id=eq."+id,body:{status:"used",used_at:new Date().toISOString()}});setMessage("Bon marqué comme utilisé.");}catch(e){setError(e instanceof Error?e.message:"Impossible de mettre à jour le bon.");}finally{setBusy(false);}
  };

  const stopScanner=()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setScannerOpen(false);};
  const startScanner=async()=>{
    setScannerError("");setScannerOpen(true);
    try{
      const Detector=(window as any).BarcodeDetector;
      if(!Detector) throw new Error("La lecture QR native n'est pas disponible sur ce navigateur. Utilisez la saisie manuelle du code client.");
      const supported=typeof Detector.getSupportedFormats==="function"?await Detector.getSupportedFormats():["qr_code"];
      if(!supported.includes("qr_code")) throw new Error("Le navigateur ne prend pas en charge les QR codes.");
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      const detector=new Detector({formats:["qr_code"]});
      const scan=async()=>{
        if(!streamRef.current||!videoRef.current||videoRef.current.readyState<2){if(streamRef.current)requestAnimationFrame(scan);return;}
        try{
          const codes=await detector.detect(videoRef.current);
          const raw=codes?.[0]?.rawValue||"";
          if(raw.startsWith("OROLOYALTY:")){
            const id=raw.slice("OROLOYALTY:".length).trim();
            const found=customers.find(c=>c.user_id===id);
            if(found){await selectCustomer(found);stopScanner();return;}
            setScannerError("Client introuvable pour ce QR code.");stopScanner();return;
          }
        }catch{}
        if(streamRef.current) window.setTimeout(()=>void scan(),350);
      };
      void scan();
    }catch(e){setScannerError(e instanceof Error?e.message:"Impossible d'ouvrir la caméra.");}
  };
  useEffect(()=>()=>stopScanner(),[]);

  const rewardLabel=(r:Reward)=>r.discount_type==="percent"?r.discount_value+" %":"-"+formatMAD(Number(r.discount_value));
  return <section className="space-y-6">
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-display text-xl font-semibold">Programme fidélité</h2><p className="mt-1 text-xs text-muted-foreground">Points, niveaux, QR client et opérations.</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={()=>void startScanner()}><Camera className="mr-2 h-4 w-4"/>Scanner QR</Button><Button variant="outline" onClick={()=>void load()} disabled={busy}><RefreshCw className="mr-2 h-4 w-4"/>Actualiser</Button></div>
        </div>
        {error&&<p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        {message&&<p className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm text-gold">{message}</p>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9 bg-surface" placeholder="Rechercher un client…" value={search} onChange={e=>setSearch(e.target.value)}/></div>{selected&&<Button variant="ghost" onClick={()=>{setSelected(null);setHistory([])}}><X className="mr-1 h-4 w-4"/>Fermer</Button>}</div>
        <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-border">
          {filtered.map(c=><button type="button" key={c.user_id} onClick={()=>void selectCustomer(c)} className={"flex w-full items-center justify-between gap-3 border-b border-border p-4 text-left last:border-0 hover:bg-surface "+(selected?.user_id===c.user_id?"bg-gold/5":"")}>
            <div className="min-w-0"><p className="truncate font-medium">{c.full_name||"Client"}</p><p className="text-xs text-muted-foreground">{c.phone||"Téléphone non renseigné"} · {c.loyalty_tier}</p></div>
            <strong className="shrink-0 text-gold">{c.loyalty_points} pts</strong>
          </button>)}
          {filtered.length===0&&<p className="p-6 text-sm text-muted-foreground">Aucun client trouvé.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-card p-5">
        <div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-gold"/><h2 className="font-display text-lg font-semibold">Fiche fidélité</h2></div>
        {!selected?<p className="mt-6 text-sm text-muted-foreground">Sélectionnez un client ou scannez son QR.</p>:<div className="mt-5 space-y-4">
          <div className="flex items-center gap-4"><img src={qrUrl(selected.user_id)} alt="QR fidélité" className="h-28 w-28 rounded-lg border border-border bg-white p-1"/><div><p className="font-semibold">{selected.full_name||"Client"}</p><p className="text-sm text-muted-foreground">{selected.loyalty_tier}</p><p className="mt-1 font-display text-2xl font-bold text-gold">{selected.loyalty_points} pts</p></div></div>
          <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Opération points</p><div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr]"><Input type="number" min={1} value={amount} onChange={e=>setAmount(Math.max(1,Number(e.target.value)||1))}/><Input placeholder="Motif (optionnel)" value={reason} onChange={e=>setReason(e.target.value)}/></div><div className="mt-3 grid grid-cols-2 gap-2"><Button onClick={()=>void adjust(amount)} disabled={busy}><Plus className="mr-2 h-4 w-4"/>Ajouter</Button><Button variant="outline" onClick={()=>void adjust(-amount)} disabled={busy}><Minus className="mr-2 h-4 w-4"/>Retirer</Button></div></div>
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Historique récent</p><div className="mt-2 max-h-48 overflow-auto rounded-xl border border-border">{history.length?history.map(t=><div key={t.id} className="flex items-center justify-between gap-3 border-b border-border p-3 text-sm last:border-0"><div><p>{t.description||t.type}</p><p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("fr-MA")}</p></div><span className={t.points>0?"text-emerald-400":"text-destructive"}>{t.points>0?"+":""}{t.points} · {t.balance_after}</span></div>):<p className="p-4 text-xs text-muted-foreground">Aucun mouvement.</p>}</div></div>
        </div>}
      </div>
    </div>

    {scannerOpen&&<div className="rounded-2xl border border-gold/30 bg-card p-5"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Scanner le QR client</h2><Button variant="ghost" onClick={stopScanner}><X className="h-4 w-4"/></Button></div><div className="mt-4 overflow-hidden rounded-xl bg-black"><video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted/></div>{scannerError&&<p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{scannerError}</p>}<p className="mt-3 text-xs text-muted-foreground">Autorisez la caméra et présentez le QR du client devant l'objectif.</p></div>}

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Star className="h-5 w-5 text-gold"/><h2 className="font-display text-lg font-semibold">Niveaux</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{tiers.map(t=><div key={t.id} className="rounded-xl border border-border bg-surface p-4"><div className="flex items-center justify-between"><strong>{t.name}</strong><span className="text-xs text-gold">{t.min_points}+ pts</span></div><p className="mt-1 text-xs text-muted-foreground">{t.reward_label||"Avantages fidélité"}</p></div>)}</div></div>
      <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Save className="h-5 w-5 text-gold"/><h2 className="font-display text-lg font-semibold">Règles</h2></div>{settings&&<div className="mt-4 grid gap-3 sm:grid-cols-3"><div><Label>Points / 10 MAD</Label><Input className="mt-2 bg-surface" type="number" min={0} value={settings.points_per_10_mad} onChange={e=>setSettings({...settings,points_per_10_mad:Number(e.target.value)||0})}/></div><div><Label>Achat minimum</Label><Input className="mt-2 bg-surface" type="number" min={0} value={settings.min_purchase_mad} onChange={e=>setSettings({...settings,min_purchase_mad:Number(e.target.value)||0})}/></div><div><Label>Points bienvenue</Label><Input className="mt-2 bg-surface" type="number" min={0} value={settings.welcome_points} onChange={e=>setSettings({...settings,welcome_points:Number(e.target.value)||0})}/></div><Button className="sm:col-span-3" onClick={()=>void saveSettings()} disabled={busy}><Save className="mr-2 h-4 w-4"/>Enregistrer les règles</Button></div>}</div>
    </div>

    <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Récompenses</h2><p className="mt-1 text-xs text-muted-foreground">Les clients échangent leurs points contre des bons.</p></div><Gift className="h-5 w-5 text-gold"/></div><div className="mt-4 grid gap-3 lg:grid-cols-[1fr_360px]"><div className="divide-y divide-border rounded-xl border border-border">{rewards.map(r=><div key={r.id} className="flex items-center justify-between gap-3 p-4"><div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.points_cost} pts · {rewardLabel(r)} · {r.active?"Active":"Masquée"}</p>{r.description&&<p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}</div><div className="flex gap-1"><Button size="sm" variant="outline" onClick={()=>setRewardForm(r)}>Modifier</Button><Button size="sm" variant="ghost" onClick={()=>void deleteReward(r.id)}>Supprimer</Button></div></div>)}{rewards.length===0&&<p className="p-5 text-sm text-muted-foreground">Aucune récompense.</p>}</div><div className="rounded-xl border border-border bg-surface p-4 space-y-3"><h3 className="font-semibold">{rewardForm.id?"Modifier":"Ajouter"} une récompense</h3><Input placeholder="Nom" value={rewardForm.name} onChange={e=>setRewardForm({...rewardForm,name:e.target.value})}/><TextareaCompat value={rewardForm.description||""} onChange={v=>setRewardForm({...rewardForm,description:v})}/><div className="grid grid-cols-2 gap-2"><Input type="number" min={1} value={rewardForm.points_cost} onChange={e=>setRewardForm({...rewardForm,points_cost:Number(e.target.value)||1})}/><Input type="number" min={0.01} value={rewardForm.discount_value} onChange={e=>setRewardForm({...rewardForm,discount_value:Number(e.target.value)||1})}/></div><select className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" value={rewardForm.discount_type} onChange={e=>setRewardForm({...rewardForm,discount_type:e.target.value as Reward["discount_type"]})}><option value="fixed">Réduction MAD</option><option value="percent">Réduction %</option></select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rewardForm.active} onChange={e=>setRewardForm({...rewardForm,active:e.target.checked})}/> Active</label><div className="flex gap-2"><Button onClick={()=>void saveReward()} disabled={busy}><Save className="mr-2 h-4 w-4"/>Enregistrer</Button>{rewardForm.id&&<Button variant="outline" onClick={()=>setRewardForm({id:"",name:"",description:"",points_cost:100,discount_type:"fixed",discount_value:20,active:true,sort_order:1})}>Annuler</Button>}</div></div></div></div>
  </section>;
}

function TextareaCompat({value,onChange}:{value:string;onChange:(v:string)=>void}){return <textarea className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50" value={value} onChange={e=>onChange(e.target.value)} placeholder="Description"/>;}
