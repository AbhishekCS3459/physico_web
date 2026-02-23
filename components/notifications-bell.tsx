"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  chartId: string | null
  link: string | null
  createdAt: string
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" })
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {
      setItems([])
      setUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const t = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(t)
  }, [fetchNotifications])

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetchNotifications().finally(() => setLoading(false))
    }
  }, [open, fetchNotifications])

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH", credentials: "include" })
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // ignore
    }
  }

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ markAllRead: true }),
      })
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-border">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-3 py-2 flex items-center justify-between">
          <span className="font-medium text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
        ) : (
          <ScrollArea className="h-[280px]">
            <ul className="p-2 space-y-1">
              {items.map((n) => (
                <li key={n.id}>
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => {
                        markRead(n.id)
                        setOpen(false)
                      }}
                      className={`block rounded-md p-2 text-sm transition-colors hover:bg-muted ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <p className="font-medium leading-tight">{n.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-muted-foreground text-[10px] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left rounded-md p-2 text-sm transition-colors hover:bg-muted ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <p className="font-medium leading-tight">{n.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-muted-foreground text-[10px] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
