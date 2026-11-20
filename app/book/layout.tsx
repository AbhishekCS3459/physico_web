import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Book a Home Physiotherapy Visit in Calgary",
  description:
    "Book mobile physiotherapy, occupational therapy, or massage therapy at home in Calgary and nearby communities. Guest booking welcome. Call (587) 586-5566 for same-week visits.",
  path: "/book",
  keywords: [
    "book home physiotherapy Calgary",
    "schedule mobile physio Calgary",
    "online physio appointment Calgary",
  ],
})

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}
