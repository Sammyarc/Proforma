import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import createTransporter from "./email.config.js";

const transporter = await createTransporter();

export const sendVerificationEmail = async (email, name, verificationToken) => {
	const recipient = [{ email }];

	try {
		const response = await transporter.sendMail({
			from: {
                name: "Proforma",
                address: process.env.EMAIL
            },
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken).replace("{name}", name),
			category: "Email Verification",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};

export const sendWelcomeEmail = async (email, name, verificationUrlToken) => {
	const recipient = [{ email }];

	try {
		const response = await transporter.sendMail({
			from: {
                name: "Proforma",
                address: process.env.EMAIL
            },
			to: recipient,
			subject: "Welcome To Proforma",
            html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name, ).replace("{verificationURL}", `${process.env.CLIENT_URL}/verify-email/${verificationUrlToken}`),
			category: "Welcome email",
		});

		console.log("Welcome email sent successfully", response);
	} catch (error) {
		console.error(`Error sending welcome email`, error);

		throw new Error(`Error sending welcome email: ${error}`);
	}
};

export const sendPasswordResetEmail = async (email, resetURL, name) => {
	const recipient = [{ email }];

	try {
		const response = await transporter.sendMail({
			from: {
                name: "Proforma",
                address: process.env.EMAIL
            },
            to: recipient,
			subject: "Reset your password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL).replace("{name}", name),
			category: "Password Reset",
        });
        
        console.log("Password reset email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset email`, error);

		throw new Error(`Error sending password reset email: ${error}`);
	}
};

export const sendResetSuccessEmail = async (email, name) => {
	const recipient = [{ email }];

	try {
		const response = await transporter.sendMail({
			from: {
                name: "Proforma",
                address: process.env.EMAIL
            },
			to: recipient,
			subject: "Password Reset Successful",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{name}", name),
			category: "Password Reset",
		});

		console.log("Password reset email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset success email`, error);

		throw new Error(`Error sending password reset success email: ${error}`);
	}
};

