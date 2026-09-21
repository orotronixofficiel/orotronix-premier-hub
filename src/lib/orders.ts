import { readJSON, writeJSON } from "@/lib/storage";
import type { CartItem } from "@/context/cart";
import { supabaseConfigured, supabasePublicRest, supabaseRest } from "@/lib/supabase";

export type Customer = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
};

export type Order = {
  reference: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: "cod";
  customer: Customer;
};

const LAST_ORDER_KEY = "orotronix.lastOrder.v1";
const ORDERS_KEY = "orotronix.orders.v1";

export function makeReference(prefix = "ORO") {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${stamp}-${rand}`;
}

export async function saveOrder(order: Order): Promise<void> {
  const phone = order.customer.phone.trim();
  if (!phone) throw new Error("Le numéro de téléphone est requis pour enregistrer la commande.");
  writeJSON(LAST_ORDER_KEY, order);
  const all = readJSON<Order[]>(ORDERS_KEY, []);
  writeJSON(ORDERS_KEY, [order, ...all].slice(0, 50));
  if (supabaseConfigured) {
    const payload = {
      reference: order.reference,
      customer_name: order.customer.fullName.trim(),
      phone,
      address: order.customer.address.trim(),
      city: order.customer.city,
      items: order.items,
      total: order.total,
      status: "pending_whatsapp",
      notes: order.customer.notes?.trim() || null,
    };
    try {
      await supabasePublicRest("orders", { method: "POST", body: payload, prefer: "return=minimal" });
    } catch (error) { console.error("OROTRONIX: Supabase order save failed", error); throw error; }
  }
}

export function getLastOrder(): Order | null {
  return readJSON<Order | null>(LAST_ORDER_KEY, null);
}

export type RepairRequest = {
  reference: string;
  createdAt: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  brand: string;
  model: string;
  problemType: string;
  problemDescription: string;
  notes?: string;
  pickup: boolean;
};

const REPAIRS_KEY = "orotronix.repairs.v1";

export async function saveRepairRequest(request: RepairRequest) {
  const phone = request.phone.trim();
  if (!phone) throw new Error("Le numéro de téléphone est requis.");
  const all = readJSON<RepairRequest[]>(REPAIRS_KEY, []);
  writeJSON(REPAIRS_KEY, [request, ...all].slice(0, 50));
  if (supabaseConfigured) {
    try {
      await supabaseRest("orders", { method: "POST", body: {
        reference: request.reference, customer_name: request.fullName.trim(), phone,
        address: request.address.trim(), city: request.city,
        items: [{ type: "repair", brand: request.brand, model: request.model, problemType: request.problemType,
          problemDescription: request.problemDescription, pickup: request.pickup }],
        total: 0, status: "pending_whatsapp", notes: request.notes?.trim() || null
      }, prefer: "return=minimal" });
    } catch (error) { console.error("OROTRONIX: Supabase repair save failed", error); }
  }
}
