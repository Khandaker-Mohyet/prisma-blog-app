import express from "express";
import { PostController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();


router.get("/")
router.post("/", auth(UserRole.USER), PostController.createPost);


export default router;