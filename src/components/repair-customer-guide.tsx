import { CheckCircle2, FileText, ShieldCheck, Smartphone, Wrench } from "lucide-react";

export function RepairCustomerGuide(){
 return <section className="container-page py-14">
  <div className="grid gap-6 lg:grid-cols-2">
   <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
    <p className="eyebrow">Avant de déposer votre appareil</p>
    <h2 className="mt-3 font-display text-2xl font-bold">Préparez votre réparation</h2>
    <div className="mt-6 space-y-3">{[
      "Sauvegardez vos données importantes lorsque cela est possible.",
      "Retirez votre carte SIM et vos accessoires personnels si nécessaire.",
      "Notez votre code de déverrouillage uniquement si le diagnostic l'exige.",
      "Signalez toute chute, oxydation, réparation précédente ou pièce non d'origine.",
      "Gardez la référence REP reçue après la demande."
    ].map(x=><div key={x} className="flex gap-3 rounded-xl bg-surface p-3 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold"/><span>{x}</span></div>)}</div>
   </div>
   <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
    <p className="eyebrow">Processus OROTRONIX</p>
    <h2 className="mt-3 font-display text-2xl font-bold">Un parcours clair</h2>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{[
      [Smartphone,"Réception","État de l'appareil et photos avant intervention."],
      [Wrench,"Diagnostic","Tests techniques et estimation finale."],
      [FileText,"Validation","Vous acceptez le devis avant les travaux concernés."],
      [ShieldCheck,"Contrôle & garantie","Tests finaux, restitution et garantie selon l'intervention."]
    ].map(([Icon,t,d])=>{const I=Icon as typeof Wrench;return <div key={String(t)} className="rounded-2xl border border-border bg-surface p-4"><I className="h-5 w-5 text-gold"/><p className="mt-3 text-sm font-semibold">{String(t)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{String(d)}</p></div>})}</div>
   </div>
  </div>
 </section>;
}
