"use client"
import type React from "react"
import { useState } from "react"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import {
  IconHome,
  IconStethoscope,
  IconUsers,
  IconCurrencyDollar,
  IconPhone,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function ResponsiveSidebar({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Home",
      href: "#home",
      icon: <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Services",
      href: "#services",
      icon: <IconStethoscope className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Team",
      href: "#team",
      icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Pricing",
      href: "#pricing",
      icon: <IconCurrencyDollar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Contact",
      href: "#contact",
      icon: <IconPhone className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
  ]

  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden bg-white md:flex-row dark:bg-neutral-900",
        "min-h-screen",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <IconMapPin className="h-4 w-4" />
                <span className={cn("whitespace-pre", !open && "hidden")}>Calgary & Area</span>
              </div>
              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4" />
                <span className={cn("whitespace-pre", !open && "hidden")}>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <IconPhone className="h-4 w-4" />
                <span className={cn("whitespace-pre", !open && "hidden")}>(403) 123-4567</span>
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto bg-white dark:bg-neutral-900">
          {children}
        </div>
      </div>
    </div>
  )
}

export const Logo = () => {
  return (
    <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden relative">
        <Image src="/MainLogo.png" alt="Physio Rehab at Home" fill className="object-contain" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-black dark:text-white text-lg"
      >
        Physio Rehab
      </motion.span>
    </a>
  )
}

export const LogoIcon = () => {
  return (
    <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden relative">
        <Image src="/MainLogo.png" alt="Physio Rehab at Home" fill className="object-contain" />
      </div>
    </a>
  )
}
