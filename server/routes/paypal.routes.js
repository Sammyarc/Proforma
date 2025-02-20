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
    console.log('PayPal credentials updated for user:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error saving PayPal credentials:', error);
    throw error;
  }
}


router.get('/callback', async (req, res) => {
  console.log('All query parameters:', req.query);
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
    
    // Send success message back to opener window
    res.send(`
      <script>
        window.opener.postMessage({ type: 'PAYPAL_CONNECTION_SUCCESS' }, '${process.env.APP_URL}');
      </script>
    `);
  } catch (error) {
    console.error('PayPal callback error:', error);
    res.status(500).send('Connection failed');
  }
});


export default router;
