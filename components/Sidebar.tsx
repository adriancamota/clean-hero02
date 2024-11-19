import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { MapPin, Trash, Coins, Medal, Settings, Home } from "lucide-react"
import { getUserByEmail } from "@/utils/db/actions"

interface SidebarProps {
  open: boolean
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const email = localStorage.getItem('userEmail')
      if (email) {
        try {
          const user = await getUserByEmail(email)
          setIsAdmin(!!user?.isAdmin)
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }

    // Initial check
    checkAdminStatus()

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userEmail') {
        checkAdminStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Custom event for logout
    const handleLogout = () => {
      setIsAdmin(false)
    }
    window.addEventListener('logout', handleLogout)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logout', handleLogout)
    }
  }, [])

  const sidebarItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/report", icon: MapPin, label: "Report Waste" },
    { href: "/collect", icon: Trash, label: "Collect Waste" },
    { href: "/rewards", icon: Coins, label: "Rewards" },
    { href: "/leaderboard", icon: Medal, label: "Leaderboard" },
    ...(isAdmin ? [{ href: "/admin", icon: Settings, label: "Admin" }] : []),
  ]

  return (
    <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-20 text-gray-800 dark:text-gray-200 w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <nav className="h-full flex flex-col justify-between">
        <div className="px-4 py-6 space-y-8">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button 
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start py-3 ${
                  pathname === item.href 
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`} 
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="text-base">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/settings" passHref>
            <Button 
              variant={pathname === "/settings" ? "secondary" : "outline"}
              className={`w-full py-3 ${
                pathname === "/settings"
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                  : "text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`} 
            >
              <Settings className="mr-3 h-5 w-5" />
              <span className="text-base">Settings</span>
            </Button>
          </Link>
        </div>
      </nav>
    </aside>
  )
}