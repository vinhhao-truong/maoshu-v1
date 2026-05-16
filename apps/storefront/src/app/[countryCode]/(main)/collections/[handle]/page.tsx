import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { getRootCategoryIds } from "@lib/util/category-ids"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
    priceMin?: string
    priceMax?: string
    limit?: string
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "*products",
  })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Medusa Store`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, priceMin: priceMinStr, priceMax: priceMaxStr, limit: limitStr } = searchParams
  const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined
  const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined
  const limit = limitStr ? parseInt(limitStr) : undefined

  const collection = await getCollectionByHandle(params.handle).then(
    (collection) => collection
  )

  if (!collection) {
    notFound()
  }

  const [cookieStore, allCategories] = await Promise.all([cookies(), listCategories({ limit: 100 })])
  const categoryIds = await getRootCategoryIds(cookieStore, allCategories ?? [])

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
      priceMin={priceMin}
      priceMax={priceMax}
      categoryIds={categoryIds}
      limit={limit}
    />
  )
}
