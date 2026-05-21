export function isPhoneUser(email: string | null | undefined): boolean {
  return !!email?.endsWith("@phone.store.local")
}
