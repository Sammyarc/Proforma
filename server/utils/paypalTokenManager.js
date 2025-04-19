
// This module manages the PayPal access token for a user.
// It checks if the token is valid, and if not, it refreshes it using the refresh token.
// It also handles the encryption and decryption of tokens for security purposes.

// Importing required modules
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { decrypt, encrypt } from './encrypt.js';
import { User } from '../models/user.model.js';

export const getValidAccessToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.paypal) throw new Error('PayPal credentials not found');

  const { accessToken, refreshToken, tokenExpiry } = user.paypal;

  const isExpired = new Date() >= new Date(tokenExpiry);
  if (!isExpired) {
    return decrypt(accessToken); // Token is still valid
  }

  // If expired, use refresh token to get a new one
  const decryptedRefreshToken = decrypt(refreshToken);

  try {
    const PAYPAL_BASE_URL = process.env.PAYPAL_API_URL;

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      `grant_type=refresh_token&refresh_token=${decryptedRefreshToken}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;
    const newExpiry = new Date(Date.now() + expires_in * 1000);

    // Encrypt and update the new access token
    const encryptedAccessToken = encrypt(access_token);

    await User.findByIdAndUpdate(userId, {
      'paypal.accessToken': encryptedAccessToken,
      'paypal.tokenExpiry': newExpiry,
    });

    return access_token;
  } catch (error) {
    console.error('Failed to refresh PayPal token:', error.response?.data || error.message);
    throw new Error('Unable to refresh PayPal access token');
  }
};
