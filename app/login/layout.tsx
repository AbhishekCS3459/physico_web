import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Staff Login",
  description: "Secure staff login for Physio Rehab at Home.",
  path: "/login",
  noIndex: true,
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
