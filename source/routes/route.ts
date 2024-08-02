import express from "express";

import followService from "../services/follow.service";
import authService from "../services/auth.service";
import postService from "../services/post.service";
import userService from "../services/user.service";
import notificationService from "../services/notification.service";
import messageInviteService from "../services/messageInvite.service";
import messageService from "../services/message.service";
import conversationService from "../services/conversation.service";
import profileService from "../services/profile.service";

const router = express.Router();

router.post("/auth/login", authService.login);
router.post("/auth/register", authService.register);
router.post("/auth/reset-password", authService.resetPassword);
router.post("/auth/check-email", authService.checkEmail);

router.put("/post/edit", postService.edit);
router.get("/post/:postId", postService.get);
router.post("/post/create", postService.create);
router.post("/post/add-like", postService.addLike);
router.get("/posts/list", postService.getPosts);
router.get("/posts/user-posts/:userId", postService.userPosts);
router.post("/post/add-comment", postService.addComment);
router.post("/post/reply-comment", postService.replyComment);
router.delete("/post/delete/:postId", postService.deletePost);
router.get("/post/get-likes-users/:postId", postService.getLikesUsers);

router.get("/message-invite/list", messageInviteService.list);
router.put("/message-invite/status", messageInviteService.put);
router.post("/message-invite/create", messageInviteService.create);

router.get("/message/seen", messageService.seen);
router.post("/message/create", messageService.post);

router.get("/conversation/list", conversationService.list);
router.get("/conversation/:conversationId", conversationService.get);

router.get("/posts/list", postService.getPosts);

router.get("/users", userService.getAllUsers);
router.get("/users/:userId", userService.getUser);
router.get("/user/entreprenuers", userService.getEntreprenuers);

router.get("/profile/me", profileService.me);
router.put("/profile/update", profileService.update);

router.post("/user/follow", followService.followUser);
router.get("/user/followers/:userId", followService.getFollowers);

router.get("/notifications", notificationService.getNotifications);
router.get("/user-notifications", notificationService.getUserNotifications);
router.put("/user-notifications/mark-as-read", notificationService.markNotificationsAsRead);

export default router;
