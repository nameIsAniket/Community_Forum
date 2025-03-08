import express,{ Request as ExpressRequest, Response }  from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware to check authentication

  export interface Request extends ExpressRequest {
    user?: {
      id: string;
    };
  }

// This middleware will parse the Authorization header and attach req.user
app.use((req, res, next) => {
  console.log("Request headers:", req.headers);
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      const userId = parts[1];
      (req as Request).user = { id: userId };
      console.log("User attached:", (req as Request).user);
    }
  }
  next();
});

// Forum endpoints
app.get("/forums", async (req: Request, res: Response) => {

  try {
    const forums = await prisma.forum.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    res.json(forums);
  } catch {
    res.status(500).json({ error: "Failed to fetch forums" });
  }
});

app.get("/forums/:id", async (req: Request, res: Response):Promise<void> => {
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    
    if (!forum) {
      res.status(404).json({ error: "Forum not found" });
      return
    }
    
    res.json(forum);
  } catch {
    res.status(500).json({ error: "Failed to fetch forum" });
  }
});

app.post("/forums", async (req: Request, res: Response) => {
  const { title, description, tags } = req.body;
  
  if (!title || !description) {
    res.status(400).json({ error: "Title and description are required" });
    return;
  }
  
  if(req.user === undefined){
    res.status(401).json({ error: "Unauthorized req.user not found" });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });
  //console.log("user",user);
  if (!user) {
    console.error("User not found for id:", req.user.id);
    res.status(400).json({ error: "User not found" });
    return
  }
  
  try {
    //console.log("Creating forum for user:", req.user.id, "with title:", title, "and tags:", tags);
    
    const forum = await prisma.forum.create({
      data: {
        title,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        userId: req.user.id
      },
    });

    //console.log("Forum created:", forum);
    
    res.status(201).json(forum);
    return
  } catch(error) {
    //console.error("Error creating forum:", error);
    res.status(500).json({ 
      error: "Failed to create forum", 
      error_msg: error instanceof Error ? error.message : "Unknown error" 
    });
    return;
  }
});

app.put("/forums/:id", async (req: Request, res: Response): Promise<void> => {
  const { title, description, tags } = req.body;
  const forumId = req.params.id;
  
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });
    
    if (!forum) {
      res.status(404).json({ error: "Forum not found" });
      return
    }
    
    if (forum.userId !== req.user?.id) {
      res.status(403).json({ error: "Unauthorized" });
      return
    }
    
    const updatedForum = await prisma.forum.update({
      where: { id: forumId },
      data: {
        title,
        description,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });
    
    res.json(updatedForum);
  } catch {
    res.status(500).json({ error: "Failed to update forum" });
  }
});

app.delete("/forums/:id", async (req: Request, res: Response): Promise<void> => {
  const forumId = req.params.id;
  
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });
    
    if (!forum) {
      res.status(404).json({ error: "Forum not found" });
      return;
    }
    
    if (forum.userId !== req.user?.id) {
      res.status(403).json({ error: "Unauthorized" });
      return 
    }
    
    await prisma.forum.delete({
      where: { id: forumId },
    });
    
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete forum" });
  }
});

// Comment endpoints
app.post("/forums/:id/comments", async (req: Request, res: Response):Promise<void> => {
  const { content } = req.body;
  const forumId = req.params.id;
  
  if (!content) {
    res.status(400).json({ error: "Content is required" });
    return 
  }
  
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });
    
    if (!forum) {
      res.status(404).json({ error: "Forum not found" });
      return 
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user ? req.user.id : "",
        forumId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    res.status(201).json(comment);
  } catch {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

app.delete("/comments/:id", async (req: Request, res: Response): Promise<void> => {
  const commentId = req.params.id;
  
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return
    }
    
    if (!req.user || comment.userId !== req.user.id) {
      res.status(403).json({ error: "Unauthorized" });
      return
    }
    
    await prisma.comment.delete({
      where: { id: commentId },
    });
    
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});