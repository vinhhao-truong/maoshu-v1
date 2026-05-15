import { loginAdmin } from "@lib/data/admin"
import Link from "next/link"

export const metadata = {
  title: "Admin Login",
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="min-h-screen bg-grey-5 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-grey-50 mb-2">
            Maoshu Store
          </p>
          <h1 className="text-2xl font-semibold text-grey-90">Maoshu Admin</h1>
          <p className="text-sm text-grey-50 mt-1">Admin access only</p>
        </div>

        {/* Card */}
        <div className="bg-grey-0 border border-grey-20 rounded-base p-8">
          <form action={loginAdmin} className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-grey-70 uppercase tracking-wide"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full border border-grey-20 rounded-base px-3 py-2.5 text-sm text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-grey-70 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <label
                htmlFor="password"
                className="text-xs font-medium text-grey-70 uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full border border-grey-20 rounded-base px-3 py-2.5 text-sm text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-grey-70 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <LoginError searchParams={searchParams} />

            <button
              type="submit"
              className="w-full bg-grey-90 text-grey-0 rounded-base py-2.5 text-sm font-medium hover:bg-grey-80 transition-colors mt-2"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-grey-40 mt-6">
          Use your Medusa admin credentials
        </p>
        <Link href="/" className="">
          <p className="text-center text-xs text-grey-40 mt-6">
            Back to store
          </p>
        </Link>
      </div>
    </div>
  )
}

async function LoginError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  if (!params.error) return null

  return (
    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-base px-3 py-2">
      Invalid email or password. Use your Medusa admin credentials.
    </p>
  )
}
