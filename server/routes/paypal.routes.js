// paypalRoutes.js
import bcrypt from "bcryptjs";
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { User } from "../models/user.model.js";
dotenv.config();

const router = express.Router();


async function savePayPalCredentials(userId, tokenData) {
  try {
    // Calculate token expiry date
    const expiryDate = new Date(Date.now() + tokenData.expires_in * 1000);
    
    // Define number of salt rounds for hashing
    const saltRounds = 10;
    
    // Hash the access and refresh tokens
    const hashedAccessToken = await bcrypt.hash(tokenData.access_token, saltRounds);
    const hashedRefreshToken = await bcrypt.hash(tokenData.refresh_token, saltRounds);
    
    // Update the user's PayPal credentials in the database with hashed tokens
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        paypal: {
          accessToken: hashedAccessToken,
          refreshToken: hashedRefreshToken,
          tokenExpiry: expiryDate,
        },
      },
      { new: true }
    );
    
    return updatedUser;
  } catch (error) {
    console.error("Error saving PayPal credentials:", error);
    throw error;
  }
}


router.get('/callback', async (req, res) => {
  const { state, code } = req.query;

  // Step 1: Validate state param
  if (!state) {
    console.error('❌ No state parameter received');
    return res.status(400).send('Missing state parameter');
  }

  // Step 2: Parse state (userId + redirect)
  let userId, redirectUrl;
  try {
    const parsedState = JSON.parse(decodeURIComponent(state));
    userId = parsedState.userId;
    redirectUrl = parsedState.redirect;

    console.log('✅ Parsed state:', { userId, redirectUrl });
  } catch (err) {
    console.error('❌ Failed to parse state parameter:', err);
    console.error('Raw state:', state);
    return res.status(400).send('Invalid state parameter');
  }

  // Step 3: Validate code param
  if (!code) {
    console.error('❌ No code parameter received');
    return res.status(400).send('Missing authorization code');
  }

  try {
    const PAYPAL_BASE_URL = process.env.PAYPAL_API_URL;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    if (!PAYPAL_BASE_URL || !clientId || !clientSecret) {
      console.error('❌ Missing PayPal environment variables');
      return res.status(500).send('Server misconfiguration');
    }

    console.log('🔁 Attempting to exchange code for token...');
    console.log('📡 PayPal API URL:', `${PAYPAL_BASE_URL}/v1/oauth2/token`);
    console.log('🔑 Client ID:', clientId.slice(0, 6) + '...');
    console.log('🔐 Code received:', code);

    const tokenResponse = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      `grant_type=authorization_code&code=${code}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokenData = tokenResponse.data;
    console.log('✅ Token exchange success:', {
      scope: tokenData.scope,
      access_token: '***',
      expires_in: tokenData.expires_in
    });

    // Step 4: Store PayPal tokens securely
    await savePayPalCredentials(userId, tokenData);
    console.log('✅ PayPal credentials saved for user:', userId);

    // Step 5: Redirect back to frontend
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ PayPal callback error:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error.message
    });
    return res.status(500).send('Connection failed');
  }
});

router.post('/disconnect', async (req, res) => {
  const { userId } = req.body;
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
