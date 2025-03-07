import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log the incoming request
  //console.log(`Incoming request: ${req.method} ${req.url}`);

  // Authenticate the request using NextAuth
  const session = await getSession({ req });
  if (!session) {
    console.log('Unauthorized request, no valid session.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract the dynamic part of the path
  const { paths = [] } = req.query;
  
  // Build the target path: join the segments with a slash
  const targetPath = `/${Array.isArray(paths) ? paths.join('/') : paths}`;
  
  //console.log(`🔄 Forwarding request to: ${EXPRESS_SERVER_URL}${targetPath}`);

  // Setup headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (session?.user?.id) {
    headers['Authorization'] = `Bearer ${session.user.id}`;
  }

  try {
    const response = await fetch(`${EXPRESS_SERVER_URL}${targetPath}`, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? JSON.stringify(req.body) 
        : undefined,
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    if (contentType?.includes('application/json')) {
      res.status(response.status).json(JSON.parse(responseText));
    } else {
      res.status(response.status).send(responseText);
    }
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
