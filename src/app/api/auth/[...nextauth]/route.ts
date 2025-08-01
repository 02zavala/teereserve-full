import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              role: true
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            phone: user.phone
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.phone = token.phone as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Obtener rol de cliente por defecto
            const clientRole = await prisma.role.findUnique({
              where: { name: 'Client' }
            })

            if (!clientRole) {
              // Crear rol de cliente si no existe
              const newClientRole = await prisma.role.create({
                data: {
                  name: 'Client',
                  description: 'Cliente regular'
                }
              })

              // Crear usuario con Google
              await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name || '',
                  password: '', // No password for Google users
                  roleId: newClientRole.id
                }
              })
            } else {
              // Crear usuario con Google
              await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name || '',
                  password: '', // No password for Google users
                  roleId: clientRole.id
                }
              })
            }
          }

          return true
        } catch (error) {
          console.error('Error creating Google user:', error)
          return false
        }
      }

      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }

