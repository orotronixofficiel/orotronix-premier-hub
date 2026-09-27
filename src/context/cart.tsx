import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Product } from "@/data/catalog";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  shippingCity: string;
  setShippingCity: (city: string) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "orotronix.cart.v1";
const MOHAMMEDIA_SHIPPING_FEE = 20;
const OUTSIDE_CITY_SHIPPING_FEE = 40;

function getShippingFee(city: string) {
  const normalized = city.trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!normalized) return 0;
  return normalized === "mohammedia" ? MOHAMMEDIA_SHIPPING_FEE : OUTSIDE_CITY_SHIPPING_FEE;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingCity, setShippingCityState] = useState("");

  useEffect(() => {
    setItems(readJSON<CartItem[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    writeJSON(STORAGE_KEY, items);
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.slug === product.slug);
      if (existing) {
        return current.map((i) =>
          i.slug === product.slug ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [
        ...current,
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((current) => current.filter((i) => i.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.slug !== slug)
        : current.map((i) => (i.slug === slug ? { ...i, quantity } : i)),
    );
  }, []);

  const setShippingCity = useCallback((city: string) => setShippingCityState(city), []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal === 0 ? 0 : getShippingFee(shippingCity);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      shippingCity,
      setShippingCity,
      addItem,
      removeItem,
      setQuantity,
      clear,
    };
  }, [items, shippingCity, addItem, removeItem, setQuantity, clear, setShippingCity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
