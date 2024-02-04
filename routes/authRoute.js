/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockedUser,
  handleRefreshTOken,
  logOut,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
} = require("../controller/userCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.put("/password", authMiddleWare, updatePassword);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);

router.post("/login", loginUser);
router.get("/logout", logOut);

router.get("/refresh", handleRefreshTOken);

router.get("/all-user", authMiddleWare, isAdmin, getAllUser);
router.get("/:id", authMiddleWare, getUser);
router.delete("/:id", authMiddleWare, deleteUser);
router.put("/edit-user", authMiddleWare, updateUser);
router.put("/blocked-user/:id", authMiddleWare, isAdmin, blockedUser);

module.exports = router;
