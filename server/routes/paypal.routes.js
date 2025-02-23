// paypalRoutes.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { User } from "../models/user.model.js";
dotenv.config();

const router = express.Router();

async function savePayPalCredentials(userId, tokenData) {
  try {
    const expiryDate = new Date(Date.now() + tokenData.expires_in * 1000);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        paypal: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiry: expiryDate
        }
      },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error('Error saving PayPal credentials:', error);
    throw error;
  }
}


router.get('/callback', async (req, res) => {
  const { state, code } = req.query;
  
  if (!state) {
    console.error('No state parameter received');
    return res.status(400).send('Missing state parameter');
  }

  
  // Parse the state parameter to extract user information
  let userId;
  try {
    const parsedState = JSON.parse(decodeURIComponent(state));
    userId = parsedState.userId;
  } catch (err) {
    console.error('State parameter error:', err);
    console.error('Raw state value:', state);
    return res.status(400).send('Invalid state parameter');
  }
  
  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
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
    
    // After successfully saving, redirect the user back to the dashboard.
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('PayPal callback error:', error);
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
