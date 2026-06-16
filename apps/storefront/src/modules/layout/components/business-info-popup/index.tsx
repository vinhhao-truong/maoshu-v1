"use client"

import { forwardRef, Fragment, useImperativeHandle, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useTranslations } from "next-intl"
import BusinessInfoDetails from "@modules/common/components/business-info-details"
import type { BusinessInfo } from "@lib/data/business-info"

export type BusinessInfoPopupHandle = {
  open: () => void
}

type Props = {
  rootCategoryId?: string
}

const BusinessInfoPopup = forwardRef<BusinessInfoPopupHandle, Props>(
  ({ rootCategoryId }, ref) => {
    const t = useTranslations("contact")
    const [isOpen, setIsOpen] = useState(false)
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null | undefined>(undefined)

    const fetchInfo = async () => {
      if (businessInfo !== undefined) return
      try {
        const qs = rootCategoryId ? `?root_category_id=${rootCategoryId}` : ""
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/business-info${qs}`,
          {
            headers: {
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
            },
          }
        )
        const { business_info } = await res.json()
        setBusinessInfo(business_info ?? null)
      } catch {
        setBusinessInfo(null)
      }
    }

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true)
        fetchInfo()
      },
    }))

    const close = () => setIsOpen(false)

    const labels = {
      email: t("email"),
      phone: t("phone"),
      address: t("address"),
      businessHours: t("businessHours"),
      socialMedia: t("socialMedia"),
      noInfo: t("noInfo"),
    }

    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-opacity-75 backdrop-blur-md h-screen" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform bg-white shadow-xl border rounded-rounded p-5 text-left align-middle transition-all">
                  <Dialog.Title className="flex items-center justify-between mb-5">
                    <span className="text-large-semi">{t("title")}</span>
                    <button
                      onClick={close}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Close"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </Dialog.Title>

                  {businessInfo === undefined ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <BusinessInfoDetails info={businessInfo} labels={labels} />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }
)

BusinessInfoPopup.displayName = "BusinessInfoPopup"
export default BusinessInfoPopup
