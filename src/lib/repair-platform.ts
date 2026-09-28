import { supabaseConfigured, supabaseRpc, supabasePublicRest } from "@/lib/supabase";

export type RepairStatus = "received"|"diagnostic"|"awaiting_approval"|"approved"|"repairing"|"quality_check"|"ready"|"completed"|"cancelled";

export type RepairRequest = {
  reference:string; createdAt:string; fullName:string; phone:string; email?:string;
  city:string; address:string; brand:string; model:string; problemType:string;
  problemDescription:string; notes?:string; pickup:boolean; serviceMode:"boutique"|"pickup"|"home";
  appointmentDate?:string; appointmentTime?:string; estimatedPrice:number; estimatedDuration?:string;
  photos?:string[];
};

export type RepairService = {
  id:string; device_brand:string; device_model:string; service_name:string;
  estimated_price:number; repair_time:string|null; available:boolean; description?:string|null;
};

export const REPAIR_STATUSES:Record<RepairStatus,string> = {
  received:"Demande reçue", diagnostic:"Diagnostic en cours", awaiting_approval:"En attente de votre validation",
  approved:"Réparation validée", repairing:"Réparation en cours", quality_check:"Contrôle qualité",
  ready:"Prête à récupérer", completed:"Terminée", cancelled:"Annulée"
};

export async function loadRepairServices() {
  try {
    return await supabasePublicRest<RepairService[]>("repair_services", {query:"?select=id,device_brand,device_model,service_name,estimated_price,repair_time,available,description&available=eq.true&order=sort_order.asc"});
  } catch { return []; }
}

export async function createRepairRequest(request:RepairRequest) {
  if (!supabaseConfigured) throw new Error("Service momentanément indisponible.");
  const result = await supabaseRpc<{id:string;reference:string;status:string}>("create_repair_request_v2", {
    p_reference:request.reference,p_customer_name:request.fullName,p_phone:request.phone,p_email:request.email||null,
    p_city:request.city,p_address:request.address,p_brand:request.brand,p_model:request.model,
    p_problem_type:request.problemType,p_problem_description:request.problemDescription,p_notes:request.notes||null,
    p_pickup:request.pickup,p_service_mode:request.serviceMode,p_appointment_date:request.appointmentDate||null,
    p_appointment_time:request.appointmentTime||null,p_estimated_price:request.estimatedPrice,
    p_estimated_duration:request.estimatedDuration||null,
    p_before_photos:request.photos||[]
  });
  return result;
}

export async function getRepairStatus(reference:string,phone:string) {
  return await supabaseRpc<Record<string,unknown>>("get_repair_request_status",{p_reference:reference,p_phone:phone});
}

export async function uploadRepairPhoto(file:File) {
  if (!supabaseConfigured) throw new Error("Service momentanément indisponible.");
  if (!file.type.startsWith("image/") || file.size>5*1024*1024) throw new Error("Image invalide : 5 Mo maximum.");
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
  const name=(globalThis.crypto?.randomUUID?.()||Date.now().toString())+"."+ext;
  const base=(import.meta.env.VITE_SUPABASE_URL||"https://qeqqfelebzxwupsqyzbz.supabase.co").replace(/\/$/,"");
  const key=import.meta.env.VITE_SUPABASE_ANON_KEY||"sb_publishable_nnvN9OsnpO_ipsFx0l-orw_yERvs7da";
  const res=await fetch(base+"/storage/v1/object/repair-uploads/"+name,{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":file.type,"x-upsert":"false"},body:file});
  if(!res.ok) throw new Error("Impossible d'ajouter cette image.");
  return base+"/storage/v1/object/public/repair-uploads/"+name;
}

export function saveRepairLocal(request:RepairRequest) {
  if(typeof window==="undefined") return;
  const key="orotronix.repairs.v2";
  const all=JSON.parse(localStorage.getItem(key)||"[]") as RepairRequest[];
  localStorage.setItem(key,JSON.stringify([request,...all.filter(x=>x.reference!==request.reference)].slice(0,30)));
}
