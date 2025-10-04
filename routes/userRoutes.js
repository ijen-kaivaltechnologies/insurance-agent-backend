const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth");
const { validate, updateProfileValidator } = require("../middleware/validator");

router.use(authMiddleware);

router
	.route("/me")
	.get(userController.getProfile)
	.put(updateProfileValidator, validate, userController.updateProfile);

router.get("/stats", userController.getStats);

router.patch("/change-password", userController.changePassword)

module.exports = router;
