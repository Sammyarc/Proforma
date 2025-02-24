import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: function () {
				return !this.isGoogleUser;
			}, // Password is optional if the user signs up via Google
		},
		name: {
			type: String,
			required: true,
		},

		paypal: {
			accessToken: { type: String },
			refreshToken: { type: String },
			tokenExpiry: { type: Date }
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		isGoogleUser: {
			type: Boolean,
			default: false,
		},
		profileImage: {
			type: String, // URL of the profile picture
		},
		savedClients: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Client', // Reference to a Client schema
			},
		], // Clients frequently billed
		savedInvoices: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Invoice', // Reference to an Invoice schema
			},
		], // Previously created invoices
		notifications: [
			{
				message: {
					type: String,
				},
				isRead: {
					type: Boolean,
					default: false,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		], // Notifications for overdue payments, reminders, etc.
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);
