import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, Camera, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Droplets, Home, MapPin, Phone, Search, ShieldCheck, Smartphone, Truck, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { moroccanCities, repairTypes } from "@/data/repair";
import { PHONE_CATALOG, PHONE_BRANDS } from "@/data/phone-catalog";
import { formatMAD } from "@/lib/format";
import { makeReference } from "@/lib/orders";
import { createRepairRequest, getRepairStatus, respondRepair, rateRepair, loadRepairServices, REPAIR_STATUSES, saveRepairLocal, uploadRepairPhoto, type RepairRequest, type RepairService, type RepairStatus } from "@/lib/repair-platform";

export const Route=createFileRoute("/reparation")({
  ssr:false,
  head:()=>({meta:[
    {title:"Réparation Smartphone & Diagnostic | OROTRONIX"},
    {name:"description",content:"Diagnostic et réparation professionnelle de smartphones au Maroc. Estimation, rendez-vous, collecte, suivi et garantie OROTRONIX."}
  ]}),
  component:RepairPage
});

type Mode="boutique"|"pickup"|"home";
const problems=[
  ["Écran cassé","Écran tactile, vitre, lignes ou taches","screen"],
  ["Batterie","Autonomie faible, extinction ou gonflement","battery"],
  ["Port de charge","Charge instable ou connecteur endommagé","charge"],
  ["Caméra","Photo floue, capteur noir ou autofocus","camera"],
  ["Audio / Micro","Son faible, grésillement ou micro","audio"],
  ["Logiciel","Blocage, lenteur, mise à jour ou système","software"],
  ["Dégâts des eaux","Oxydation, humidité ou liquide","water"],
  ["Ne s'allume plus","Aucune réaction, bootloop ou extinction","power"],
  ["Réseau / Wi-Fi","Réseau, Wi-Fi, Bluetooth ou signal","network"],
  ["Face ID / Biométrie","Face ID, Touch ID ou capteurs","biometric"],
  ["Boutons / Vibration","Power, volume ou vibration","buttons"],
  ["Autre problème","Diagnostic technique personnalisé","other"],
] as const;

