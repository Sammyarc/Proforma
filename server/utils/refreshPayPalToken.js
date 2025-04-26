import { User } from '../models/user.model.js';
import axios from 'axios';
import { encrypt, decrypt } from './encrypt.js';

export const refreshPayPalToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.paypal || !user.paypal.refreshToken) {
      console.log(`No PayPal credentials found for user ${userId}`);
      return false;
    }

    // Skip if token is still valid for more than 24 hours
    const tokenExpiry = new Date(user.paypal.tokenExpiry);
    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (tokenExpiry > oneDayFromNow) {
      console.log(`Token for user ${userId} still valid until ${tokenExpiry}`);
      return true; // Token is still valid for more than a day
    }

    // Proceed with refresh
    const decryptedRefreshToken = decrypt(user.paypal.refreshToken);
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

    console.log(`Successfully refreshed PayPal token for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to refresh PayPal token for user ${userId}:`, error.response?.data || error.message);
    
    // If token is invalid, mark the account as disconnected
    if (error.response?.data?.error === 'invalid_token') {
      await User.findByIdAndUpdate(userId, {
        'paypal.accessToken': null,
        'paypal.refreshToken': null,
        'paypal.tokenExpiry': null,
        'paypal.connected': false,
        'paypal.disconnectionReason': 'Token expired or was revoked',
        'paypal.disconnectedAt': new Date()
      });
      // Could trigger notification to user here
    }
    
    return false;
  }
};