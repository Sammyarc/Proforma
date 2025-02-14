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
		companyName: {
			type: String,
		}, // Optional: The name of the user's business/company
		companyLogo: {
			type: String, // URL of the company logo for branding invoices
		},
		taxId: {
			type: String,
		}, // Optional: Tax identification number for invoicing
		preferredCurrency: {
			type: String,
			default: "USD", // Default currency for invoices
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
		phone: {
			type: String,
		},
		address: {
			street: {
				type: String,
			},
			city: {
				type: String,
			},
			state: {
				type: String,
			},
			zipCode: {
				type: String,
			},
			country: {
				type: String,
			},
		},
		dateOfBirth: {
			type: Date,
		}, // Optional
		gender: {
			type: String,
		}, // Optional: Male/Female/Other
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
		defaultInvoiceSettings: {
			dueDateDays: {
				type: Number,
				default: 30, // Default due date (e.g., 30 days)
			},
			taxRate: {
				type: Number,
				default: 0, // Default tax rate
			},
			footerNote: {
				type: String,
				default: "Thank you for your business!", // Default footer on invoices
			},
		}, // Default settings applied to generated invoices
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);
