import crypto from "node:crypto";
import { requireWorkspace } from "../middleware/requireWorkspace.js";
// paypalRoutes.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { encrypt } from '../utils/encrypt.js';
import { User } from "../models/user.model.js";
dotenv.config();

const router = express.Router();


async function savePayPalCredentials(userId, tokenData) {
  try {
    const expiryDate = new Date(Date.now() + tokenData.expires_in * 1000);

    // Encrypt the access and refresh tokens
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);
    

    // Save encrypted tokens to the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        paypal: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiry: expiryDate,
        },
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error saving encrypted PayPal credentials:", error);
    throw error;
  }
}


router.post('/connect', requireWorkspace, async (req, res) => {
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.BACKEND_URL || !process.env.FRONTEND_URL) {
      return res.status(503).json({ message: "PayPal connection is not configured." });
    }
    const state = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(req.user.id, { $set: {
      paypalOAuthState: crypto.createHash('sha256').update(state).digest('hex'),
      paypalOAuthExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    } });
    const sandbox = new URL(process.env.PAYPAL_API_URL).hostname.includes('sandbox');
    const url = new URL(sandbox ? 'https://www.sandbox.paypal.com/connect' : 'https://www.paypal.com/connect');
    url.search = new URLSearchParams({ flowEntry: 'static', client_id: process.env.PAYPAL_CLIENT_ID, response_type: 'code', scope: 'openid email profile', redirect_uri: process.env.BACKEND_URL.replace(/\/$/, '') + '/paypal/callback', state }).toString();
    return res.json({ url: url.href });
  } catch {
    return res.status(503).json({ message: "Could not start PayPal connection. Please try again." });
  }
});

router.get('/callback', requireWorkspace, async (req, res) => {
  const { state, code } = req.query;
  if (typeof state !== 'string' || !/^[a-f0-9]{64}$/.test(state) || typeof code !== 'string' || !code || code.length > 4096) {
    return res.status(400).send('Invalid PayPal connection response. Start again from Settings.');
  }
  const userId = req.user.id;
  const redirectUrl = process.env.FRONTEND_URL.replace(/\/$/, '') + '/dashboard/settings?tab=connections';
  try {
    const account = await User.findOneAndUpdate({
      _id: userId,
      paypalOAuthState: crypto.createHash('sha256').update(state).digest('hex'),
      paypalOAuthExpiresAt: { $gt: new Date() }
    }, { $unset: { paypalOAuthState: '', paypalOAuthExpiresAt: '' } });
    if (!account) return res.status(400).send('PayPal connection expired or already used. Start again from Settings.');
  } catch {
    return res.status(503).send('Could not verify the PayPal connection. Please try again.');
  }

  try {
    const PAYPAL_BASE_URL = process.env.PAYPAL_API_URL;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    if (!PAYPAL_BASE_URL || !clientId || !clientSecret) {
      return res.status(500).send('Server misconfiguration');
    }

    const tokenResponse = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: process.env.BACKEND_URL.replace(/\/$/, '') + '/paypal/callback' }),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokenData = tokenResponse.data;

    // Step 4: Store PayPal tokens securely
    await savePayPalCredentials(userId, tokenData);

    // Step 5: Redirect back to frontend
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('PayPal callback error:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error.message
    });
    return res.status(500).send('Connection failed');
  }
});

router.post('/disconnect', requireWorkspace, async (req, res) => {
  const userId = req.user.id;
  try {
    // e.g. remove the paypal field from user
    await User.findByIdAndUpdate(userId, { $unset: { paypal: "" } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error disconnecting PayPal:", error);
    res.status(500).json({ success: false, message: "Failed to disconnect PayPal" });
  }
});



export default router;
