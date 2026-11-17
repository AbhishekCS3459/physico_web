import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "My Bookings",
  description: "View and manage your physiotherapy bookings.",
  path: "/my-bookings",
  noIndex: true,
})

export default function MyBookingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
