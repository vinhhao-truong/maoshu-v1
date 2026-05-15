"use server"

import { sdk } from "@lib/config"
import { cookies as nextCookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "_medusa_admin_jwt"

export const loginAdmin = async (formData: FormData) => {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const token = await sdk.auth.login("user", "emailpass", { email, password })
    const cookies = await nextCookies()
    cookies.set(COOKIE_NAME, token as string, {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
  } catch {
    redirect("/design-system/login?error=1")
  }

  redirect("/design-system")
}

export const logoutAdmin = async () => {
  const cookies = await nextCookies()
  cookies.set(COOKIE_NAME, "", { maxAge: -1 })
  redirect("/design-system/login")
}

export const verifyAdminSession = async (): Promise<boolean> => {
  const cookies = await nextCookies()
  const token = cookies.get(COOKIE_NAME)?.value
  if (!token) return false

  try {
    await sdk.client.fetch("/admin/users", {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    })
    return true
  } catch {
    return false
  }
}
