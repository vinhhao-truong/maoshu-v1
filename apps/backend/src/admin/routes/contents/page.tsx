import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { useEffect, useRef, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"

type ContentItem = {
  id: string
  title: string
  handle: string
  type: string
  body: string | null
  excerpt: string | null
  thumbnail_url: string | null
  author: string | null
  status: string
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  is_active: boolean
  in_footer: boolean
  created_at: string
}

type ContentForm = {
  title: string
  handle: string
  type: string
  body: string
  excerpt: string
  thumbnail_url: string
  author: string
  status: string
  published_at: string
  seo_title: string
  seo_description: string
  is_active: boolean
  in_footer: boolean
}

const CONTENT_TYPE_VALUES = ["news", "terms", "privacy", "return_policy", "faq", "announcement"] as const
const CONTENT_STATUS_VALUES = ["draft", "published", "archived"] as const

const TYPE_COLORS: Record<string, "blue" | "green" | "orange" | "red" | "purple" | "grey"> = {
  news: "blue",
  terms: "purple",
  privacy: "purple",
  return_policy: "orange",
  faq: "green",
  announcement: "red",
}

const STATUS_COLORS: Record<string, "blue" | "green" | "orange" | "grey"> = {
  draft: "grey",
  published: "green",
  archived: "orange",
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
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
  const json = await res.json()
  return json.url as string
}

function ThumbnailUpload({
  value,
  onChange,
  folder,
}: {
  value: string
  onChange: (url: string) => void
  folder: string
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null!)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadFile(file, folder, value || undefined)
      onChange(url)
    } catch (e: any) {
      toast.error(e?.message ?? t("contents.toast.uploadError"))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      {value ? (
        <div className="relative overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle">
          <img
            src={value}
            alt="Thumbnail"
            className="w-full object-cover"
            style={{ maxHeight: 180 }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ui-bg-base text-ui-fg-subtle shadow hover:text-ui-fg-base"
            title="Remove image"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className="flex h-28 cursor-pointer flex-col items-center justify-center gap-y-1 rounded-md border border-dashed border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base"
          onClick={() => inputRef.current?.click()}
        >
          <Text size="small" className="text-ui-fg-muted">
            {t("contents.thumbnail.clickToUpload")}
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            {t("contents.thumbnail.formats")}
          </Text>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />

      <Button
        size="small"
        variant="secondary"
        isLoading={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {value ? t("contents.thumbnail.replace") : t("contents.thumbnail.upload")}
      </Button>
    </div>
  )
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return ""
  return iso.slice(0, 16)
}

const emptyForm = (): ContentForm => ({
  title: "",
  handle: "",
  type: "news",
  body: "",
  excerpt: "",
  thumbnail_url: "",
  author: "",
  status: "draft",
  published_at: "",
  seo_title: "",
  seo_description: "",
  is_active: true,
  in_footer: false,
})

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={[
        "flex h-7 w-7 items-center justify-center rounded text-sm transition-colors",
        active
          ? "bg-ui-bg-interactive text-ui-fg-on-color"
          : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
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
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const linkInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline text-blue-600" } }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[240px] px-4 py-3 focus:outline-none",
      },
    },
  })

  // Sync external value changes (e.g. opening a different record)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false)
    }
  }, [value])

  useEffect(() => {
    if (showLinkInput) linkInputRef.current?.focus()
  }, [showLinkInput])

  const applyLink = useCallback(() => {
    if (!editor) return
    const url = linkUrl.trim()
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
    setShowLinkInput(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-base focus-within:border-ui-border-interactive focus-within:ring-1 focus-within:ring-ui-border-interactive">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1 border-b border-ui-border-base bg-ui-bg-subtle px-2 py-1.5">
        {/* History */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↩</ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↪</ToolbarButton>

        <div className="mx-1 h-4 w-px bg-ui-border-base" />

        {/* Headings */}
        <ToolbarButton title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>

        <div className="mx-1 h-4 w-px bg-ui-border-base" />

        {/* Inline marks */}
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolbarButton>
        <ToolbarButton title="Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>{"<>"}</ToolbarButton>

        <div className="mx-1 h-4 w-px bg-ui-border-base" />

        {/* Lists */}
        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• —</ToolbarButton>
        <ToolbarButton title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarButton>

        <div className="mx-1 h-4 w-px bg-ui-border-base" />

        {/* Blockquote & code block */}
        <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</ToolbarButton>
        <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"{ }"}</ToolbarButton>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarButton>

        <div className="mx-1 h-4 w-px bg-ui-border-base" />

        {/* Link */}
        <ToolbarButton
          title={editor.isActive("link") ? "Edit link" : "Add link"}
          active={editor.isActive("link")}
          onClick={() => {
            setLinkUrl(editor.getAttributes("link").href ?? "")
            setShowLinkInput((v) => !v)
          }}
        >
          🔗
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>✕</ToolbarButton>
        )}
      </div>

      {/* Link input row */}
      {showLinkInput && (
        <div className="flex items-center gap-x-2 border-b border-ui-border-base bg-ui-bg-subtle px-3 py-2">
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink() } if (e.key === "Escape") setShowLinkInput(false) }}
            placeholder={t("contents.editor.urlPlaceholder")}
            className="flex-1 rounded border border-ui-border-base bg-ui-bg-base px-2 py-1 text-sm text-ui-fg-base focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
          />
          <button type="button" onMouseDown={(e) => { e.preventDefault(); applyLink() }} className="rounded bg-ui-button-inverted px-3 py-1 text-sm text-ui-fg-on-color hover:bg-ui-button-inverted-hover">
            {t("contents.editor.apply")}
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowLinkInput(false) }} className="text-sm text-ui-fg-subtle hover:text-ui-fg-base">
            {t("contents.editor.cancel")}
          </button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}

function ContentFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: ContentItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ContentForm>(
    item
      ? {
          title: item.title,
          handle: item.handle,
          type: item.type,
          body: item.body ?? "",
          excerpt: item.excerpt ?? "",
          thumbnail_url: item.thumbnail_url ?? "",
          author: item.author ?? "",
          status: item.status,
          published_at: toDatetimeLocal(item.published_at),
          seo_title: item.seo_title ?? "",
          seo_description: item.seo_description ?? "",
          is_active: item.is_active,
          in_footer: item.in_footer,
        }
      : emptyForm()
  )
  const [saving, setSaving] = useState(false)

  const set = (key: keyof ContentForm) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      handle: item ? f.handle : slugify(title),
    }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.handle.trim() || !form.type) {
      toast.error(t("contents.toast.validationError"))
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        handle: form.handle.trim(),
        type: form.type,
        body: form.body && form.body !== "<p></p>" ? form.body : null,
        excerpt: form.excerpt.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        author: form.author.trim() || null,
        status: form.status,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        is_active: form.is_active,
        in_footer: form.in_footer,
      }

      if (item) {
        await adminFetch(`/admin/contents/${item.id}`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success(t("contents.toast.updated"))
      } else {
        await adminFetch("/admin/contents", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success(t("contents.toast.created"))
      }
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e?.message ?? t("contents.toast.saveError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <FocusModal open onOpenChange={(open) => !open && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button onClick={handleSubmit} isLoading={saving}>
            {t("common.save")}
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center overflow-y-auto py-10">
          <div className="flex w-full max-w-2xl flex-col gap-y-8">
            <Heading>{item ? t("contents.editTitle") : t("contents.newTitle")}</Heading>

            {/* Basic Info */}
            <div className="flex flex-col gap-y-4">
              <Text weight="plus">{t("contents.form.basicInfo")}</Text>

              <div className="flex flex-col gap-y-2">
                <Label>{t("contents.form.title")}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={t("contents.form.titlePlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>{t("contents.form.handle")}</Label>
                <Input
                  value={form.handle}
                  onChange={(e) => set("handle")(e.target.value)}
                  placeholder={t("contents.form.handlePlaceholder")}
                />
                <Text size="small" className="text-ui-fg-subtle">
                  {t("contents.form.handleHint")}
                </Text>
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col gap-y-2">
                  <Label>{t("contents.form.type")}</Label>
                  <Select value={form.type} onValueChange={set("type")}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {CONTENT_TYPE_VALUES.map((v) => (
                        <Select.Item key={v} value={v}>
                          {t(`contents.types.${v}`)}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label>{t("contents.form.status")}</Label>
                  <Select value={form.status} onValueChange={set("status")}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {CONTENT_STATUS_VALUES.map((v) => (
                        <Select.Item key={v} value={v}>
                          {t(`contents.statuses.${v}`)}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>{t("contents.form.active")}</Label>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => set("is_active")(v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-0.5">
                  <Label>{t("contents.form.showInFooter")}</Label>
                  <Text size="small" className="text-ui-fg-subtle">
                    {t("contents.form.showInFooterHint")}
                  </Text>
                </div>
                <Switch
                  checked={form.in_footer}
                  onCheckedChange={(v) => set("in_footer")(v)}
                />
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-y-4">
              <Text weight="plus">{t("contents.form.content")}</Text>

              <div className="flex flex-col gap-y-2">
                <Label>{t("contents.form.excerpt")}</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => set("excerpt")(e.target.value)}
                  placeholder={t("contents.form.excerptPlaceholder")}
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>{t("contents.form.body")}</Label>
                <RichTextEditor
                  value={form.body}
                  onChange={(html) => set("body")(html)}
                />
              </div>
            </div>

            {/* Media & Author */}
            <div className="flex flex-col gap-y-4">
              <Text weight="plus">{t("contents.form.mediaAuthor")}</Text>

              <div className="flex flex-col gap-y-2">
                <Label>{t("contents.form.thumbnail")}</Label>
                <ThumbnailUpload
                  value={form.thumbnail_url}
                  onChange={(url) => set("thumbnail_url")(url)}
                  folder={item ? `content/${item.id}/thumbnail` : "content/thumbnail"}
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col gap-y-2">
                  <Label>{t("contents.form.author")}</Label>
                  <Input
                    value={form.author}
                    onChange={(e) => set("author")(e.target.value)}
                    placeholder={t("contents.form.authorPlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label>{t("contents.form.publishDate")}</Label>
                  <Input
                    type="datetime-local"
                    value={form.published_at}
                    onChange={(e) => set("published_at")(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="flex flex-col gap-y-4">
              <Text weight="plus">{t("contents.form.seo")}</Text>

              <div className="flex flex-col gap-y-2">
                <Label>{t("contents.form.seoTitle")}</Label>
                <Input
                  value={form.seo_title}
                  onChange={(e) => set("seo_title")(e.target.value)}
                  placeholder={t("contents.form.seoTitlePlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>{t("contents.form.seoDescription")}</Label>
                <Textarea
                  value={form.seo_description}
                  onChange={(e) => set("seo_description")(e.target.value)}
                  placeholder={t("contents.form.seoDescriptionPlaceholder")}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

const ContentsPage = () => {
  const { t } = useTranslation()
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<ContentItem | null | "new">(null)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadContents = () => {
    setLoading(true)
    adminFetch("/admin/contents")
      .then((d) => setContents(d.contents ?? []))
      .catch(() => toast.error(t("contents.toast.loadError")))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadContents()
  }, [])

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(t("contents.deleteConfirm", { title: item.title }))) return
    try {
      await adminFetch(`/admin/contents/${item.id}`, { method: "DELETE" })
      toast.success(t("contents.toast.deleted"))
      loadContents()
    } catch {
      toast.error(t("contents.toast.deleteError"))
    }
  }

  const filtered = contents.filter((c) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    return true
  })

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Heading>{t("contents.title")}</Heading>
        <Button size="small" onClick={() => setEditTarget("new")}>
          {t("contents.add")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-x-4 border-b px-6 py-3">
        <div className="flex items-center gap-x-2">
          <Text size="small" className="text-ui-fg-subtle">
            {t("contents.filters.type")}
          </Text>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <Select.Trigger className="h-7 min-w-[140px]">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">{t("contents.filters.allTypes")}</Select.Item>
              {CONTENT_TYPE_VALUES.map((v) => (
                <Select.Item key={v} value={v}>
                  {t(`contents.types.${v}`)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex items-center gap-x-2">
          <Text size="small" className="text-ui-fg-subtle">
            {t("contents.filters.status")}
          </Text>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger className="h-7 min-w-[130px]">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">{t("contents.filters.allStatuses")}</Select.Item>
              {CONTENT_STATUS_VALUES.map((v) => (
                <Select.Item key={v} value={v}>
                  {t(`contents.statuses.${v}`)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        {filtered.length !== contents.length && (
          <Text size="small" className="text-ui-fg-subtle">
            {t("contents.filters.showing", { filtered: filtered.length, total: contents.length })}
          </Text>
        )}
      </div>

      {loading ? (
        <p className="px-6 py-4 text-ui-fg-muted">{t("common.loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="px-6 py-4 text-ui-fg-muted">
          {contents.length === 0 ? t("contents.empty") : t("contents.emptyFiltered")}
        </p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("contents.table.title")}</Table.HeaderCell>
              <Table.HeaderCell>{t("contents.table.type")}</Table.HeaderCell>
              <Table.HeaderCell>{t("contents.table.status")}</Table.HeaderCell>
              <Table.HeaderCell>{t("contents.table.published")}</Table.HeaderCell>
              <Table.HeaderCell>{t("contents.table.active")}</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Text weight="plus">{item.title}</Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      /{item.handle}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={TYPE_COLORS[item.type] ?? "grey"} size="2xsmall">
                    {t(`contents.types.${item.type}`, { defaultValue: item.type })}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={STATUS_COLORS[item.status] ?? "grey"} size="2xsmall">
                    {t(`contents.statuses.${item.status}`, { defaultValue: item.status })}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {formatDate(item.published_at)}
                </Table.Cell>
                <Table.Cell>
                  <Checkbox checked={item.is_active} disabled />
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setEditTarget(item)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(item)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {editTarget !== null && (
        <ContentFormModal
          item={editTarget === "new" ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={loadContents}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Content",
})

export default ContentsPage
