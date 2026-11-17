import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Book an In-Home Physiotherapy Assessment",
  description:
    "Book a mobile physiotherapy, occupational therapy, or massage therapy visit at your home in Calgary and surrounding areas. Flexible scheduling and direct billing available.",
  path: "/book",
  keywords: [
    "book physiotherapy Calgary",
    "schedule home physio",
    "book occupational therapy Calgary",
  ],
})

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}
