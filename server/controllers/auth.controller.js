import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
		});

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!email || !password) {
            throw new Error("All fields are required");
        }

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist!" });
        }

		// Ensure user.password exists
		if (!user.password) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,  // Hide password
            },
        });
    } catch (error) {
        console.log("Error in login ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {

	const isProduction = process.env.NODE_ENV === "production";

	res.clearCookie('token', {
        httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
    });
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const googleSignIn = async (req, res) => {
	try {
		const { token } = req.body; 

		// Validate token
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

		// Verify the Google token
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload(); // Extract user details from token
		const { email, name } = payload;

		// Check if the user already exists
		let user = await User.findOne({ email });

		if (!user) {
			// If user doesn't exist, create a new user with the provided role
			user = new User({
				email,
				name,
				isVerified: true, // Automatically verify Google users
				isGoogleUser: true, // Indicate that this user signed up via Google
			});
			await user.save();
		}

		// Update the user's last login time
		user.lastLogin = new Date();
		await user.save();

		// Generate a JWT and set it as an HTTP-only cookie
		generateTokenAndSetCookie(res, user._id);

		// Return success response with user data
		res.status(200).json({
			success: true,
			message: "Google sign-in successful",
			user: {
				...user._doc,
				password: undefined, // Exclude password from the response
			},
		});
	} catch (error) {
		console.error("Error in googleSignIn:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};


export const checkAuth = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		 // Return the user's connection status (e.g., PayPal connection)
		 res.status(200).json({
			success: true,
			user,
			connections: {
			  paypal: user.paypal && user.paypal.accessToken ? true : false,
			  // Add any other connections here if needed.
			}
		  });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
