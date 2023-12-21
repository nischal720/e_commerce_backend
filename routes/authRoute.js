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
} = require("../controller/userCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/logout", logOut);

router.get("/refresh", handleRefreshTOken);

router.get("/all-user", authMiddleWare, isAdmin, getAllUser);
router.get("/:id", authMiddleWare, getUser);
router.delete("/:id", authMiddleWare, deleteUser);
router.put("/edit-user", authMiddleWare, updateUser);
router.put("/blocked-user/:id", authMiddleWare, isAdmin, blockedUser);

module.exports = router;
