import express, { Request, Response } from 'express';
import next from 'next';
import { parse } from 'url';
import cors from 'cors';
import './server/index';

type NextServer = ReturnType<typeof next>;

const dev: boolean = process.env.NODE_ENV !== 'production';
console.log("dev:", dev);
const app: NextServer = next({ dev });
const handle = app.getRequestHandler();
const PORT: number = Number(process.env.PORT) || 3001;

app.prepare().then(() => {
  const server = express();

  // Middleware
  server.use(cors());
  server.use(express.json());

  // Let Next.js handle everything else
  server.all('*', (req: Request, res: Response) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  server.listen(PORT, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
