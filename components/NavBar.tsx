'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { BookOpen, Menu } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

// Define the structure for a nav item
type NavItem = 
  | { label: string; href: string }
  | { label: string; action: 'login' | 'logout' };

// Update the NavBar props
interface NavBarProps {
    navItems: NavItem[];
}

export function NavBar({ navItems }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const NavItems = () => {
    const handleAction = async (action: 'login' | 'logout') => {
      if (action === 'login') {
        router.push('/login')
      } else if (action === 'logout') {
        await signOut({ callbackUrl: '/' })
      }
    };
  
    return (
      <>
        {navItems.map((item, index) => (
          'action' in item ? (
            <Button 
              key={index} 
              variant="outline" 
              size="sm"
              onClick={() => handleAction(item.action)}
            >
              {item.label}
            </Button>
          ) : (
            <Link key={index} className="text-sm font-medium hover:underline underline-offset-4" href={item.href}>
              {item.label}
            </Link>
          )
        ))}
      </>
    );
  };

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="ml-2 text-2xl font-bold text-primary">Fabulor</span>
      </Link>
      <nav className="ml-auto hidden md:flex items-center gap-4 sm:gap-6">
        <NavItems />
      </nav>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden ml-auto">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[240px] sm:w-[300px] bg-white">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Access the main navigation options for Fabulor.
          </SheetDescription>
          <nav className="flex flex-col gap-4 mt-4">
            <NavItems />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}