"use client"

import { Badge, Button, clx } from "@modules/common/components/ui"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"
import { useTranslations } from "next-intl"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage,
  children,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const t = useTranslations("account")
  const { state: isEditing, close, toggle } = useToggleState()

  const handleEdit = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  const handleCancel = () => {
    clearState()
    close()
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div
      className={clx(
        "rounded-xl border transition-colors duration-200",
        isEditing
          ? "border-gray-300 bg-gray-50/60"
          : "border-gray-200 bg-white"
      )}
      data-testid={dataTestid}
    >
      {!isEditing ? (
        /* ── View mode ── */
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {label}
            </span>
            <div className="text-sm font-medium text-ui-fg-base mt-0.5">
              {typeof currentInfo === "string" ? (
                <span data-testid="current-info">{currentInfo}</span>
              ) : (
                currentInfo
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 h-8 px-4 text-sm"
            onClick={handleEdit}
            type="button"
            data-testid="edit-button"
            data-active={false}
          >
            {t("edit")}
          </Button>
        </div>
      ) : (
        /* ── Edit mode ── */
        <div className="flex flex-col gap-5 px-5 py-5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {label}
          </span>

          <div>{children}</div>

          {isSuccess && (
            <Badge
              className="p-2"
              color="green"
              data-testid="success-message"
            >
              {t("updateSuccess", { label })}
            </Badge>
          )}

          {isError && (
            <Badge
              className="p-2"
              color="red"
              data-testid="error-message"
            >
              {errorMessage ?? t("updateError")}
            </Badge>
          )}

          <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-200">
            <Button
              variant="secondary"
              className="h-9 px-5 text-sm"
              onClick={handleCancel}
              type="reset"
              data-testid="cancel-button"
            >
              {t("cancel")}
            </Button>
            <SubmitButton saveLabel={t("saveChanges")} />
          </div>
        </div>
      )}
    </div>
  )
}

const SubmitButton = ({ saveLabel }: { saveLabel: string }) => {
  const { pending } = useFormStatus()
  return (
    <Button
      isLoading={pending}
      className="h-9 px-5 text-sm"
      type="submit"
      data-testid="save-button"
    >
      {saveLabel}
    </Button>
  )
}

export default AccountInfo
