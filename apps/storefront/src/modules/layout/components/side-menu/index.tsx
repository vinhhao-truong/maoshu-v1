"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment, useEffect, useRef, useState } from "react"
import { Locale } from "@lib/data/locales"
import { useTranslations } from "next-intl"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  allCategories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
}

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={`transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
  >
    <path d="M4 7l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SideMenu = ({ allCategories, collections }: SideMenuProps) => {
  const t = useTranslations("sideMenu")
  const menuToggleState = useToggleState()

  const [openSection, setOpenSection] = useState<"collections" | "categories" | null>(null)
  const [rootCategoryId, setRootCategoryId] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => setRootCategoryId(localStorage.getItem("selectedCategoryId"))
    sync()
    window.addEventListener("selectedCategoryChanged", sync)
    return () => window.removeEventListener("selectedCategoryChanged", sync)
  }, [])

  const rootCategory = allCategories.find((c) => c.id === rootCategoryId)
  const subcategories = rootCategory?.category_children ?? []

  const toggle = (section: "collections" | "categories") =>
    setOpenSection((s) => (s === section ? null : section))

  const sideMenuItems = [
    { label: t("home"), href: "/" },
    { label: t("store"), href: "/store" },
    { label: t("account"), href: "/account" },
  ]

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex outline-none">
          <div className="flex h-full">
            <PopoverButton
              data-testid="nav-menu-button"
              className="relative h-full flex items-center transition-all ease-out duration-200 outline-none focus:outline-none hover:text-ui-fg-base"
              onClick={menuToggleState.toggle}
            >
              <div className="flex flex-col items-center gap-y-1">
                <div className="flex flex-col gap-y-[5px]">
                  <span className="block w-5 h-px bg-current" />
                  <span className="block w-5 h-px bg-current" />
                  <span className="block w-5 h-px bg-current" />
                </div>
                <span className="text-[8px] leading-none tracking-wide uppercase">{t("menu")}</span>
              </div>
            </PopoverButton>
          </div>

          {menuToggleState.state && (
            <div
              className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm pointer-events-auto"
              onClick={menuToggleState.close}
              data-testid="side-menu-backdrop"
            />
          )}

          <Transition
            show={menuToggleState.state}
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-x-4"
            enterTo="opacity-100 translate-x-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-0 -translate-x-4"
          >
            <PopoverPanel
              static
              className="flex flex-col fixed left-0 top-0 w-full sm:w-[420px] h-[calc(100vh-1rem)] z-[200] text-sm text-ui-fg-base m-2"
            >
              <div
                data-testid="nav-menu-popup"
                className="flex flex-col h-full bg-white rounded-rounded shadow-lg"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                  <h3 className="text-large-semi">{t("menu")}</h3>
                  <button data-testid="close-menu-button" onClick={menuToggleState.close}>
                    <XMark />
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-col px-6 py-6 gap-5">
                  {/* Nav links */}
                  {sideMenuItems.map(({ label, href }) => (
                    <LocalizedClientLink
                      key={href}
                      href={href}
                      className="text-3xl leading-tight hover:text-ui-fg-subtle transition-colors"
                      onClick={menuToggleState.close}
                      data-testid={`${href.replace("/", "") || "home"}-link`}
                    >
                      {label}
                    </LocalizedClientLink>
                  ))}

                  {/* Collections section */}
                  <div>
                    <button
                      className="flex items-center justify-between w-full text-3xl leading-tight hover:text-ui-fg-subtle transition-colors"
                      onClick={() => toggle("collections")}
                    >
                      <span>{t("collections")}</span>
                      <ChevronDown open={openSection === "collections"} />
                    </button>
                    <div className={`grid transition-all duration-200 ease-in-out ${openSection === "collections" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <ul className="overflow-hidden flex flex-col gap-y-5 pl-2 pt-5">
                        {collections.map((col) => (
                          <li key={col.id}>
                            <LocalizedClientLink
                              href={`/collections/${col.handle}`}
                              className="text-base text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                              onClick={menuToggleState.close}
                            >
                              {col.title}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Categories section */}
                  <div>
                    <button
                      className="flex items-center justify-between w-full text-3xl leading-tight hover:text-ui-fg-subtle transition-colors"
                      onClick={() => toggle("categories")}
                    >
                      <span>{t("categories")}</span>
                      <ChevronDown open={openSection === "categories"} />
                    </button>
                    <div className={`grid transition-all duration-200 ease-in-out ${openSection === "categories" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <ul className="overflow-hidden flex flex-col gap-y-5 pl-2 pt-5">
                        {subcategories.length > 0 ? subcategories.map((cat) => (
                          <li key={cat.id}>
                            <LocalizedClientLink
                              href={`/categories/${cat.handle}`}
                              className="text-base text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                              onClick={menuToggleState.close}
                            >
                              {cat.name}
                            </LocalizedClientLink>
                          </li>
                        )) : (
                          <li className="text-sm text-ui-fg-muted">—</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </Transition>
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
