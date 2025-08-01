import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  
  return NextResponse.json({ tenantId });
}

