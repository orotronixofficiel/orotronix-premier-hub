import { readJSON, writeJSON } from "@/lib/storage";
import type { CartItem } from "@/context/cart";

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

export function saveOrder(order: Order) {
  writeJSON(LAST_ORDER_KEY, order);
  const all = readJSON<Order[]>(ORDERS_KEY, []);
  writeJSON(ORDERS_KEY, [order, ...all].slice(0, 50));
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

export function saveRepairRequest(request: RepairRequest) {
  const all = readJSON<RepairRequest[]>(REPAIRS_KEY, []);
  writeJSON(REPAIRS_KEY, [request, ...all].slice(0, 50));
}