function RepairPage(){
  const [tab,setTab]=useState<"diagnostic"|"track">("diagnostic");
  const [step,setStep]=useState(1);
  const [services,setServices]=useState<RepairService[]>([]);
  const [submitted,setSubmitted]=useState<RepairRequest|null>(null);
  const [trackRef,setTrackRef]=useState("");
  const [trackPhone,setTrackPhone]=useState("");
  const [tracked,setTracked]=useState<Record<string,unknown>|null>(null);
  const [tracking,setTracking]=useState(false);

  const [form,setForm]=useState({
    fullName:"",phone:"",email:"",city:"",address:"",brand:"",model:"",problemType:"",
    problemDescription:"",notes:"",mode:"boutique" as Mode,appointmentDate:"",appointmentTime:"",
    photos:[] as string[],pickup:false
  });
  const [photoBusy,setPhotoBusy]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({});

  useEffect(()=>{void loadRepairServices().then(setServices)},[]);
  const models=form.brand && form.brand!=="Autre marque" ? (PHONE_CATALOG[form.brand]||[]) : [];
  const matched=useMemo(()=>services.filter(s=>s.device_brand==="Tous"||s.device_brand===form.brand).filter(s=>s.device_model==="Tous"||s.device_model===form.model).filter(s=>s.service_name.toLowerCase().includes((form.problemType||"").toLowerCase())||!form.problemType),[services,form.brand,form.model,form.problemType]);
  const selectedProblem=problems.find(p=>p[0]===form.problemType);
  const estimate=matched[0] || services.find(s=>s.service_name===form.problemType);
  const fallback=repairTypes.find(x=>x.name===form.problemType);
  const estimatedPrice=estimate?Number(estimate.estimated_price):fallback?.from||0;
  const estimatedDuration=estimate?.repair_time||fallback?.duration||"Après diagnostic";

  const update=(k:keyof typeof form,v:string|string[]|boolean)=>setForm(f=>({...f,[k]:v}));
  const validate=()=>{
    const e:Record<string,string>={};
    if(step===1){if(!form.brand)e.brand="Choisissez une marque.";if(!form.model)e.model="Choisissez ou saisissez le modèle.";}
    if(step===2){if(!form.problemType)e.problemType="Choisissez la panne.";if(form.problemDescription.trim().length<10)e.problemDescription="Décrivez le problème en 10 caractères minimum.";}
    if(step===3){if(form.fullName.trim().length<3)e.fullName="Nom complet requis.";if(!/^[0-9 +()-]{9,20}$/.test(form.phone.trim()))e.phone="Numéro invalide.";if(!form.city)e.city="Ville requise.";if(form.address.trim().length<5)e.address="Adresse requise.";}
    setErrors(e);return Object.keys(e).length===0;
  };
  const next=()=>{if(validate())setStep(s=>Math.min(4,s+1))};
  const back=()=>{setErrors({});setStep(s=>Math.max(1,s-1))};

  const addPhotos=async(e:ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]).slice(0,5-form.photos.length);
    if(!files.length)return; setPhotoBusy(true);
    try{const urls:string[]=[];for(const f of files)urls.push(await uploadRepairPhoto(f));update("photos",[...form.photos,...urls]);}
    catch(err){toast.error(err instanceof Error?err.message:"Image impossible à ajouter.");}
    finally{setPhotoBusy(false);e.target.value=""}
  };

  const submit=async()=>{
    if(!validate())return;
    setPhotoBusy(true);
    try{
      const request:RepairRequest={reference:makeReference("REP"),createdAt:new Date().toISOString(),fullName:form.fullName.trim(),phone:form.phone.trim(),email:form.email.trim()||undefined,city:form.city,address:form.address.trim(),brand:form.brand,model:form.model,problemType:form.problemType,problemDescription:form.problemDescription.trim(),notes:form.notes.trim()||undefined,pickup:form.mode!=="boutique",serviceMode:form.mode,appointmentDate:form.appointmentDate||undefined,appointmentTime:form.appointmentTime||undefined,estimatedPrice,estimatedDuration,photos:form.photos};
      await createRepairRequest(request);saveRepairLocal(request);setSubmitted(request);toast.success("Demande créée",{description:request.reference});
    }catch(err){toast.error(err instanceof Error?err.message:"Impossible d'envoyer la demande.");}
    finally{setPhotoBusy(false)}
  };

  const track=async()=>{
    if(!trackRef.trim()||trackPhone.trim().length<9){toast.error("Référence et téléphone requis.");return}
    setTracking(true);setTracked(null);
    try{const r=await getRepairStatus(trackRef.trim(),trackPhone.trim());if(!r||Object.keys(r).length===0)toast.error("Aucune réparation trouvée.");else setTracked(r);}
    catch(err){toast.error(err instanceof Error?err.message:"Suivi indisponible.");}finally{setTracking(false)}
  };

  if(submitted)return <Success request={submitted} onNew={()=>{setSubmitted(null);setStep(1);setForm({...form,problemType:"",problemDescription:"",photos:[]})}}/>;

  return <main className="min-h-screen">
    <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,.13),transparent_42%)]">
      <div className="container-page py-14 lg:py-20">
        <p className="eyebrow">OROTRONIX · SERVICE TECHNIQUE</p>
        <div className="mt-4 max-w-4xl"><h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">Diagnostic & <span className="text-gradient-gold">réparation</span> professionnelle</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">Identifiez votre panne, obtenez une estimation, choisissez la prise en charge et suivez votre réparation de bout en bout.</p></div>
        <div className="mt-8 flex flex-wrap gap-3"><a href="#diagnostic" className="inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-black">Commencer le diagnostic</a><a href="https://wa.me/212656566366" className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold">WhatsApp</a><a href="tel:+212656566366" className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"><Phone className="mr-2 h-4 w-4"/>06 56 56 63 66</a></div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
          ["Diagnostic transparent","Prix final confirmé après contrôle","🔎"],["Pièces de qualité","Intervention soignée","🛠️"],["Suivi en ligne","Référence unique REP","📍"],["Garantie","Conditions affichées avant validation","🛡️"]
        ].map(([t,d,i])=><div key={t} className="rounded-2xl border border-border bg-card/70 p-4"><span className="text-xl">{i}</span><p className="mt-3 text-sm font-semibold">{t}</p><p className="mt-1 text-xs text-muted-foreground">{d}</p></div>)}</div>
      </div>
    </section>

    <section id="diagnostic" className="container-page py-12 lg:py-16">
      <div className="mb-7 flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2">
        <button onClick={()=>setTab("diagnostic")} className={"flex-1 rounded-xl px-4 py-3 text-sm font-semibold "+(tab==="diagnostic"?"bg-gold text-black":"text-muted-foreground")}>Diagnostic & réparation</button>
        <button onClick={()=>setTab("track")} className={"flex-1 rounded-xl px-4 py-3 text-sm font-semibold "+(tab==="track"?"bg-gold text-black":"text-muted-foreground")}>Suivre ma réparation</button>
      </div>
      {tab==="track"?<TrackPanel refValue={trackRef} phone={trackPhone} setRef={setTrackRef} setPhone={setTrackPhone} onTrack={track} loading={tracking} result={tracked}/>:<div>
        <div className="mb-7 flex items-center justify-between"><div><p className="eyebrow">Étape {step} / 4</p><h2 className="mt-2 font-display text-2xl font-bold">{["Votre appareil","Votre panne","Vos coordonnées","Récapitulatif"][step-1]}</h2></div><div className="hidden gap-1 sm:flex">{[1,2,3,4].map(x=><span key={x} className={"h-1.5 w-12 rounded-full "+(x<=step?"bg-gold":"bg-border")}/>)}</div></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            {step===1&&<StepDevice form={form} models={models} update={update} errors={errors}/>}
            {step===2&&<StepProblem form={form} update={update} errors={errors} addPhotos={addPhotos} photoBusy={photoBusy}/>}
            {step===3&&<StepContact form={form} update={update} errors={errors}/>}
            {step===4&&<Summary form={form} estimate={estimatedPrice} duration={estimatedDuration} problem={selectedProblem?.[1]||form.problemType}/>}
            <div className="mt-8 flex justify-between gap-3 border-t border-border pt-5">{step>1?<button type="button" onClick={back} className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"><ChevronLeft className="mr-2 h-4 w-4"/>Retour</button>:<span/>}{step<4?<button type="button" onClick={next} className="inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-black">Continuer<ChevronRight className="ml-2 h-4 w-4"/></button>:<button type="button" onClick={()=>void submit()} disabled={photoBusy} className="inline-flex h-11 items-center rounded-xl bg-gold px-6 text-sm font-semibold text-black">{photoBusy?"Envoi…":"Confirmer ma demande"}</button>}</div>
          </div>
          <EstimateCard price={estimatedPrice} duration={estimatedDuration} mode={form.mode} problem={form.problemType}/>
        </div>
      </div>}
    </section>

    <section className="border-y border-border bg-surface/30"><div className="container-page py-12"><div className="grid gap-4 md:grid-cols-3">{[
      [Truck,"Collecte & livraison","Nous récupérons votre appareil selon le créneau confirmé."],
      [Home,"Intervention à domicile","Disponible selon zone et disponibilité."],
      [ShieldCheck,"Contrôle & garantie","Contrôle qualité avant restitution et garantie selon réparation."]
    ].map(([Icon,title,text])=>{const I=Icon as typeof Truck;return <div key={String(title)} className="rounded-2xl border border-border bg-card p-6"><I className="h-6 w-6 text-gold"/><h3 className="mt-4 font-display font-semibold">{String(title)}</h3><p className="mt-2 text-sm text-muted-foreground">{String(text)}</p></div>})}</div></div></section>
    <FAQ/>
  </main>;
}

