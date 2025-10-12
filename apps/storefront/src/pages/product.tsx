import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getProduct,
  listProducts,
  type Product as ProductType,
} from '../lib/api'
import Image from '../components/atoms/Image'
import Price from '../components/atoms/Price'
import Button from '../components/atoms/Button'
import ProductCard from '../components/molecules/ProductCard'
import { useStore } from '../lib/store'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductType | null>(null)
  const [products, setProducts] = useState<ProductType[]>([])
  const addToCart = useStore((s) => s.add)

  const fallbackDescription =
    'This thoughtfully designed product combines simplicity, functionality, and premium quality for everyday use.'

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const data = await getProduct(id)
        if (!data) {
          navigate('/404')
          return
        }

        const normalized: ProductType = {
          ...data,
          description: data.description?.trim() || fallbackDescription,
          tags: Array.isArray(data.tags) ? data.tags : [],
        }

        setProduct(normalized)
        const all = await listProducts()
        setProducts(all)
      } catch (err) {
        console.error('Error loading product:', err)
        navigate('/404')
      }
    }

    fetchData()
  }, [id, navigate])

  const related = useMemo(() => {
    if (!product || products.length === 0) return []
    return products.filter(
      (p) =>
        p.id !== product.id &&
        p.tags?.some((tag) => product.tags.includes(tag))
    )
  }, [product, products])

  const groupedRelated = useMemo(() => {
    const groups: ProductType[][] = []
    for (let i = 0; i < related.length; i += 5) {
      groups.push(related.slice(i, i + 5))
    }
    return groups
  }, [related])

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse">
        Loading product…
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* PRODUCT SECTION */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-md p-8 flex flex-col md:flex-row md:justify-start md:items-start gap-12">
        {/* LEFT: Image */}
        <div className="flex-shrink-0 w-full md:w-[420px] flex justify-center md:justify-start">
          <div className="bg-white rounded-2xl shadow-inner p-6 relative overflow-hidden w-[400px] h-[400px] flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100/30 via-transparent to-white/40 pointer-events-none" />
            <Image
              src={product.image}
              alt={product.title}
              width={300}
              height={300}
              className="transition-transform duration-500 hover:scale-105 hover:rotate-1"
            />
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="flex-1 flex flex-col justify-center text-gray-800 space-y-6">
          <header>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {product.title}
            </h1>
            <div className="mt-4 text-3xl font-semibold text-primary">
              <Price value={product.price} />
            </div>
          </header>

          <p className="text-gray-600 text-lg leading-relaxed max-w-prose">
            {product.description}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                addToCart({
                  id: product.id,
                  title: product.title,
                  image: product.image,
                  price: product.price,
                  qty: 1,
                })
                navigate('/cart')
              }}
              className="relative inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold text-white rounded-xl shadow-lg 
                         bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-600 
                         hover:shadow-xl active:scale-[0.98] transition-all duration-300"
              aria-label={`Add ${product.title} to cart`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2A1 1 0 007 20h10a1 1 0 00.98-.8L19 13M9 22a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
              Add to Cart
            </Button>

            <span
              className={`text-sm sm:text-base font-medium ${
                product.stockQty > 0
                  ? 'text-green-600 bg-green-50 px-3 py-1 rounded-full'
                  : 'text-red-600 bg-red-50 px-3 py-1 rounded-full'
              }`}
            >
              {product.stockQty > 0
                ? `${product.stockQty} in stock`
                : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {groupedRelated.length > 0 && (
        <section className="mt-20">
          <h3 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            Related Products
          </h3>

          <div className="flex flex-col gap-8">
            {groupedRelated.map((group, i) => (
              <div key={i} className="flex justify-start gap-6 flex-wrap">
                {group.map((p, j) => (
                  <div
                    key={p.id}
                    className={`flex-1 min-w-[180px] max-w-[220px] ${
                      j === 0 ? 'ml-[11rem]' : ''
                    }`}
                  >
                    <ProductCard {...p} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
