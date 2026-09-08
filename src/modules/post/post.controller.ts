import { Request, Response } from "express";
import { postService } from "./post.server";


const createPost = async (req: Request, res: Response) => {
  try{
    if(!req.user){
      return res.status(400).json({
      error: "Unauthorized",
      })
    }
    const result = await postService.createPost(req.body, req.user.id)
    res.status(201).json(result)
  }catch(e){
    res.status(400).json({
      error: "Post creation failed",
      details: e
    })
  }
}

export const PostController ={
  createPost
}
  