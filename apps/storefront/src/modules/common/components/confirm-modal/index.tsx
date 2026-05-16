"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { clx } from "@modules/common/components/ui"

type ConfirmVariant = "danger" | "primary" | "inverse"

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  confirmVariant?: ConfirmVariant
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const confirmStyles: Record<ConfirmVariant, string> = {
  danger:  "bg-danger text-danger-fg hover:bg-danger-hover",
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  inverse: "bg-inverse text-inverse-fg hover:bg-inverse-hover",
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[300]" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col gap-y-4">
              <Dialog.Title className="text-base font-semibold text-ui-fg-base">
                {title}
              </Dialog.Title>
              {description && (
                <p className="text-sm text-ui-fg-subtle">{description}</p>
              )}
              <div className="flex gap-x-3 pt-1">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 h-10 text-sm border border-gray-200 hover:border-black transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={clx("flex-1 h-10 text-sm transition-colors disabled:pointer-events-none", confirmStyles[confirmVariant])}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                    </span>
                  ) : confirmLabel}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
