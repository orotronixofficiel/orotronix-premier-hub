import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save, Trash2, Plus } from "lucide-react";
import { supabaseRest } from "@/lib/supabase";

type Part={id:string;name:string;sku:string|null;supplier:string|null;cost_price:number;sale_price:number;stock_quantity:number;low_stock_threshold:number;active:boolean};

const empty={name:"",sku:"",supplier:"",cost_price:0,sale_price:0,stock_quantity:0,low_stock_threshold:2,active:true};

export function RepairPartsPanel(){
 const [rows,setRows]=useState<Part[]>([]);const [edit,setEdit]=useState<Part|typeof empty>(empty);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");
 const load=async()=>{setBusy(true);try{setRows(await supabaseRest<Part[]>("repair_parts",{query:"?select=*&order=name.asc"}))}catch(e){setMsg(e instanceof Error?e.message:"Chargement impossible")}finally{setBusy(false)}};
 useEffect(()=>{void load()},[]);
 const save=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMsg("");try{const body={...edit,cost_price:Number(edit.cost_price)||0,sale_price:Number(edit.sale_price)||0,stock_quantity:Math.max(0,Math.floor(Number(edit.stock_quantity)||0)),low_stock_threshold:Math.max(0,Math.floor(Number(edit.low_stock_threshold)||0))};if("id" in edit)await supabaseRest("repair_parts",{method:"PATCH",query:"?id=eq."+edit.id,body,prefer:"return=minimal"});else await supabaseRest("repair_parts",{method:"POST",body,prefer:"return=minimal"});setEdit(empty);setMsg("Pièce enregistrée.");await load()}catch(e){setMsg(e instanceof Error?e.message:"Enregistrement impossible")}finally{setBusy(false)}};
 const remove=async(id:string)=>{if(!confirm("Supprimer cette pièce ?"))return;await supabaseRest("repair_parts",{method:"DELETE",query:"?id=eq."+id});await load()};
 return <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
  <form onSubmit={save} className="h-fit rounded-2xl border border-border bg-card p-6 space-y-4">
   <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">{("id" in edit)?"Modifier la pièce":"Nouvelle pièce"}</h2><button type="button" onClick={()=>setEdit(empty)} className="text-xs text-muted-foreground">Réinitialiser</button></div>
   <div><Label>Nom</Label><Input className="mt-2 bg-surface" value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})} required/></div>
   <div className="grid grid-cols-2 gap-3"><div><Label>SKU</Label><Input className="mt-2 bg-surface" value={edit.sku||""} onChange={e=>setEdit({...edit,sku:e.target.value})}/></div><div><Label>Fournisseur</Label><Input className="mt-2 bg-surface" value={edit.supplier||""} onChange={e=>setEdit({...edit,supplier:e.target.value})}/></div></div>
   <div className="grid grid-cols-2 gap-3"><div><Label>Coût achat</Label><Input className="mt-2 bg-surface" type="number" min="0" value={edit.cost_price} onChange={e=>setEdit({...edit,cost_price:Number(e.target.value)||0})}/></div><div><Label>Prix vente</Label><Input className="mt-2 bg-surface" type="number" min="0" value={edit.sale_price} onChange={e=>setEdit({...edit,sale_price:Number(e.target.value)||0})}/></div></div>
   <div className="grid grid-cols-2 gap-3"><div><Label>Stock</Label><Input className="mt-2 bg-surface" type="number" min="0" value={edit.stock_quantity} onChange={e=>setEdit({...edit,stock_quantity:Number(e.target.value)||0})}/></div><div><Label>Seuil faible</Label><Input className="mt-2 bg-surface" type="number" min="0" value={edit.low_stock_threshold} onChange={e=>setEdit({...edit,low_stock_threshold:Number(e.target.value)||0})}/></div></div>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={e=>setEdit({...edit,active:e.target.checked})}/> Pièce active</label>
   <Button className="w-full" disabled={busy}><Save className="mr-2 h-4 w-4"/>Enregistrer</Button>{msg&&<p className="text-xs text-gold">{msg}</p>}
  </form>
  <div className="rounded-2xl border border-border bg-card">
   <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-display text-lg font-semibold">Stock pièces</h2><p className="mt-1 text-xs text-muted-foreground">Pièces utilisées dans les réparations et seuils d’alerte.</p></div><Button variant="outline" onClick={()=>void load()} disabled={busy}><RefreshCw className="mr-2 h-4 w-4"/>Actualiser</Button></div>
   <div className="divide-y divide-border">{rows.map(p=><div key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku||"Sans SKU"}{p.supplier?" · "+p.supplier:""}</p></div><div className="flex items-center gap-4 text-sm"><span className={p.stock_quantity<=p.low_stock_threshold?"text-gold":""}>Stock: {p.stock_quantity}</span><span>{Number(p.cost_price||0).toLocaleString("fr-MA")} MAD</span><button onClick={()=>setEdit(p)} className="text-gold">Modifier</button><button onClick={()=>void remove(p.id)} className="text-destructive"><Trash2 className="h-4 w-4"/></button></div></div>)}{!rows.length&&<div className="p-8 text-center text-sm text-muted-foreground">Aucune pièce enregistrée.</div>}</div>
  </div>
 </section>
}
