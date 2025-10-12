import React, { useEffect, useMemo, useState } from 'react'
import CatalogTemplate from '../components/templates/CatalogTemplate'
import ProductCard from '../components/molecules/ProductCard'
import Button from '../components/atoms/Button'
import Input from '../components/atoms/Input'
import { listProducts } from '../lib/api'

type Product = {
  id: string
  title: string
  price: number
  image: string
  tags: string[]
  stockQty: number
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [tag, setTag] = useState('')

  useEffect(() => {
    listProducts().then(setProducts)
  }, [])

  const tags = useMemo(() => {
    const s = new Set<string>()
    products.forEach((p) => p.tags.forEach((t) => s.add(t)))
    return Array.from(s)
  }, [products])

  const filtered = useMemo(() => {
    let out = products.slice()
    if (q) {
      const toks = q.toLowerCase().split(/\s+/).filter(Boolean)
      out = out.filter((p) =>
        toks.every((t) =>
          (p.title + ' ' + p.tags.join(' ')).toLowerCase().includes(t)
        )
      )
    }
    if (tag) out = out.filter((p) => p.tags.includes(tag))
    out.sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price))
    return out
  }, [products, q, sort, tag])

  // Group products in chunks of 5
  const groupedProducts = useMemo(() => {
    const groups: Product[][] = []
    for (let i = 0; i < filtered.length; i += 5) {
      groups.push(filtered.slice(i, i + 5))
    }
    return groups
  }, [filtered])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        {/* LEFT SIDE: TITLE */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Our Products
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Explore quality items hand-picked for you.
          </p>
        </div>

        {/* RIGHT SIDE: SEARCH + SORT */}
        <div className="flex items-center gap-6">
          <div className="w-[14rem] sm:w-[16rem] md:w-[18rem]">
            <Input
              id="search-products"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
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
            onChange={(e) => setSort(e.target.value as any)}
            className="border border-gray-300 px-3 py-1.5 rounded-full text-sm focus:ring-2 focus:ring-indigo-300 
                       focus:border-indigo-400 transition bg-white shadow-sm hover:shadow-md cursor-pointer"
          >
            <option value="asc">Price: low → high</option>
            <option value="desc">Price: high → low</option>
          </select>
        </div>
      </div>

      {/* TAG FILTERS */}
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4 mb-10">
        <Button
          variant={tag === '' ? 'primary' : 'ghost'}
          size="sm"
          className="transition-all"
          onClick={() => setTag('')}
        >
          All
        </Button>

        {tags.map((t) => (
          <div key={t} className="mr-3 mb-2">
            <Button
              variant={tag === t ? 'primary' : 'ghost'}
              size="sm"
              className="transition-all"
              onClick={() => setTag(t)}
            >
              {t}
            </Button>
          </div>
        ))} 
      </div>

      {/* PRODUCT ROWS */}
      <CatalogTemplate products={filtered}>
        <div className="flex flex-col gap-8">
          {groupedProducts.map((group, i) => (
            <div key={i} className="flex justify-start gap-6 flex-wrap">
              {group.map((p, j) => (
                <div
                  key={p.id}
                  className={`flex-1 min-w-[180px] max-w-[220px] ${
                    j === 0 ? 'ml-[10rem]' : ''
                  }`}
                >
                  <ProductCard {...p} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </CatalogTemplate>
    </main>
  )
}
