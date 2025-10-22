//storefront/src/pages/catalog.tsx
import React, { useEffect, useMemo, useState } from "react";
import CatalogTemplate from "../components/templates/CatalogTemplate";
import ProductCard from "../components/molecules/ProductCard";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import { listProducts } from "../lib/api";
import { Product } from "../types"; // ✅ shared backend-aligned type

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ Collect unique tags
  const tags = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.tags?.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [products]);

  // ✅ Filter and sort
  const filtered = useMemo(() => {
    let out = [...products];

    // Text search
    if (q.trim()) {
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
      out = out.filter((p) =>
        tokens.every((t) =>
          (p.title + " " + p.tags.join(" ")).toLowerCase().includes(t)
        )
      );
    }

    // Tag filter
    if (tag) out = out.filter((p) => p.tags.includes(tag));

    // Sort by price
    out.sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
    return out;
  }, [products, q, sort, tag]);

  // 🌀 Loading state
  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse text-gray-500">
        Loading products…
      </main>
    );
  }

  // ⚠️ Error state
  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </main>
    );
  }

  // 🏪 Empty catalog
  if (filtered.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">No products found</h1>
        <p className="text-gray-500 mb-6">
          Try adjusting your search or removing filters.
        </p>
        <Button variant="primary" onClick={() => setTag("")}>
          Reset Filters
        </Button>
      </main>
    );
  }

  // ✅ Normal catalog view
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Our Products
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Explore quality items hand-picked for you.
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          <div className="w-full sm:w-[16rem] md:w-[18rem]">
            <Input
              id="search-products"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
                  />
                </svg>
              }
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "asc" | "desc")}
            className="border border-gray-300 px-3 py-1 rounded-full text-sm
                       focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                       transition bg-white shadow-sm hover:shadow-md cursor-pointer
                       w-full sm:w-[10rem] md:w-[8rem] lg:w-[7rem] max-w-[10rem]"
            aria-label="Sort products by price"
          >
            <option value="asc">Low → High</option>
            <option value="desc">High → Low</option>
          </select>
        </div>
      </div>

      {/* Tag Filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mb-10">
          <Button
            variant={tag === "" ? "primary" : "ghost"}
            size="sm"
            className="transition-all"
            onClick={() => setTag("")}
          >
            All
          </Button>

          {tags.map((t) => (
            <Button
              key={t}
              variant={tag === t ? "primary" : "ghost"}
              size="sm"
              className="transition-all"
              onClick={() => setTag(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <CatalogTemplate products={filtered}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {filtered.map((p) => (
            <div key={p.id} className="flex justify-center">
              <ProductCard {...p} />
            </div>
          ))}
        </div>
      </CatalogTemplate>
    </main>
  );
}
