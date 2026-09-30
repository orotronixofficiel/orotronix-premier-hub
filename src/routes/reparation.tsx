import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Camera, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Home, Phone, Search, ShieldCheck, Truck, Wrench, X } from "lucide-react";
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
    {name:"description",content:"Demande de réparation, pré-diagnostic, suivi et validation finale chez OROTRONIX."}
  ]}),
  component:RepairPage
});

type Mode="boutique"|"pickup"|"home";
type FormData={
  fullName:string;phone:string;email:string;city:string;address:string;brand:string;model:string;
  problemType:string;problemDescription:string;notes:string;mode:Mode;appointmentDate:string;
  appointmentTime:string;photos:string[];
};

const problems=[
  ["Écran cassé","Vitre, tactile, lignes ou taches"],
  ["Batterie","Autonomie faible, extinction ou gonflement"],
  ["Port de charge","Charge instable ou connecteur endommagé"],
  ["Caméra","Image floue, capteur noir ou autofocus"],
  ["Audio / Micro","Son faible, grésillement ou micro"],
  ["Logiciel","Blocage, lenteur ou problème système"],
  ["Dégâts des eaux","Liquide, humidité ou oxydation"],
  ["Ne s'allume plus","Aucune réaction, bootloop ou extinction"],
  ["Réseau / Wi-Fi","Réseau, Wi-Fi, Bluetooth ou signal"],
  ["Face ID / Biométrie","Face ID, Touch ID ou capteurs"],
  ["Boutons / Vibration","Power, volume ou vibration"],
  ["Autre problème","Diagnostic technique personnalisé"]
] as const;

const emptyForm:FormData={
  fullName:"",phone:"",email:"",city:"",address:"",brand:"",model:"",problemType:"",
  problemDescription:"",notes:"",mode:"boutique",appointmentDate:"",appointmentTime:"",photos:[]
};

