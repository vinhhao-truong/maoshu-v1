import { listCollections } from "@lib/data/collections";
import { listFooterContent } from "@lib/data/content";
import { Text, clx } from "@modules/common/components/ui";
import { HttpTypes } from "@medusajs/types";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import FooterCategories from "@modules/layout/components/footer-categories";
import MedusaCTA from "@modules/layout/components/medusa-cta";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Footer({
  categoryLogoUrl,
  categoryName,
  categories,
  rootCategoryId,
}: {
  categoryLogoUrl?: string
  categoryName?: string
  categories: HttpTypes.StoreProductCategory[]
  rootCategoryId?: string
}) {
  // categories passed from parent layout — no duplicate fetch
  // listCollections no longer requests *products (only names/handles needed for links)
  const [{ collections }, t, footerContent] = await Promise.all([
    listCollections(),
    getTranslations("footer"),
    listFooterContent(),
  ]);
  const productCategories = categories;

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div>
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity"
            >
              {categoryLogoUrl ? (
                <img
                  src={categoryLogoUrl}
                  alt={t("storeName")}
                  className="h-40 w-auto object-contain"
                />
              ) : (
                <span className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase">
                  {t("storeName")}
                </span>
              )}
            </LocalizedClientLink>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-5">
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">
                {t("categories")}
              </span>
              <FooterCategories categories={productCategories ?? []} rootCategoryId={rootCategoryId} />
            </div>
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  {t("collections")}
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">{t("about")}</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink href="/about-us" className="hover:text-ui-fg-base">
                    {t("aboutUs")}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/contact" className="hover:text-ui-fg-base">
                    {t("contact")}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/news" className="hover:text-ui-fg-base">
                    {t("news")}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/announcement" className="hover:text-ui-fg-base">
                    {t("announcements")}
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {footerContent.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">{t("support")}</span>
                <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                  {footerContent.map((item) => (
                    <li key={item.id}>
                      <LocalizedClientLink
                        href={`/content/${item.handle}`}
                        className="hover:text-ui-fg-base"
                      >
                        {item.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Maoshu</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <Link href="/admin" className="hover:text-ui-fg-base">
                    {t("adminShop")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    {t("adminSeller")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            {t("copyright", { year: new Date().getFullYear() })}{categoryName ? ` ${categoryName}` : ""}
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  );
}
