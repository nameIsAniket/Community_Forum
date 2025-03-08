import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:3001';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
  };
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Log the incoming request
  console.log(`Incoming request: ${req.method} ${req.url}`);

  // Authenticate the request using NextAuth
  const session = await getServerSession(req, res, authOptions);
  console.log("Session:", session);

  if (!session || !session.user || !session.user.id) {
    console.log('Unauthorized request, no valid session or user id missing.');
    return res.status(401).json({ error: 'Unauthorized' });
  }
 
  (req as AuthenticatedRequest).user = { id: session.user.id };
  
  // Extract the dynamic part of the path
  const { paths = [] } = req.query;
  
  // Build the target path: join the segments with a slash
  const targetPath = `/${Array.isArray(paths) ? paths.join('/') : paths}`;
  
  console.log(`Forwarding request to: ${EXPRESS_SERVER_URL}${targetPath}`);

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
    res.status(500).json({ error: 'Internal Server Error', errorDetails: error });
  }
}
