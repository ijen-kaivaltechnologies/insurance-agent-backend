const bcrypt = require("bcryptjs");

const Policy = require("../models/policies");
const Client = require("../models/client");
const User = require("../models/user");

// Get Profile
exports.getProfile = async (req, res) => {
	try {
		const userId = req.user.id;

		const userDetails = await User.findById(userId);

		const d = {
			...userDetails,
			password: undefined,
		};

		res.json({ data: d });
	} catch (err) {
		res.status(500).json({ message: "Error ", error: err.message });
	}
};

// update profile
exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const reqBody = req.body;

		const existingUser = await User.findById(userId);

		if (reqBody.name) {
			existingUser.name = req.body.name;
		}

		if (reqBody.email) {
			existingUser.email = req.body.email;
		}

		if (reqBody.phone) {
			existingUser.phone = req.body.phone;
		}

		if (reqBody.company_name) {
			existingUser.company_name = req.body.company_name;
		}

		const userDetails = await User.update(userId, existingUser);

		res.json({
			data: userDetails,
		});
	} catch (err) {
		res.status(500).json({ message: "Error ", error: err.message });
	}
};

// Get
exports.getStats = async (req, res) => {
	try {
		const userId = req.user.id;

		const allPolicies = await Policy.getAll({ user_id: userId });
		const expiringPolicies = await Policy.getExpiringPoliciesOfUser(userId);
		const clients = await Client.findAll(userId);

		const d = {
			totalPolicies: allPolicies.length,
			totalExpiringPolicies: expiringPolicies.length,
			totalClients: clients.length,
		};

		res.json({ data: d });
	} catch (err) {
		res.status(500).json({ message: "Error ", error: err.message });
	}
};

exports.changePassword = async (req, res) => {
	try {
		const currentPassword = req.body?.currentPassword?.trim();
		const newPassword = req.body?.newPassword?.trim();
		const userId = req.user.id;

		const userDetails = await User.findById(userId);

		if (!newPassword) {
			return res.status(400).json({
				message: "new password is required",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				message: "password length must be atleast 6 characters long",
			});
		}

		if (currentPassword === newPassword) {
			return res.status(400).json({
				message: "current password and new password cannot be same",
			});
		}

		const isValidPassword = await User.verifyPassword(
			currentPassword,
			userDetails.password
		);

		if (!isValidPassword) {
			return res.status(401).json({
				message: "current password did not match!",
			});
		}

		await User.updatePassword(userId, newPassword);

		return res.send({
			message: "Password updated successfully!",
		});
	} catch (error) {
		return res.status(500).send({
			message: "unable to update the password",
		});
	}
};
