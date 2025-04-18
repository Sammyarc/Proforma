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
  
  if (!state) {
    console.error('No state parameter received');
    return res.status(400).send('Missing state parameter');
  }

  
  // Parse the state parameter to extract user information and the redirect URL
  let userId, redirectUrl;
  try {
    const parsedState = JSON.parse(decodeURIComponent(state));
    userId = parsedState.userId;
    redirectUrl = parsedState.redirect; // Full URL from the frontend
  } catch (err) {
    console.error('State parameter error:', err);
    console.error('Raw state value:', state);
    return res.status(400).send('Invalid state parameter');
  }
  
  try {

    const PAYPAL_BASE_URL = process.env.PAYPAL_API_URL;
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      `grant_type=authorization_code&code=${code}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const tokenData = tokenResponse.data;
    
    // Store the merchant's PayPal credentials securely
    await savePayPalCredentials(userId, tokenData);
    
     // Redirect back to the URL provided by the frontend (e.g. the full dashboard route)
     res.redirect(redirectUrl);
  } catch (error) {
    console.error('PayPal callback error:', error?.response?.data || error.message);
    res.status(500).send('Connection failed');
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
