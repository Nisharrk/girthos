import { NextResponse } from 'next/server'
import { isValidApiKey } from '@/lib/auth.mjs'

export function middleware(request) {
  // Only protect POST, PUT, and DELETE requests
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.API_KEY

    if (!isValidApiKey(apiKey, expectedApiKey)) {
      return NextResponse.json(
        { error: 'Invalid API key. Please try again.' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/measurements/:path*',
}
