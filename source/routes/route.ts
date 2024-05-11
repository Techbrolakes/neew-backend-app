import express from "express";

import userService from "../services/user/auth.service";
import postService from "../services/user/post.service";

const router = express.Router();

router.post("/auth/login", userService.login);
router.post("/auth/register", userService.register);

router.get("/posts", postService.list);
router.get("/post/getAll", postService.getAll);

router.put("/post/edit", postService.edit);
router.get("/post/:postId", postService.get);
router.post("/post/create", postService.create);
router.post("/post/add-like", postService.addLike);
router.get("/post/get-likes-users/:postId", postService.getLikesUsers);
router.post("/post/add-comment", postService.addComment);
router.delete("/post/delete/:postId", postService.deletePost);


export default router;
