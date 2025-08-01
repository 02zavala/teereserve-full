import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getTenantFromRequest(req: NextRequest) {
  // Extract tenant from subdomain or header
  const host = req.headers.get('host') || ''
  const subdomain = host.split('.')[0]
  
  // If it's localhost or main domain, return null (no tenant)
  if (subdomain === 'localhost' || subdomain === 'teereserve' || subdomain === 'www') {
    return null
  }
  
  // Find tenant by slug/subdomain
  const tenant = await prisma.tenant.findUnique({
    where: {
      slug: subdomain
    }
  })
  
  return tenant
}

export async function getTenantIdFromRequest(req: NextRequest): Promise<string | null> {
  const tenant = await getTenantFromRequest(req)
  return tenant?.id || null
}

export async function getTenantById(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId
    }
  })
  
  return tenant
}

export async function createTenant(data: {
  name: string
  slug: string
}) {
  const tenant = await prisma.tenant.create({
    data
  })
  
  return tenant
}

