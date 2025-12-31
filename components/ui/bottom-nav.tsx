"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, FileText, User } from "lucide-react"

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Feed", href: "/dashboard/feed", icon: Compass },
  { name: "Apply", href: "/dashboard/applications", icon: FileText },
  { name: "Profile", href: "/dashboard/profile/edit", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive
                  ? "text-amber-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon
                className={`h-6 w-6 mb-0.5 ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
