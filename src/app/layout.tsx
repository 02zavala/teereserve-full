import type { Metadata } from "next"
import { Playfair_Display, Montserrat, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import Providers from "@/components/providers/session-provider"
import WhatsAppWidget from "@/components/whatsapp-widget"
import PWAInstaller from "@/components/PWAInstaller"
import CookieBanner from "@/components/CookieBanner"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import FloatingGoogleButton from "@/components/FloatingGoogleButton"

// Fuente principal para títulos elegantes
const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
})

// Fuente para texto base y navegación
const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: 'swap',
})

// Fuente para títulos especiales y destacados
const dmSerifDisplay = DM_Serif_Display({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: 'swap',
})

export const metadata: Metadata = {
  title: "TeeReserve Golf - Encuentra Tu Tee Time Perfecto",
  description: "La plataforma #1 de golf en México. Conecta con los campos más icónicos de México y disfruta el golf como debe vivirse: con elegancia, exclusividad y sin complicaciones.",
  keywords: "golf, reservas, tee time, México, campos de golf, Los Cabos",
  authors: [{ name: "TeeReserve Golf" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TeeReserve Golf",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png'
  },
  openGraph: {
    title: "TeeReserve Golf - Encuentra Tu Tee Time Perfecto",
    description: "La plataforma #1 de golf en México",
    url: "https://teereserve.golf",
    siteName: "TeeReserve Golf",
    images: [
      {
        url: "/logo-final.png",
        width: 300,
        height: 420,
        alt: "TeeReserve Golf Logo",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeeReserve Golf - Encuentra Tu Tee Time Perfecto",
    description: "La plataforma #1 de golf en México",
    images: ["/logo-final.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'TeeReserve Golf',
    'application-name': 'TeeReserve Golf',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml'
  }
}

export const viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} ${dmSerifDisplay.variable} font-montserrat`}>
        <ThemeProvider>
          <LanguageProvider>
            <Providers>
              {children}
              <WhatsAppWidget />
              <PWAInstaller />
              <CookieBanner />
              {/* <FloatingGoogleButton /> */}
            </Providers>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
