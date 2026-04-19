import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  full_description: string;
  image_url: string;
  images: string[];
  category: string;
  in_stock: boolean;
  colors: ProductColor[];
  stock_quantity: number;
  track_stock: boolean;
}

export function useStoreProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const mapped: StoreProduct[] = (data || []).map((p) => ({
          ...p,
          colors: Array.isArray(p.colors) ? (p.colors as unknown as ProductColor[]) : [],
        }));
        setProducts(mapped);
        setLoading(false);
      });
  }, []);

  return { products, loading };
}

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("*")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data?.forEach((item) => { map[item.key] = item.value; });
        setContent(map);
        setLoading(false);
      });
  }, []);

  return { content, loading };
}

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString("en-NG")}`;
}
