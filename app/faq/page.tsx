import { EnhancedFooter } from "@/components/enhanced-footer"
import { MainNavigation } from "@/components/main-navigation"
import { PersistentCTA } from "@/components/persistent-cta"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, MessageSquareText } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ | Physio Rehab at Home",
  description: "Frequently asked questions about mobile physiotherapy, home visits, insurance coverage, and scheduling.",
}

const faqs = [
  {
    num: 1,
    q: "What is mobile physiotherapy?",
    a: "Mobile physiotherapy is a personalized, high-quality rehabilitation service delivered directly to your home. It offers the same clinical standards as a traditional clinic, with the added convenience, comfort, and individual attention of in-home care.",
  },
  {
    num: 2,
    q: "Who is suitable for home physiotherapy?",
    a: "Our services are ideal for individuals recovering from surgery, managing musculoskeletal conditions, experiencing chronic pain, dealing with sports injuries, or facing mobility limitations. It is also an excellent option for clients who prefer private, one-on-one treatment in their own environment.",
  },
  {
    num: 3,
    q: "What can I expect during my first appointment?",
    a: "Your initial session includes a comprehensive assessment, discussion of your health history and goals, clinical examination, and the development of a tailored treatment plan. Treatment may begin during the same visit.",
  },
  {
    num: 4,
    q: "What treatments do you provide?",
    a: "We offer evidence-based care including manual therapy, therapeutic exercise, movement retraining, soft tissue techniques, acupuncture, and rehabilitation programs designed specifically for your needs.",
  },
  {
    num: 5,
    q: "Do I need a referral?",
    a: "In most cases, a physician referral is not required. However, some insurance providers may request documentation depending on your coverage.",
  },
  {
    num: 6,
    q: "Are services covered by insurance?",
    a: "Yes. Detailed receipts are provided for reimbursement. We recommend confirming your benefits directly with your insurance provider.",
  },
  {
    num: 7,
    q: "How do I schedule an appointment?",
    a: "Appointments can be arranged conveniently by phone, email, or through our website contact form. We aim to provide flexible scheduling to suit your needs.",
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <MainNavigation />
      <main className="py-16 flex-1 w-full">
        <div className="container px-4">
          <div className="text-center mb-10 md:mb-16">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-4 w-4 mr-1" />
              Frequently Asked Questions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Answers for <span className="text-primary">home care</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Quick answers about mobile physiotherapy, scheduling, and what to expect from your first visit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {faqs.map((item) => (
              <Card
                key={item.q}
                className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <MessageSquareText className="h-4 w-4" />
                    </span>
                    <span>
                      {item.num}. {item.q}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 md:mt-14">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Still have questions?</h2>
                    <p className="text-muted-foreground">
                      Contact us and we will help you schedule your first appointment.
                    </p>
                  </div>
                  <a
                    href="/book"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground hover:brightness-95 transition-all duration-300"
                  >
                    Book an Assessment
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <EnhancedFooter />
      <PersistentCTA />
    </div>
  )
}

