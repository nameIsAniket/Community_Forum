import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Incoming request: ${req.method} ${req.url}`);

  // Extract the dynamic part of the path from query parameters.
  const { paths = [] } = req.query;
  const targetPath = `/${Array.isArray(paths) ? paths.join('/') : paths}`;
  console.log(`Forwarding request to: ${EXPRESS_SERVER_URL}${targetPath}`);

  let authHeader: string | undefined = undefined;

  // For non-GET/HEAD requests, retrieve the session and require authentication.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const session = await getServerSession(req, res, authOptions);
    console.log("Session:", session);

    if (!session || !session.user || !session.user.id) {
      console.log('Unauthorized request, no valid session or user id missing.');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    authHeader = `Bearer ${session.user.id}`;
  }

  // Setup headers: forward the cookie header and add Authorization if applicable.
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(authHeader ? { 'Authorization': authHeader } : {}),
    ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
  };

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
    res.status(500).json({ error: 'Internal Server Error', errorDetails: error });
  }
}
