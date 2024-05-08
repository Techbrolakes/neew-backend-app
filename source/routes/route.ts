import express from "express";

import userService from "../services/user/user.service";

const router = express.Router();

router.post("/users/register", userService.register);

export default router;
