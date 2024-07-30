import express from "express";

import followService from "../services/follow.service";
import authService from "../services/auth.service";
import postService from "../services/post.service";
import userService from "../services/user.service";
import notificationService from "../services/notification.service";
import messageInviteService from "../services/messageInvite.service";
import messageService from "../services/message.service";
import conversationService from "../services/conversation.service";

const router = express.Router();

router.post("/auth/login", authService.login);
router.post("/auth/register", authService.register);

router.get("/posts", postService.list);
router.get("/post/get-all-posts", postService.getPosts);
router.put("/post/edit", postService.edit);
router.get("/post/:postId", postService.get);
router.post("/post/create", postService.create);
router.post("/post/add-like", postService.addLike);
router.post("/post/add-comment", postService.addComment);
router.delete("/post/delete/:postId", postService.deletePost);
router.get("/post/get-likes-users/:postId", postService.getLikesUsers);

router.post("/message-invites/create", messageInviteService.create);
router.put("/message-invite/status", messageInviteService.put);
router.get("/message-invites/list", messageInviteService.list);

router.get("/message/seen", messageService.seen);
router.post("/message/create", messageService.post);

router.get("/conversation/list", conversationService.list);
router.get("/conversation/:conversationId", conversationService.get);

router.get("/user/me", userService.me);
router.get("/users", userService.getAllUsers);
router.get("/user/entreprenuers", userService.getEntreprenuers);

router.post("/user/follow", followService.followUser);
router.get("/user/followers/:userId", followService.getFollowers);

router.get("/notifications", notificationService.getNotifications);
router.get("/user-notifications", notificationService.getUserNotifications);
router.put("/user-notifications/mark-as-read", notificationService.markNotificationsAsRead);

export default router;
