import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Gift, History, QrCode, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabaseRest, supabaseRpc } from "@/lib/supabase";
import { formatMAD } from "@/lib/format";

type Profile = { user_id:string; loyalty_points:number; loyalty_tier:string };
type Reward = { id:string; name:string; description:string|null; points_cost:number; discount_type:"fixed"|"percent"; discount_value:number; active:boolean };
type Tx = { id:string; points:number; balance_after:number; type:string; description:string|null; created_at:string };
type Redemption = { id:string; reward_id:string; points_spent:number; discount_type:"fixed"|"percent"; discount_value:number; status:string; code:string|null; created_at:string; used_at:string|null };
type Tier = { name:string; min_points:number; reward_label:string|null; sort_order:number; active:boolean };

const qrUrl=(userId:string)=>"https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data="+encodeURIComponent("OROLOYALTY:"+userId);

export function CustomerLoyaltyPanel({profile,onProfileChange}:{profile:Profile|null;onProfileChange:(p:Profile)=>void}) {
  const [rewards,setRewards]=useState<Reward[]>([]);
  const [tiers,setTiers]=useState<Tier[]>([]);
  const [history,setHistory]=useState<Tx[]>([]);
  const [redemptions,setRedemptions]=useState<Redemption[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  const load=async()=>{
    if(!profile?.user_id)return;
    try{
      const [r,t,h,d]=await Promise.all([
        supabaseRest<Reward[]>("loyalty_rewards",{query:"?select=*&active=eq.true&order=sort_order.asc"}),
        supabaseRest<Tier[]>("loyalty_tiers",{query:"?select=*&active=eq.true&order=min_points.asc"}),
        supabaseRest<Tx[]>("loyalty_transactions",{query:"?select=id,points,balance_after,type,description,created_at&user_id=eq."+encodeURIComponent(profile.user_id)+"&order=created_at.desc&limit=30"}),
        supabaseRest<Redemption[]>("loyalty_redemptions",{query:"?select=id,reward_id,points_spent,discount_type,discount_value,status,code,created_at,used_at&user_id=eq."+encodeURIComponent(profile.user_id)+"&order=created_at.desc&limit=20"})
      ]);
      setRewards(r||[]);setTiers(t||[]);setHistory(h||[]);setRedemptions(d||[]);
    }catch(e){setError(e instanceof Error?e.message:"Impossible de charger la fidélité.");}
  };
  useEffect(()=>{void load();},[profile?.user_id]);

  const currentTier=useMemo(()=>[...tiers].reverse().find(t=>t.min_points<=Number(profile?.loyalty_points||0))||tiers[0], [tiers,profile?.loyalty_points]);
  const nextTier=useMemo(()=>tiers.find(t=>t.min_points>Number(profile?.loyalty_points||0)),[tiers,profile?.loyalty_points]);
  const progress=nextTier&&currentTier?Math.min(100,Math.max(0,((Number(profile?.loyalty_points||0)-currentTier.min_points)/(nextTier.min_points-currentTier.min_points))*100)):100;

  const redeem=async(reward:Reward)=>{
    if(!profile||profile.loyalty_points<reward.points_cost)return;
    if(!window.confirm("Échanger "+reward.points_cost+" points contre « "+reward.name+" » ?"))return;
    setBusy(true);setError("");setMessage("");
    try{
      await supabaseRpc<Redemption>("redeem_loyalty_reward",{p_reward_id:reward.id});
      const fresh=await supabaseRest<Profile[]>("customer_profiles",{query:"?select=user_id,loyalty_points,loyalty_tier&user_id=eq."+encodeURIComponent(profile.user_id)});
      if(fresh[0])onProfileChange(fresh[0]);
      await load();setMessage("Récompense obtenue. Conservez le code pour l'utiliser en boutique.");
    }catch(e){setError(e instanceof Error?e.message:"Impossible d'échanger la récompense.");}
    finally{setBusy(false);}
  };

  if(!profile)return null;
  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><Star className="h-5 w-5 text-gold"/><p className="text-xs uppercase tracking-[0.2em] text-gold">Fidélité OROTRONIX</p></div><h2 className="mt-2 font-display text-3xl font-bold">{profile.loyalty_points} points</h2><p className="mt-1 text-sm text-muted-foreground">Niveau {currentTier?.name||profile.loyalty_tier}</p></div>
          <div className="rounded-xl border border-border bg-background p-2"><img src={qrUrl(profile.user_id)} alt="Mon QR fidélité" className="h-36 w-36 rounded-lg"/></div>
        </div>
        {nextTier&&<div className="mt-5"><div className="flex justify-between text-xs text-muted-foreground"><span>{currentTier?.name}</span><span>{nextTier.name} · {nextTier.min_points} pts</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-gold transition-all" style={{width:progress+"%"}}/></div><p className="mt-2 text-xs text-muted-foreground">{Math.max(0,nextTier.min_points-profile.loyalty_points)} points pour atteindre {nextTier.name}.</p></div>}
        <p className="mt-4 text-xs text-muted-foreground">Présentez ce QR en boutique pour être identifié rapidement.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-gold"/><h2 className="font-display text-lg font-semibold">Mon QR fidélité</h2></div><p className="mt-3 text-sm text-muted-foreground">Votre QR est personnel. Ne le partagez pas avec une autre personne.</p><Button variant="outline" className="mt-5 w-full" onClick={()=>window.open(qrUrl(profile.user_id),"_blank","noopener,noreferrer")}>Ouvrir le QR en grand</Button></div>
    </div>

    {error&&<p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
    {message&&<p className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-gold">{message}</p>}

    <div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-gold"/><h2 className="font-display text-xl font-semibold">Récompenses</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rewards.map(r=><div key={r.id} className="rounded-xl border border-border bg-surface p-4"><p className="font-semibold">{r.name}</p><p className="mt-1 text-xs text-muted-foreground">{r.description||"Récompense fidélité"}</p><p className="mt-3 text-sm text-gold">{r.points_cost} pts · {r.discount_type==="percent"?r.discount_value+" %":"-"+formatMAD(Number(r.discount_value))}</p><Button className="mt-4 w-full" disabled={busy||profile.loyalty_points<r.points_cost} onClick={()=>void redeem(r)}>{profile.loyalty_points>=r.points_cost?"Échanger mes points":"Points insuffisants"}</Button></div>)}{rewards.length===0&&<p className="text-sm text-muted-foreground">Aucune récompense disponible pour le moment.</p>}</div></div>

    {redemptions.length>0&&<div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-gold"/><h2 className="font-display text-xl font-semibold">Mes bons</h2></div><div className="mt-4 space-y-3">{redemptions.map(r=><div key={r.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{r.code||"Bon fidélité"}</p><p className="text-xs text-muted-foreground">{r.discount_type==="percent"?r.discount_value+" %":"-"+formatMAD(Number(r.discount_value))} · {r.status==="used"?"Utilisé":"Disponible"}</p></div><span className="font-mono text-sm text-gold">{r.code||"—"}</span></div>)}</div></div>}

    <div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><History className="h-5 w-5 text-gold"/><h2 className="font-display text-xl font-semibold">Historique des points</h2></div><div className="mt-4 divide-y divide-border rounded-xl border border-border">{history.map(t=><div key={t.id} className="flex items-center justify-between gap-3 p-4"><div><p className="text-sm">{t.description||t.type}</p><p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("fr-MA")}</p></div><div className="text-right"><p className={t.points>0?"text-emerald-400":"text-destructive"}>{t.points>0?"+":""}{t.points} pts</p><p className="text-xs text-muted-foreground">Solde {t.balance_after}</p></div></div>)}{history.length===0&&<p className="p-5 text-sm text-muted-foreground">Aucun mouvement pour le moment.</p>}</div></div>
  </div>;
}
