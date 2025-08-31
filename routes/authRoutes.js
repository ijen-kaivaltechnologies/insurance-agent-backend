const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const config = require("../config/env");

const router = express.Router();

// JWT middleware for protected routes
const auth = (req, res, next) => {
	const token = req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		return res.status(401).json({ message: "Authentication required" });
	}

	try {
		const decoded = jwt.verify(token, config.jwtSecret);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid or expired token" });
	}
};

// Register new user
router.post("/register", async (req, res) => {
	try {
		const { name, email, password, phone, company_name } = req.body;

		// Check if user already exists
		const existingUser = await User.findByEmail(email);
		if (existingUser) {
			return res.status(400).json({ message: "Email already registered" });
		}

		// Create new user
		const user = await User.create({
			name,
			email,
			password,
			phone,
			company_name,
		});

		// Generate JWT token
		const token = jwt.sign({ id: user.id }, config.jwtSecret, {
			expiresIn: "24h",
		});

		res.status(201).json({
			user,
			token,
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Login user
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		// Find user by email
		const user = await User.findByEmail(email);
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Generate JWT token
		const token = jwt.sign({ id: user.id }, config.jwtSecret, {
			expiresIn: "24h",
		});

		// Return user data without password
		const { password: _, ...userData } = user;

		res.json({
			user: userData,
			token,
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Get user profile (protected route)
router.get("/profile", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return user data without password
		const { password: _, ...userData } = user;
		res.json(userData);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Refresh token
router.post("/refresh-token", auth, (req, res) => {
	try {
		const token = jwt.sign({ id: req.user.id }, config.jwtSecret, {
			expiresIn: "24h",
		});
		res.json({ token });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