function StepDevice({form,models,update,errors}:{form:any;models:string[];update:(k:string,v:any)=>void;errors:Record<string,string>}){
 return <div className="space-y-6"><div><label className="text-sm font-semibold">Marque</label><select className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={form.brand} onChange={e=>{update("brand",e.target.value);update("model","")}}><option value="">Choisir une marque</option>{PHONE_BRANDS.map(x=><option key={x}>{x}</option>)}</select>{errors.brand&&<ErrorText t={errors.brand}/>}</div><div><label className="text-sm font-semibold">Modèle</label>{models.length?<select className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={form.model} onChange={e=>update("model",e.target.value)}><option value="">Choisir le modèle</option>{models.map(x=><option key={x}>{x}</option>)}</select>:<input className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={form.model} onChange={e=>update("model",e.target.value)} placeholder="Ex. iPhone 15 Pro"/>}{errors.model&&<ErrorText t={errors.model}/>}</div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-border bg-surface p-4"><Smartphone className="h-5 w-5 text-gold"/><p className="mt-2 text-sm font-semibold">Diagnostic visuel</p><p className="mt-1 text-xs text-muted-foreground">Ajoutez des photos à l'étape suivante.</p></div><div className="rounded-xl border border-border bg-surface p-4"><Search className="h-5 w-5 text-gold"/><p className="mt-2 text-sm font-semibold">Estimation automatique</p><p className="mt-1 text-xs text-muted-foreground">Selon modèle et service disponible.</p></div></div></div>
}
function StepProblem({form,update,errors,addPhotos,photoBusy}:{form:any;update:(k:string,v:any)=>void;errors:Record<string,string>;addPhotos:(e:ChangeEvent<HTMLInputElement>)=>void;photoBusy:boolean}){
 return <div><div className="grid gap-3 sm:grid-cols-2">{problems.map(([name,desc])=><button type="button" key={name} onClick={()=>update("problemType",name)} className={"rounded-2xl border p-4 text-left transition "+(form.problemType===name?"border-gold bg-gold/5":"border-border bg-surface hover:border-gold/40")}><div className="flex items-start gap-3"><Wrench className="mt-0.5 h-5 w-5 shrink-0 text-gold"/><div><p className="text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-muted-foreground">{desc}</p></div></div></button>)}</div>{errors.problemType&&<ErrorText t={errors.problemType}/>}<label className="mt-6 block"><span className="text-sm font-semibold">Décrivez exactement le problème</span><textarea className="mt-2 min-h-32 w-full rounded-xl border border-border bg-surface p-4 text-sm" value={form.problemDescription} onChange={e=>update("problemDescription",e.target.value)} placeholder="Ex. Le téléphone s'éteint après quelques minutes et redémarre seulement lorsqu'il est branché."/><span className="mt-1 block text-xs text-muted-foreground">Plus votre description est précise, plus le pré-diagnostic sera utile.</span></label>{errors.problemDescription&&<ErrorText t={errors.problemDescription}/>}<div className="mt-6 rounded-2xl border border-border bg-surface p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Photos du problème</p><p className="text-xs text-muted-foreground">Jusqu'à 5 images · 5 Mo chacune</p></div><label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-border px-4 text-xs font-semibold"><Camera className="mr-2 h-4 w-4"/>Ajouter<input hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={addPhotos}/></label></div>{photoBusy&&<p className="mt-3 text-xs text-muted-foreground">Téléversement…</p>}<div className="mt-3 flex flex-wrap gap-2">{(form.photos||[]).map((url:string,i:number)=><div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"><img src={url} alt="" className="h-full w-full object-cover"/><button type="button" className="absolute right-1 top-1 rounded-full bg-black/70 p-1" onClick={()=>update("photos",form.photos.filter((x:string)=>x!==url))}><X className="h-3 w-3"/></button></div>)}</div></div><label className="mt-5 block"><span className="text-sm font-semibold">Notes supplémentaires</span><textarea className="mt-2 w-full rounded-xl border border-border bg-surface p-3 text-sm" rows={3} value={form.notes} onChange={e=>update("notes",e.target.value)} placeholder="Disponibilité, chute, liquide, accessoires, etc."/></label></div>
}
function StepContact({form,update,errors}:{form:any;update:(k:string,v:any)=>void;errors:Record<string,string>}){
 return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><Input label="Nom complet" value={form.fullName} onChange={v=>update("fullName",v)} error={errors.fullName} placeholder="Ex. Salma Bennani"/><Input label="Téléphone" value={form.phone} onChange={v=>update("phone",v)} error={errors.phone} placeholder="06 00 00 00 00"/><Input label="E-mail (optionnel)" value={form.email} onChange={v=>update("email",v)} placeholder="vous@email.com"/><Select label="Ville" value={form.city} onChange={v=>update("city",v)} error={errors.city} options={moroccanCities}/></div><label className="block"><span className="text-sm font-semibold">Adresse</span><textarea className="mt-2 w-full rounded-xl border border-border bg-surface p-3 text-sm" rows={3} value={form.address} onChange={e=>update("address",e.target.value)} placeholder="Quartier, rue, numéro…"/>{errors.address&&<ErrorText t={errors.address}/>}</label><div><p className="text-sm font-semibold">Mode de prise en charge</p><div className="mt-3 grid gap-3 sm:grid-cols-3">{[["boutique","Déposer en boutique",Wrench],["pickup","Collecte & livraison",Truck],["home","À domicile",Home]].map(([id,title,Icon])=>{const I=Icon as typeof Wrench;return <button type="button" key={String(id)} onClick={()=>update("mode",String(id))} className={"rounded-2xl border p-4 text-left "+(form.mode===id?"border-gold bg-gold/5":"border-border bg-surface")}><I className="h-5 w-5 text-gold"/><p className="mt-3 text-sm font-semibold">{String(title)}</p></button>})}</div></div><div className="rounded-2xl border border-border bg-surface p-4"><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-gold"/><p className="text-sm font-semibold">Rendez-vous (optionnel)</p></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><input type="date" className="h-11 rounded-xl border border-border bg-background px-3 text-sm" min={new Date().toISOString().slice(0,10)} value={form.appointmentDate} onChange={e=>update("appointmentDate",e.target.value)}/><select className="h-11 rounded-xl border border-border bg-background px-3 text-sm" value={form.appointmentTime} onChange={e=>update("appointmentTime",e.target.value)}><option value="">Choisir une heure</option>{["10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(x=><option key={x}>{x}</option>)}</select></div></div></div>
}
function Summary({form,estimate,duration,problem}:{form:any;estimate:number;duration:string;problem:string}){return <div className="space-y-4"><div className="rounded-2xl border border-gold/30 bg-gold/5 p-5"><p className="text-xs uppercase tracking-wider text-gold">Estimation indicative</p><p className="mt-2 font-display text-3xl font-bold">{estimate>0?formatMAD(estimate):"Sur diagnostic"}</p><p className="mt-1 text-sm text-muted-foreground">Prix final confirmé après diagnostic technique.</p></div><div className="grid gap-3 sm:grid-cols-2">{[
  ["Appareil",form.brand+" · "+form.model],["Problème",problem],["Durée estimée",duration],["Prise en charge",form.mode==="boutique"?"Boutique":form.mode==="pickup"?"Collecte & livraison":"À domicile"],["Client",form.fullName],["Téléphone",form.phone]
].map(([a,b])=><div key={a} className="rounded-xl bg-surface p-4"><p className="text-xs text-muted-foreground">{a}</p><p className="mt-1 text-sm font-semibold">{b}</p></div>)}</div><div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">Avant intervention</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Le technicien réalise un diagnostic. Toute réparation dépassant l'estimation ou nécessitant une pièce différente est soumise à votre validation.</p></div></div>}
function EstimateCard({price,duration,mode,problem}:{price:number;duration:string;mode:Mode;problem:string}){return <aside className="h-fit rounded-2xl border border-gold/25 bg-card p-5 lg:sticky lg:top-24"><p className="text-xs uppercase tracking-wider text-muted-foreground">Pré-estimation</p><p className="mt-2 font-display text-3xl font-bold">{price>0?formatMAD(price):"Diagnostic"}</p><p className="mt-1 text-xs text-muted-foreground">{duration}</p><div className="mt-5 space-y-3 border-t border-border pt-4"><Row icon={<ShieldCheck/>} t="Prix final après diagnostic"/><Row icon={<Clock3/>} t="Créneau à confirmer"/><Row icon={<CheckCircle2/>} t="Contrôle qualité"/><Row icon={<Truck/>} t={mode==="boutique"?"Dépôt en boutique":mode==="pickup"?"Collecte & livraison":"À domicile"}/></div>{problem&&<div className="mt-5 rounded-xl bg-surface p-3 text-xs"><strong>{problem}</strong><p className="mt-1 text-muted-foreground">Sélectionnez un service adapté à votre panne.</p></div>}</aside>}
function Row({icon,t}:{icon:ReactNode;t:string}){return <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="text-gold [&_svg]:h-4 [&_svg]:w-4">{icon}</span>{t}</div>}
function Input({label,value,onChange,error,placeholder}:{label:string;value:string;onChange:(v:string)=>void;error?:string;placeholder?:string}){return <label className="block"><span className="text-sm font-semibold">{label}</span><input className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>{error&&<ErrorText t={error}/>}</label>}
function Select({label,value,onChange,error,options}:{label:string;value:string;onChange:(v:string)=>void;error?:string;options:string[]}){return <label className="block"><span className="text-sm font-semibold">{label}</span><select className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={value} onChange={e=>onChange(e.target.value)}><option value="">Choisir</option>{options.map(x=><option key={x}>{x}</option>)}</select>{error&&<ErrorText t={error}/>}</label>}
function ErrorText({t}:{t:string}){return <span className="mt-1 block text-xs text-destructive">{t}</span>}
function TrackPanel({refValue,phone,setRef,setPhone,onTrack,loading,result}:{refValue:string;phone:string;setRef:(v:string)=>void;setPhone:(v:string)=>void;onTrack:()=>void;loading:boolean;result:Record<string,unknown>|null}){const status=String(result?.status||"received") as RepairStatus;return <div className="rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="max-w-xl"><Search className="h-7 w-7 text-gold"/><h2 className="mt-4 font-display text-2xl font-bold">Suivre ma réparation</h2><p className="mt-2 text-sm text-muted-foreground">Saisissez votre référence et le téléphone utilisé lors de la demande.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Input label="Référence" value={refValue} onChange={setRef} placeholder="REP-20260928-1234"/><Input label="Téléphone" value={phone} onChange={setPhone} placeholder="06 00 00 00 00"/></div><button onClick={onTrack} disabled={loading} className="mt-4 h-11 rounded-xl bg-gold px-5 text-sm font-semibold text-black">{loading?"Recherche…":"Voir le suivi"}</button></div>{result&&<div className="mt-8 border-t border-border pt-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">{result.reference as string}</p><h3 className="mt-1 font-display text-xl font-semibold">{result.brand as string} · {result.model as string}</h3></div><span className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-semibold text-gold">{REPAIR_STATUSES[status]||status}</span></div><div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(REPAIR_STATUSES).map(([key,label])=><div key={key} className={"rounded-xl p-3 text-xs "+(key===status?"border border-gold bg-gold/5":"border border-border bg-surface")}><p className="font-semibold">{label}</p></div>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{[["Estimation",Number(result.estimated_price||0)>0?formatMAD(Number(result.estimated_price)): "Diagnostic"],["Prix final",result.final_price?formatMAD(Number(result.final_price)):"À confirmer"],["Durée",String(result.estimated_duration||"—")],["Prise en charge",String(result.service_mode||"boutique")]].map(([a,b])=><div key={a} className="rounded-xl bg-surface p-4"><p className="text-xs text-muted-foreground">{a}</p><p className="mt-1 text-sm font-semibold">{b}</p></div>)}</div></div>}</div>}
function Success({request,onNew}:{request:RepairRequest;onNew:()=>void}){const wa="https://wa.me/212656566366?text="+encodeURIComponent("Bonjour OROTRONIX, je viens de créer la demande "+request.reference+".");return <section className="container-page py-16"><div className="mx-auto max-w-2xl rounded-3xl border border-gold/35 bg-card p-7 text-center sm:p-10"><CheckCircle2 className="mx-auto h-14 w-14 text-gold"/><p className="mt-5 text-xs uppercase tracking-widest text-gold">Demande enregistrée</p><h2 className="mt-2 font-display text-3xl font-bold">Votre réparation est créée</h2><p className="mt-3 text-sm text-muted-foreground">Conservez votre référence pour suivre la réparation.</p><div className="mx-auto mt-6 max-w-sm rounded-2xl bg-surface p-5"><p className="text-xs text-muted-foreground">Référence</p><p className="mt-1 font-mono text-2xl font-bold text-gold">{request.reference}</p></div><div className="mt-6 flex flex-wrap justify-center gap-3"><a href="#diagnostic" onClick={onNew} className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold">Nouvelle demande</a><a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-black">WhatsApp</a></div></div></section>}
function FAQ(){return <section className="container-page py-14"><p className="eyebrow">Questions fréquentes</p><div className="mt-5 grid gap-3 md:grid-cols-2">{[
["Le prix affiché est-il définitif?","Non. Il s'agit d'une pré-estimation. Le prix final est confirmé après diagnostic technique."],
["Puis-je envoyer des photos?","Oui, jusqu'à 5 photos peuvent être ajoutées pour aider au pré-diagnostic."],
["Puis-je choisir la collecte?","Oui, sélectionnez Collecte & livraison. L'équipe confirme ensuite la zone et le créneau."],
["Combien de temps prend la réparation?","La durée affichée est indicative et dépend de la panne, du modèle et de la disponibilité des pièces."],
["Comment suivre ma réparation?","Utilisez votre référence REP et le même numéro de téléphone dans l'onglet Suivre ma réparation."],
["Y a-t-il une garantie?","Les conditions de garantie sont communiquées selon la réparation et avant validation finale."]
].map(([q,a])=><details key={q} className="rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{a}</p></details>)}</div></section>}
