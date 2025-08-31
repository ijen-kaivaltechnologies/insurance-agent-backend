const validator = require("express-validator")

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
