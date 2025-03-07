import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:3001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the path from the incoming request
  const path = req.url?.replace('/api', '') || '/'
  
  // Forward the session information
  const session = await getSession({ req })
  
  // Add session info to headers if available
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (session) {
    headers['Authorization'] = `Bearer ${session.user.id}`
  }
  
  // Forward request to Express
  try {
    const response = await fetch(`${EXPRESS_SERVER_URL}${path}`, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? JSON.stringify(req.body) 
        : undefined,
    })
    
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    console.error('API proxy error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}