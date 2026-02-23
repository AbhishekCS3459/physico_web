"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, open, setOpen, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar"
      className={cn(
        "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
)
Sidebar.displayName = "Sidebar"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-content"
    className={cn("flex flex-1 flex-col gap-2 overflow-auto p-2", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-body"
    className={cn("flex flex-1 flex-col gap-1 overflow-auto p-2", className)}
    {...props}
  />
))
SidebarBody.displayName = "SidebarBody"

interface SidebarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  link?: { label: string; href: string; icon: React.ReactNode }
}

const SidebarLink = React.forwardRef<HTMLAnchorElement, SidebarLinkProps>(
  ({ className, active, link, children, href: hrefProp, ...props }, ref) => {
    const href = link?.href ?? hrefProp
    const content = link ? (
      <>
        {link.icon}
        <span>{link.label}</span>
      </>
    ) : (
      children
    )
    return (
      <a
        ref={ref}
        href={href}
        data-slot="sidebar-link"
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active && "bg-sidebar-accent text-sidebar-accent-foreground",
          className
        )}
        {...props}
      >
        {content}
      </a>
    )
  }
)
SidebarLink.displayName = "SidebarLink"

export { Sidebar, SidebarContent, SidebarBody, SidebarLink }
