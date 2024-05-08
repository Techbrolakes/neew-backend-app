import express from "express";

import userService from "../services/user/auth.service";
import postService from "../services/user/post.service";

const router = express.Router();

router.post("/auth/register", userService.register);
router.post("/auth/login", userService.login);

router.get("/posts", postService.list);
router.post("/post/create", postService.create);

export default router;
