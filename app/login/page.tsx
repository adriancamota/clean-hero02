'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserByEmail } from '@/utils/db/actions'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (email: string) => {
    try {
      const user = await getUserByEmail(email)
      
      if (user) {
        localStorage.setItem('userEmail', email)
        document.cookie = `userEmail=${email}; path=/`
        
        if (user.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        // Handle user not found case
        console.error('User not found')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  // ... rest of your login page code ...
} 