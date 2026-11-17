import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Create Account",
  description: "Create a patient account with Physio Rehab at Home.",
  path: "/register",
  noIndex: true,
})

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
