import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type Category = {
  id: string
  name: string
  parent_category_id: string | null
}

type BusinessInfo = {
  id?: string
  store_name: string
  tagline: string
  logo_url: string
  logo_white_url: string
  logo_black_url: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  country: string
  postal_code: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  tiktok_url: string
  youtube_url: string
  zalo_url: string
  about_us: string
  business_hours: string
  tax_id: string
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(",")[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function uploadFile(file: File, folder: string, oldUrl?: string): Promise<string> {
  const data = await readAsBase64(file)
  const res = await fetch(`/admin/media`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, data, folder, ...(oldUrl ? { oldUrl } : {}) }),
  })
  if (!res.ok) throw new Error("Upload failed")
  return (await res.json()).url as string
}

const empty = (): BusinessInfo => ({
  store_name: "",
  tagline: "",
  logo_url: "",
  logo_white_url: "",
  logo_black_url: "",
  email: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  tiktok_url: "",
  youtube_url: "",
  zalo_url: "",
  about_us: "",
  business_hours: "",
  tax_id: "",
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Text weight="plus" className="text-ui-fg-base">
          {title}
        </Text>
      </div>
      <div className="flex flex-col gap-y-5 px-6 py-6">{children}</div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-start gap-x-6">
      <div className="pt-2">
        <Label className="text-ui-fg-base">{label}</Label>
        {hint && (
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            {hint}
          </Text>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

type ToolbarButtonProps = {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={[
        "flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-ui-bg-interactive text-ui-fg-on-color"
          : "text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const { t } = useTranslation()
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-ui-border-base px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-ui-border-base" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-ui-border-base" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          1. List
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-ui-border-base" />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt(t("contents.editor.enterUrl"))
            if (url) editor.chain().focus().setLink({ href: url }).run()
            else editor.chain().focus().unsetLink().run()
          }}
          active={editor.isActive("link")}
          title="Link"
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          " "
        </ToolbarButton>
        <div className="ml-auto">
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear formatting"
          >
            Clear
          </ToolbarButton>
        </div>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm min-h-[200px] max-w-none px-4 py-3 text-ui-fg-base focus-within:outline-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none"
      />
    </div>
  )
}

const BusinessInfoPage = () => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [form, setForm] = useState<BusinessInfo>(empty())
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({ main: false, white: false, black: false })
  const logoInputRef = useRef<HTMLInputElement>(null!)
  const logoWhiteInputRef = useRef<HTMLInputElement>(null!)
  const logoBlackInputRef = useRef<HTMLInputElement>(null!)

  const set = (key: keyof BusinessInfo) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  // Load root categories on mount
  useEffect(() => {
    adminFetch("/admin/product-categories?limit=100")
      .then((d) => {
        const roots = (d.product_categories as Category[]).filter(
          (c) => c.parent_category_id === null
        )
        setCategories(roots)
      })
      .catch(() => toast.error(t("businessInfo.toast.loadError")))
      .finally(() => setLoading(false))
  }, [])

  // Load business info when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setForm(empty())
      return
    }
    setFormLoading(true)
    adminFetch(`/admin/business-info?root_category_id=${selectedCategoryId}`)
      .then((d) => {
        if (d.business_info) {
          const b = d.business_info
          setForm({
            store_name: b.store_name ?? "",
            tagline: b.tagline ?? "",
            logo_url: b.logo_url ?? "",
            logo_white_url: b.logo_white_url ?? "",
            logo_black_url: b.logo_black_url ?? "",
            email: b.email ?? "",
            phone: b.phone ?? "",
            address_line1: b.address_line1 ?? "",
            address_line2: b.address_line2 ?? "",
            city: b.city ?? "",
            state: b.state ?? "",
            country: b.country ?? "",
            postal_code: b.postal_code ?? "",
            facebook_url: b.facebook_url ?? "",
            instagram_url: b.instagram_url ?? "",
            twitter_url: b.twitter_url ?? "",
            tiktok_url: b.tiktok_url ?? "",
            youtube_url: b.youtube_url ?? "",
            zalo_url: b.zalo_url ?? "",
            about_us: b.about_us ?? "",
            business_hours: b.business_hours ?? "",
            tax_id: b.tax_id ?? "",
          })
        } else {
          setForm(empty())
        }
      })
      .catch(() => toast.error(t("businessInfo.toast.loadError")))
      .finally(() => setFormLoading(false))
  }, [selectedCategoryId])

  const handleLogoUpload = async (file: File, variant: "main" | "white" | "black") => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("businessInfo.toast.fileTooLarge"))
      return
    }
    const field = variant === "main" ? "logo_url" : variant === "white" ? "logo_white_url" : "logo_black_url"
    const folder = variant === "main" ? "business-info/logo" : `business-info/logo_${variant}`
    setUploading((u) => ({ ...u, [variant]: true }))
    try {
      const url = await uploadFile(file, folder, (form[field] as string) || undefined)
      setForm((f) => ({ ...f, [field]: url }))
    } catch (e: any) {
      toast.error(e?.message ?? t("businessInfo.toast.uploadError"))
    } finally {
      setUploading((u) => ({ ...u, [variant]: false }))
    }
  }

  const handleSave = async () => {
    if (!selectedCategoryId) {
      toast.error(t("businessInfo.toast.selectCategory"))
      return
    }
    if (!form.store_name.trim()) {
      toast.error(t("businessInfo.toast.validationError"))
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, string | null> = {}
      for (const [k, v] of Object.entries(form)) {
        payload[k] = (v as string).trim() || null
      }
      payload.store_name = form.store_name.trim()
      payload.about_us = form.about_us || null
      payload.root_category_id = selectedCategoryId

      await adminFetch("/admin/business-info", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      toast.success(t("businessInfo.toast.saved"))
    } catch (e: any) {
      toast.error(e?.message ?? t("businessInfo.toast.saveError"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <p className="text-ui-fg-muted p-6">{t("common.loading")}</p>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between rounded-lg border border-ui-border-base bg-ui-bg-base px-6 py-4">
        <div>
          <Heading>{t("businessInfo.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            {t("businessInfo.subtitle")}
          </Text>
        </div>
        <Button onClick={handleSave} isLoading={saving} disabled={!selectedCategoryId}>
          {t("common.saveChanges")}
        </Button>
      </div>

      {/* Category selector */}
      <div className="rounded-lg border border-ui-border-base bg-ui-bg-base px-6 py-4">
        <div className="grid grid-cols-[200px_1fr] items-center gap-x-6">
          <div>
            <Label className="text-ui-fg-base">{t("businessInfo.fields.category")}</Label>
            <Text size="small" className="text-ui-fg-subtle mt-0.5">
              {t("businessInfo.fields.categoryHint")}
            </Text>
          </div>
          <Select
            value={selectedCategoryId ?? "__none__"}
            onValueChange={(v) => setSelectedCategoryId(v === "__none__" ? null : v)}
          >
            <Select.Trigger>
              <Select.Value placeholder={t("businessInfo.placeholders.selectCategory")} />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="__none__">
                — {t("businessInfo.placeholders.selectCategory")} —
              </Select.Item>
              {categories.map((c) => (
                <Select.Item key={c.id} value={c.id}>
                  {c.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>

      {!selectedCategoryId ? (
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-6 py-12 text-center">
          <Text className="text-ui-fg-subtle">{t("businessInfo.selectCategoryPrompt")}</Text>
        </div>
      ) : formLoading ? (
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-6 py-12 text-center">
          <Text className="text-ui-fg-muted">{t("common.loading")}</Text>
        </div>
      ) : (
        <>
          {/* Brand */}
          <Section title={t("businessInfo.sections.brand")}>
            <Field label={t("businessInfo.fields.logo")} hint={t("businessInfo.fields.logoHint")}>
              <div className="flex flex-col gap-y-3">
                {form.logo_url ? (
                  <div className="relative w-fit overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
                    <img
                      src={form.logo_url}
                      alt="Logo"
                      className="max-h-16 max-w-[200px] object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, logo_url: "" }))}
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ui-bg-base text-xs text-ui-fg-subtle shadow hover:text-ui-fg-base"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex h-20 w-48 cursor-pointer flex-col items-center justify-center gap-y-1 rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Text size="small" className="text-ui-fg-muted">
                      {t("businessInfo.logo.clickToUpload")}
                    </Text>
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleLogoUpload(file, "main")
                    e.target.value = ""
                  }}
                />
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={uploading.main}
                  onClick={() => logoInputRef.current?.click()}
                  className="w-fit"
                >
                  {form.logo_url ? t("businessInfo.logo.replaceLogo") : t("businessInfo.logo.uploadLogo")}
                </Button>
              </div>
            </Field>

            <Field label={t("businessInfo.fields.logoWhite")} hint={t("businessInfo.fields.logoWhiteHint")}>
              <div className="flex flex-col gap-y-3">
                {form.logo_white_url ? (
                  <div className="relative w-fit overflow-hidden rounded-lg border border-ui-border-base bg-gray-900 p-3">
                    <img
                      src={form.logo_white_url}
                      alt="Logo White"
                      className="max-h-16 max-w-[200px] object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, logo_white_url: "" }))}
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ui-bg-base text-xs text-ui-fg-subtle shadow hover:text-ui-fg-base"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex h-20 w-48 cursor-pointer flex-col items-center justify-center gap-y-1 rounded-lg border border-dashed border-ui-border-base bg-gray-900 hover:bg-gray-800"
                    onClick={() => logoWhiteInputRef.current?.click()}
                  >
                    <Text size="small" className="text-gray-400">
                      {t("businessInfo.logo.clickToUpload")}
                    </Text>
                  </div>
                )}
                <input
                  ref={logoWhiteInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleLogoUpload(file, "white")
                    e.target.value = ""
                  }}
                />
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={uploading.white}
                  onClick={() => logoWhiteInputRef.current?.click()}
                  className="w-fit"
                >
                  {form.logo_white_url ? t("businessInfo.logo.replaceLogo") : t("businessInfo.logo.uploadLogo")}
                </Button>
              </div>
            </Field>

            <Field label={t("businessInfo.fields.logoBlack")} hint={t("businessInfo.fields.logoBlackHint")}>
              <div className="flex flex-col gap-y-3">
                {form.logo_black_url ? (
                  <div className="relative w-fit overflow-hidden rounded-lg border border-ui-border-base bg-white p-3">
                    <img
                      src={form.logo_black_url}
                      alt="Logo Black"
                      className="max-h-16 max-w-[200px] object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, logo_black_url: "" }))}
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ui-bg-base text-xs text-ui-fg-subtle shadow hover:text-ui-fg-base"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex h-20 w-48 cursor-pointer flex-col items-center justify-center gap-y-1 rounded-lg border border-dashed border-ui-border-base bg-white hover:bg-gray-50"
                    onClick={() => logoBlackInputRef.current?.click()}
                  >
                    <Text size="small" className="text-gray-400">
                      {t("businessInfo.logo.clickToUpload")}
                    </Text>
                  </div>
                )}
                <input
                  ref={logoBlackInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleLogoUpload(file, "black")
                    e.target.value = ""
                  }}
                />
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={uploading.black}
                  onClick={() => logoBlackInputRef.current?.click()}
                  className="w-fit"
                >
                  {form.logo_black_url ? t("businessInfo.logo.replaceLogo") : t("businessInfo.logo.uploadLogo")}
                </Button>
              </div>
            </Field>

            <Field label={t("businessInfo.fields.storeName")}>
              <Input
                value={form.store_name}
                onChange={(e) => set("store_name")(e.target.value)}
                placeholder={t("businessInfo.placeholders.storeName")}
              />
            </Field>

            <Field label={t("businessInfo.fields.tagline")} hint={t("businessInfo.fields.taglineHint")}>
              <Input
                value={form.tagline}
                onChange={(e) => set("tagline")(e.target.value)}
                placeholder={t("businessInfo.placeholders.tagline")}
              />
            </Field>
          </Section>

          {/* Contact */}
          <Section title={t("businessInfo.sections.contact")}>
            <Field label={t("businessInfo.fields.email")}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder={t("businessInfo.placeholders.email")}
              />
            </Field>
            <Field label={t("businessInfo.fields.phone")}>
              <Input
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder={t("businessInfo.placeholders.phone")}
              />
            </Field>
          </Section>

          {/* Address */}
          <Section title={t("businessInfo.sections.address")}>
            <Field label={t("businessInfo.fields.addressLine1")}>
              <Input
                value={form.address_line1}
                onChange={(e) => set("address_line1")(e.target.value)}
                placeholder={t("businessInfo.placeholders.addressLine1")}
              />
            </Field>
            <Field label={t("businessInfo.fields.addressLine2")}>
              <Input
                value={form.address_line2}
                onChange={(e) => set("address_line2")(e.target.value)}
                placeholder={t("businessInfo.placeholders.addressLine2")}
              />
            </Field>
            <div className="grid grid-cols-[200px_1fr] items-start gap-x-6">
              <div className="pt-2">
                <Label>{t("businessInfo.fields.cityStatePostal")}</Label>
              </div>
              <div className="grid grid-cols-3 gap-x-3">
                <Input value={form.city} onChange={(e) => set("city")(e.target.value)} placeholder={t("businessInfo.placeholders.city")} />
                <Input value={form.state} onChange={(e) => set("state")(e.target.value)} placeholder={t("businessInfo.placeholders.state")} />
                <Input value={form.postal_code} onChange={(e) => set("postal_code")(e.target.value)} placeholder={t("businessInfo.placeholders.postalCode")} />
              </div>
            </div>
            <Field label={t("businessInfo.fields.country")}>
              <Input
                value={form.country}
                onChange={(e) => set("country")(e.target.value)}
                placeholder={t("businessInfo.placeholders.country")}
              />
            </Field>
          </Section>

          {/* Social Media */}
          <Section title={t("businessInfo.sections.socialMedia")}>
            {(
              [
                ["Facebook", "facebook_url", "https://facebook.com/yourpage"],
                ["Instagram", "instagram_url", "https://instagram.com/yourhandle"],
                ["TikTok", "tiktok_url", "https://tiktok.com/@yourhandle"],
                ["YouTube", "youtube_url", "https://youtube.com/@yourchannel"],
                ["X / Twitter", "twitter_url", "https://x.com/yourhandle"],
                ["Zalo", "zalo_url", "https://zalo.me/yourpage"],
              ] as [string, keyof BusinessInfo, string][]
            ).map(([label, field, placeholder]) => (
              <Field key={field} label={label}>
                <Input
                  value={form[field] as string}
                  onChange={(e) => set(field)(e.target.value)}
                  placeholder={placeholder}
                />
              </Field>
            ))}
          </Section>

          {/* About Us */}
          <Section title={t("businessInfo.sections.aboutUs")}>
            <div className="flex flex-col gap-y-2">
              <Text size="small" className="text-ui-fg-subtle">
                {t("businessInfo.fields.aboutUsHint")}
              </Text>
              <RichTextEditor
                key={selectedCategoryId}
                value={form.about_us}
                onChange={set("about_us")}
              />
            </div>
          </Section>

          {/* Other */}
          <Section title={t("businessInfo.sections.other")}>
            <Field label={t("businessInfo.fields.businessHours")} hint={t("businessInfo.fields.businessHoursHint")}>
              <Textarea
                value={form.business_hours}
                onChange={(e) => set("business_hours")(e.target.value)}
                placeholder={"Mon–Fri: 9:00am – 6:00pm\nSat: 9:00am – 12:00pm\nSun: Closed"}
                rows={3}
              />
            </Field>
            <Field label={t("businessInfo.fields.taxId")}>
              <Input
                value={form.tax_id}
                onChange={(e) => set("tax_id")(e.target.value)}
                placeholder={t("businessInfo.placeholders.taxId")}
              />
            </Field>
          </Section>
        </>
      )}

      {/* Sticky save footer */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-end border-t border-ui-border-base bg-ui-bg-base px-8 py-3 shadow-md">
        <Button onClick={handleSave} isLoading={saving} disabled={!selectedCategoryId}>
          {t("common.saveChanges")}
        </Button>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Business Info",
})

export default BusinessInfoPage
