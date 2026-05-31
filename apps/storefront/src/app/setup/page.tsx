const ADMIN_URL = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"}/app`

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">Setup required</h1>
          <p className="text-sm text-gray-500">
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">ROOT_CATEGORY_ID</code>{" "}
            is not set. The storefront needs a root category to display products.
          </p>
        </div>

        <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
          <li>
            Open the admin panel and go to{" "}
            <span className="font-medium">Categories</span>
          </li>
          <li>Find or create the root category for this storefront</li>
          <li>
            Copy its ID (starts with{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">pcat_</code>)
          </li>
          <li>
            Add it to your environment:{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
              ROOT_CATEGORY_ID=pcat_...
            </code>
          </li>
          <li>Redeploy the storefront</li>
        </ol>

        <a
          href={ADMIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gray-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-gray-700 transition-colors"
        >
          Open admin panel →
        </a>
      </div>
    </div>
  )
}
