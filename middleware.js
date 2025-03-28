import { NextResponse } from 'next/server'

export function middleware(request) {
  // Only protect POST, PUT, and DELETE requests
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.API_KEY

    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized - API key required' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/measurements/:path*',
} 