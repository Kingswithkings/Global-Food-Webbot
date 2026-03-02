export type Product = {
  sku: string;
  name: string;
  price: number;
  unit: string;
  in_stock: number;
  aliases: string[];
  category: string;   // ✅ NEW
};

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:8000/products");
  if (!res.ok) throw new Error(`Products API error: ${res.status}`);

  const data = await res.json();

  // Safety fallback in case backend hasn't added category yet
  return data.map((p: any) => ({
    ...p,
    category: p.category || "Uncategorized",
  }));
}