function RepairPage(){
  const [tab,setTab]=useState<"diagnostic"|"track">("diagnostic");
  const [step,setStep]=useState(1);
  const [services,setServices]=useState<RepairService[]>([]);
  const [submitted,setSubmitted]=useState<RepairRequest|null>(null);
  const [form,setForm]=useState<FormData>(emptyForm);
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [photoBusy,setPhotoBusy]=useState(false);
  const [trackRef,setTrackRef]=useState("");
  const [trackPhone,setTrackPhone]=useState("");
  const [tracked,setTracked]=useState<Record<string,unknown>|null>(null);
  const [tracking,setTracking]=useState(false);

  useEffect(()=>{void loadRepairServices().then(setServices)},[]);
  useEffect(()=>{
    if(typeof window==="undefined")return;
    const ref=new URLSearchParams(window.location.search).get("reference");
    if(ref){setTrackRef(ref);setTab("track")}
  },[]);

  const models=form.brand?(PHONE_CATALOG[form.brand]||[]):[];
  const selectedProblem=problems.find(p=>p[0]===form.problemType);
  const matched=useMemo(()=>services
    .filter(s=>s.device_brand==="Tous"||s.device_brand===form.brand)
    .filter(s=>s.device_model==="Tous"||s.device_model===form.model)
    .filter(s=>s.service_name.toLowerCase().includes(form.problemType.toLowerCase())||!form.problemType),
    [services,form.brand,form.model,form.problemType]);
  const service=matched[0]||services.find(s=>s.service_name===form.problemType);
  const fallbackMap:Record<string,{from:number;duration:string}>={
    "Écran cassé":{from:250,duration:"45 min – 2 h"},
    "Batterie":{from:180,duration:"30 min"},
    "Port de charge":{from:150,duration:"45 min"},
    "Caméra":{from:200,duration:"1 h"},
    "Audio / Micro":{from:160,duration:"1 h"},
    "Logiciel":{from:120,duration:"1 – 3 h"},
    "Dégâts des eaux":{from:300,duration:"24 – 48 h"},
    "Ne s'allume plus":{from:0,duration:"Après diagnostic"},
    "Réseau / Wi-Fi":{from:0,duration:"Après diagnostic"},
    "Face ID / Biométrie":{from:0,duration:"Après diagnostic"},
    "Boutons / Vibration":{from:0,duration:"Après diagnostic"},
    "Autre problème":{from:0,duration:"Sur diagnostic"}
  };
  const fallback=fallbackMap[form.problemType]||repairTypes.find(x=>x.name===form.problemType);
  const estimatedPrice=service?Number(service.estimated_price):fallback?.from||0;
  const estimatedDuration=service?.repair_time||fallback?.duration||"Après diagnostic";

  const update=(key:keyof FormData,value:string|string[])=>setForm(f=>({...f,[key]:value}));
  const validate=()=>{
    const e:Record<string,string>={};
    if(step===1){
      if(!form.brand)e.brand="Choisissez une marque.";
      if(!form.model)e.model="Choisissez ou saisissez le modèle.";
    }
    if(step===2){
      if(!form.problemType)e.problemType="Choisissez la panne.";
      if(form.problemDescription.trim().length<10)e.problemDescription="Décrivez le problème en 10 caractères minimum.";
    }
    if(step===3){
      if(form.fullName.trim().length<3)e.fullName="Nom complet requis.";
      if(!/^[0-9 +()-]{9,20}$/.test(form.phone.trim()))e.phone="Numéro invalide.";
      if(!form.city)e.city="Ville requise.";
      if(form.address.trim().length<5)e.address="Adresse requise.";
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const next=()=>{if(validate())setStep(s=>Math.min(4,s+1))};
  const back=()=>{setErrors({});setStep(s=>Math.max(1,s-1))};

  const addPhotos=async(e:ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]).slice(0,5-form.photos.length);
    if(!files.length)return;
    setPhotoBusy(true);
    try{
      const urls:string[]=[];
      for(const file of files)urls.push(await uploadRepairPhoto(file));
      update("photos",[...form.photos,...urls]);
    }catch(err){
      toast.error(err instanceof Error?err.message:"Image impossible à ajouter.");
    }finally{
      setPhotoBusy(false);
      e.target.value="";
    }
  };

  const submit=async()=>{
    if(!validate())return;
    setPhotoBusy(true);
    try{
      const request:RepairRequest={
        reference:makeReference("REP"),createdAt:new Date().toISOString(),
        fullName:form.fullName.trim(),phone:form.phone.trim(),email:form.email.trim()||undefined,
        city:form.city,address:form.address.trim(),brand:form.brand,model:form.model,
        problemType:form.problemType,problemDescription:form.problemDescription.trim(),
        notes:form.notes.trim()||undefined,pickup:form.mode!=="boutique",serviceMode:form.mode,
        appointmentDate:form.appointmentDate||undefined,appointmentTime:form.appointmentTime||undefined,
        estimatedPrice,estimatedDuration,photos:form.photos
      };
      await createRepairRequest(request);
      saveRepairLocal(request);
      setSubmitted(request);
      toast.success("Demande créée",{description:request.reference});
    }catch(err){
      toast.error(err instanceof Error?err.message:"Impossible d'envoyer la demande.");
    }finally{setPhotoBusy(false)}
  };

  const track=async()=>{
    if(!trackRef.trim()||trackPhone.trim().length<9){
      toast.error("Référence et téléphone requis.");
      return;
    }
    setTracking(true);
    setTracked(null);
    try{
      const result=await getRepairStatus(trackRef.trim(),trackPhone.trim());
      if(!result||Object.keys(result).length===0)toast.error("Aucune réparation trouvée.");
      else setTracked(result);
    }catch(err){
      toast.error(err instanceof Error?err.message:"Suivi indisponible.");
    }finally{setTracking(false)}
  };

  if(submitted)return <Success request={submitted} onNew={()=>{setSubmitted(null);setStep(1);setForm(emptyForm)}}/>;

  return <main className="min-h-screen">
    <section className="border-b border-border bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,.13),transparent_42%)]">
      <div className="container-page py-12 lg:py-16">
        <p className="eyebrow">OROTRONIX · SERVICE TECHNIQUE</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          Diagnostic & <span className="text-gradient-gold">réparation</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Décrivez la panne, recevez une pré-estimation et suivez votre réparation avec votre référence.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={()=>{setTab("diagnostic");document.getElementById("repair-form")?.scrollIntoView({behavior:"smooth"})}} className="inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-black">
            Demander une réparation
          </button>
          <a href="https://wa.me/212656566366" className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold">WhatsApp</a>
          <a href="tel:+212656566366" className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"><Phone className="mr-2 h-4 w-4"/>06 56 56 63 66</a>
        </div>
      </div>
    </section>

    <section id="repair-form" className="container-page py-10 lg:py-14">
      <div className="mb-6 grid gap-2 rounded-2xl border border-border bg-card p-2 sm:grid-cols-2">
        <button onClick={()=>setTab("diagnostic")} className={"rounded-xl px-4 py-3 text-sm font-semibold "+(tab==="diagnostic"?"bg-gold text-black":"text-muted-foreground")}>Nouvelle réparation</button>
        <button onClick={()=>setTab("track")} className={"rounded-xl px-4 py-3 text-sm font-semibold "+(tab==="track"?"bg-gold text-black":"text-muted-foreground")}>Suivre ma réparation</button>
      </div>

      {tab==="track"
        ? <TrackPanel refValue={trackRef} phone={trackPhone} setRef={setTrackRef} setPhone={setTrackPhone} onTrack={track} loading={tracking} result={tracked}/>
        : <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="eyebrow">Étape {step} / 4</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{["Appareil","Panne","Coordonnées","Confirmation"][step-1]}</h2>
              </div>
              <div className="hidden gap-1 sm:flex">{[1,2,3,4].map(n=><span key={n} className={"h-1.5 w-12 rounded-full "+(n<=step?"bg-gold":"bg-border")}/>)}</div>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                {step===1&&<StepDevice form={form} models={models} update={update} errors={errors}/>}
                {step===2&&<StepProblem form={form} update={update} errors={errors} addPhotos={addPhotos} photoBusy={photoBusy}/>}
                {step===3&&<StepContact form={form} update={update} errors={errors}/>}
                {step===4&&<Summary form={form} estimate={estimatedPrice} duration={estimatedDuration} problem={form.problemType}/>}
                <div className="mt-7 flex justify-between gap-3 border-t border-border pt-5">
                  {step>1?<button type="button" onClick={back} className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"><ChevronLeft className="mr-2 h-4 w-4"/>Retour</button>:<span/>}
                  {step<4
                    ? <button type="button" onClick={next} className="inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-black">Continuer<ChevronRight className="ml-2 h-4 w-4"/></button>
                    : <button type="button" onClick={()=>void submit()} disabled={photoBusy} className="inline-flex h-11 items-center rounded-xl bg-gold px-6 text-sm font-semibold text-black">{photoBusy?"Envoi…":"Confirmer la demande"}</button>}
                </div>
              </div>
              <EstimateCard price={estimatedPrice} duration={estimatedDuration} mode={form.mode}/>
            </div>
          </div>}
    </section>
  </main>;
}

function StepDevice({form,models,update,errors}:{form:FormData;models:string[];update:(k:keyof FormData,v:string|string[])=>void;errors:Record<string,string>}){
  return <div className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Marque" error={errors.brand}>
        <select className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={form.brand} onChange={e=>{update("brand",e.target.value);update("model","")}}>
          <option value="">Choisir une marque</option>{PHONE_BRANDS.map(x=><option key={x}>{x}</option>)}
        </select>
      </Field>
      <Field label="Modèle" error={errors.model}>
        {models.length
          ? <select className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={form.model} onChange={e=>update("model",e.target.value)}>
              <option value="">Choisir le modèle</option>{models.map(x=><option key={x}>{x}</option>)}
            </select>
          : <input className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={form.model} onChange={e=>update("model",e.target.value)} placeholder="Ex. iPhone 15 Pro"/>}
      </Field>
    </div>
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-semibold">Votre appareil</p>
      <p className="mt-1 text-xs text-muted-foreground">La marque et le modèle servent à préparer le diagnostic et l'estimation.</p>
    </div>
  </div>;
}

function StepProblem({form,update,errors,addPhotos,photoBusy}:{form:FormData;update:(k:keyof FormData,v:string|string[])=>void;errors:Record<string,string>;addPhotos:(e:ChangeEvent<HTMLInputElement>)=>void;photoBusy:boolean}){
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2">
      {problems.map(([name,desc])=><button type="button" key={name} onClick={()=>update("problemType",name)} className={"rounded-2xl border p-4 text-left transition "+(form.problemType===name?"border-gold bg-gold/5":"border-border bg-surface hover:border-gold/40")}>
        <p className="text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </button>)}
    </div>
    {errors.problemType&&<ErrorText t={errors.problemType}/>}
    <Field label="Décrivez le problème" error={errors.problemDescription}>
      <textarea className="mt-2 min-h-32 w-full rounded-xl border border-border bg-surface p-4 text-sm" value={form.problemDescription} onChange={e=>update("problemDescription",e.target.value)} placeholder="Ex. Le téléphone s'éteint après quelques minutes et redémarre lorsqu'il est branché."/>
    </Field>
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold">Photos du problème <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></p><p className="mt-1 text-xs text-muted-foreground">Jusqu'à 5 images, 5 Mo chacune.</p></div>
        <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-border px-4 text-xs font-semibold"><Camera className="mr-2 h-4 w-4"/>Ajouter<input hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={addPhotos}/></label>
      </div>
      {photoBusy&&<p className="mt-2 text-xs text-muted-foreground">Téléversement…</p>}
      {!!form.photos.length&&<div className="mt-3 flex flex-wrap gap-2">{form.photos.map(url=><div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"><img src={url} alt="" className="h-full w-full object-cover"/><button type="button" className="absolute right-1 top-1 rounded-full bg-black/70 p-1" onClick={()=>update("photos",form.photos.filter(x=>x!==url))}><X className="h-3 w-3"/></button></div>)}</div>}
    </div>
    <label className="block"><span className="text-sm font-semibold">Note supplémentaire <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></span><textarea className="mt-2 min-h-24 w-full rounded-xl border border-border bg-surface p-3 text-sm" value={form.notes} onChange={e=>update("notes",e.target.value)} placeholder="Chute, liquide, accessoires ou information utile…"/></label>
  </div>;
}

function StepContact({form,update,errors}:{form:FormData;update:(k:keyof FormData,v:string|string[])=>void;errors:Record<string,string>}){
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Nom complet" value={form.fullName} onChange={v=>update("fullName",v)} error={errors.fullName} placeholder="Ex. Salma Bennani"/>
      <Input label="Téléphone" value={form.phone} onChange={v=>update("phone",v)} error={errors.phone} placeholder="06 00 00 00 00"/>
      <Input label="E-mail" value={form.email} onChange={v=>update("email",v)} placeholder="vous@email.com" optional/>
      <Select label="Ville" value={form.city} onChange={v=>update("city",v)} error={errors.city} options={moroccanCities}/>
    </div>
    <Field label="Adresse" error={errors.address}>
      <textarea className="mt-2 min-h-24 w-full rounded-xl border border-border bg-surface p-3 text-sm" value={form.address} onChange={e=>update("address",e.target.value)} placeholder="Quartier, rue, numéro…"/>
    </Field>
    <div>
      <p className="text-sm font-semibold">Prise en charge</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {([["boutique","Déposer en boutique",Wrench],["pickup","Collecte & livraison",Truck],["home","À domicile",Home]] as const).map(([id,title,Icon])=><button type="button" key={id} onClick={()=>update("mode",id)} className={"rounded-2xl border p-4 text-left "+(form.mode===id?"border-gold bg-gold/5":"border-border bg-surface")}>
          <Icon className="h-5 w-5 text-gold"/><p className="mt-2 text-sm font-semibold">{title}</p>
        </button>)}
      </div>
    </div>
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-gold"/><p className="text-sm font-semibold">Rendez-vous <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></p></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input type="date" min={new Date().toISOString().slice(0,10)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm" value={form.appointmentDate} onChange={e=>update("appointmentDate",e.target.value)}/>
        <select className="h-11 rounded-xl border border-border bg-background px-3 text-sm" value={form.appointmentTime} onChange={e=>update("appointmentTime",e.target.value)}>
          <option value="">Choisir une heure</option>{["10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(x=><option key={x}>{x}</option>)}
        </select>
      </div>
    </div>
  </div>;
}

function Summary({form,estimate,duration,problem}:{form:FormData;estimate:number;duration:string;problem:string}){
  const mode=form.mode==="boutique"?"Boutique":form.mode==="pickup"?"Collecte & livraison":"À domicile";
  return <div className="space-y-4">
    <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
      <p className="text-xs uppercase tracking-wider text-gold">Pré-estimation</p>
      <p className="mt-2 font-display text-3xl font-bold">{estimate>0?formatMAD(estimate):"Sur diagnostic"}</p>
      <p className="mt-1 text-sm text-muted-foreground">Le prix final est confirmé après contrôle technique.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{[
      ["Appareil",form.brand+" · "+form.model],["Panne",problem],["Durée indicative",duration],["Prise en charge",mode],["Client",form.fullName],["Téléphone",form.phone]
    ].map(([label,value])=><div key={label} className="rounded-xl bg-surface p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div>
    <div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">Avant toute réparation</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Le diagnostic peut modifier le prix. Si une validation est nécessaire, vous la verrez dans le suivi avant l'intervention.</p></div>
  </div>;
}

function EstimateCard({price,duration,mode}:{price:number;duration:string;mode:Mode}){
  return <aside className="h-fit rounded-2xl border border-gold/25 bg-card p-5 lg:sticky lg:top-24">
    <p className="text-xs uppercase tracking-wider text-muted-foreground">Pré-estimation</p>
    <p className="mt-2 font-display text-3xl font-bold">{price>0?formatMAD(price):"Diagnostic"}</p>
    <p className="mt-1 text-xs text-muted-foreground">{duration}</p>
    <div className="mt-5 space-y-3 border-t border-border pt-4">
      <Row icon={<ShieldCheck/>} text="Prix final après diagnostic"/>
      <Row icon={<Clock3/>} text="Rendez-vous à confirmer"/>
      <Row icon={<CheckCircle2/>} text="Contrôle qualité"/>
      <Row icon={<Truck/>} text={mode==="boutique"?"Dépôt en boutique":mode==="pickup"?"Collecte & livraison":"À domicile"}/>
    </div>
  </aside>;
}

function Row({icon,text}:{icon:React.ReactNode;text:string}){return <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="text-gold [&_svg]:h-4 [&_svg]:w-4">{icon}</span>{text}</div>}

function Field({label,error,optional,children}:{label:string;error?:string;optional?:boolean;children:React.ReactNode}){
  return <label className="block"><span className="text-sm font-semibold">{label} {optional&&<span className="text-xs font-normal text-muted-foreground">(optionnel)</span>}</span>{children}{error&&<ErrorText t={error}/>}</label>;
}

function Input({label,value,onChange,error,placeholder,optional}:{label:string;value:string;onChange:(v:string)=>void;error?:string;placeholder?:string;optional?:boolean}){
  return <Field label={label} error={error} optional={optional}><input className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></Field>;
}

function Select({label,value,onChange,error,options}:{label:string;value:string;onChange:(v:string)=>void;error?:string;options:string[]}){
  return <Field label={label} error={error}><select className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm" value={value} onChange={e=>onChange(e.target.value)}><option value="">Choisir</option>{options.map(x=><option key={x}>{x}</option>)}</select></Field>;
}

function ErrorText({t}:{t:string}){return <span className="mt-1 block text-xs text-destructive">{t}</span>}

function TrackPanel({refValue,phone,setRef,setPhone,onTrack,loading,result}:{refValue:string;phone:string;setRef:(v:string)=>void;setPhone:(v:string)=>void;onTrack:()=>void;loading:boolean;result:Record<string,unknown>|null}){
  const status=String(result?.status||"received") as RepairStatus;
  const history=Array.isArray(result?.history)?result.history as Array<Record<string,unknown>>:[];
  const [busy,setBusy]=useState(false);
  const [rating,setRating]=useState(0);
  const [review,setReview]=useState("");
  const [decision,setDecision]=useState(false);

  const respond=async(approved:boolean)=>{
    setBusy(true);
    try{await respondRepair(String(result?.reference||refValue),phone,approved);setDecision(true);onTrack()}
    catch(e){toast.error(e instanceof Error?e.message:"Réponse impossible.")}
    finally{setBusy(false)}
  };
  const rate=async()=>{
    if(!rating)return;
    setBusy(true);
    try{await rateRepair(String(result?.reference||refValue),phone,rating,review);toast.success("Merci pour votre avis.");onTrack()}
    catch(e){toast.error(e instanceof Error?e.message:"Évaluation impossible.")}
    finally{setBusy(false)}
  };

  return <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
    <div className="max-w-xl">
      <Search className="h-7 w-7 text-gold"/>
      <h2 className="mt-3 font-display text-2xl font-bold">Suivre ma réparation</h2>
      <p className="mt-2 text-sm text-muted-foreground">Entrez la référence et le téléphone utilisés lors de la demande.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><Input label="Référence" value={refValue} onChange={setRef} placeholder="REP-20260928-1234"/><Input label="Téléphone" value={phone} onChange={setPhone} placeholder="06 00 00 00 00"/></div>
      <button onClick={onTrack} disabled={loading} className="mt-4 h-11 rounded-xl bg-gold px-5 text-sm font-semibold text-black">{loading?"Recherche…":"Afficher le suivi"}</button>
    </div>

    {result&&<div className="mt-8 border-t border-border pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs text-muted-foreground">{String(result.reference)}</p><h3 className="mt-1 font-display text-xl font-semibold">{String(result.brand)} · {String(result.model)}</h3></div>
        <span className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-semibold text-gold">{REPAIR_STATUSES[status]||status}</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
        ["Pré-estimation",Number(result.estimated_price||0)>0?formatMAD(Number(result.estimated_price)):"Diagnostic"],
        ["Prix final",result.final_price?formatMAD(Number(result.final_price)):"À confirmer"],
        ["Durée",String(result.estimated_duration||"—")],
        ["Garantie",String(result.warranty_end||result.warranty_text||"Selon conditions")]
      ].map(([a,b])=><div key={a} className="rounded-xl bg-surface p-4"><p className="text-xs text-muted-foreground">{a}</p><p className="mt-1 text-sm font-semibold">{b}</p></div>)}</div>

      <div className="mt-6">
        <p className="text-sm font-semibold">Historique</p>
        <div className="mt-3 space-y-2">{history.length?history.map((h,i)=><div key={String(h.created_at)+i} className="flex gap-3 rounded-xl border border-border bg-surface p-3"><div className="mt-1 h-2.5 w-2.5 rounded-full bg-gold"/><div><p className="text-sm font-semibold">{REPAIR_STATUSES[String(h.status) as RepairStatus]||String(h.status)}</p><p className="text-xs text-muted-foreground">{new Date(String(h.created_at)).toLocaleString("fr-MA")}{h.note?" · "+String(h.note):""}</p></div></div>):<p className="text-sm text-muted-foreground">Historique indisponible.</p>}</div>
      </div>

      {status==="awaiting_approval"&&<div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5"><p className="font-semibold">Votre validation est requise</p><p className="mt-1 text-sm text-muted-foreground">Prix final : {result.final_price?formatMAD(Number(result.final_price)):"à confirmer"}.</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>void respond(true)} className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-black">Accepter</button><button disabled={busy} onClick={()=>void respond(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Refuser</button></div></div>}
      {decision&&<p className="mt-3 text-xs text-gold">Votre réponse a été enregistrée.</p>}
      {status==="completed"&&!result.rating&&<div className="mt-6 rounded-2xl border border-border p-5"><p className="font-semibold">Évaluer la réparation</p><div className="mt-3 flex gap-1">{[1,2,3,4,5].map(n=><button key={n} type="button" onClick={()=>setRating(n)} className={"text-2xl "+(n<=rating?"text-gold":"text-muted-foreground")}>★</button>)}</div><textarea className="mt-3 min-h-24 w-full rounded-xl border border-border bg-surface p-3 text-sm" value={review} onChange={e=>setReview(e.target.value)} placeholder="Votre avis (optionnel)"/><button disabled={busy||!rating} onClick={()=>void rate()} className="mt-3 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-black">Envoyer mon avis</button></div>}
    </div>}
  </div>;
}

function Success({request,onNew}:{request:RepairRequest;onNew:()=>void}){
  const wa="https://wa.me/212656566366?text="+encodeURIComponent("Bonjour OROTRONIX, je viens de créer la demande "+request.reference+".");
  const tracking=window.location.origin+"/reparation?reference="+encodeURIComponent(request.reference);
  const copy=async()=>{try{await navigator.clipboard.writeText(request.reference);toast.success("Référence copiée.");}catch{toast.error("Copie impossible.")}};
  return <section className="container-page py-16"><div className="mx-auto max-w-2xl rounded-3xl border border-gold/35 bg-card p-7 sm:p-10">
    <div className="text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-gold"/><p className="mt-4 text-xs uppercase tracking-widest text-gold">Demande enregistrée</p><h2 className="mt-2 font-display text-3xl font-bold">Votre réparation est créée</h2><p className="mt-3 text-sm text-muted-foreground">Conservez votre référence pour consulter le suivi.</p></div>
    <div className="mt-7 rounded-2xl bg-surface p-5 text-center"><p className="text-xs text-muted-foreground">Référence</p><p className="mt-1 font-mono text-2xl font-bold text-gold">{request.reference}</p><button onClick={()=>void copy()} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs font-semibold">Copier la référence</button></div>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <button onClick={onNew} className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold">Nouvelle demande</button>
      <a href={"/reparation?reference="+encodeURIComponent(request.reference)} className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold">Suivre</a>
      <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-black">WhatsApp</a>
    </div>
    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-gold"/>Le prix final est confirmé après diagnostic.</div>
  </div></section>;
}
