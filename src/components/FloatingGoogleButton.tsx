"use client"

import React from 'react'
import { signIn } from 'next-auth/react'
import { Button } from './ui/button'
import { ChromeIcon } from 'lucide-react'

export default function FloatingGoogleButton() {
  return (
    <Button
      onClick={() => signIn('google')}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
    >
      <ChromeIcon className="h-5 w-5" />
      Sign in with Google
    </Button>
  )
}
