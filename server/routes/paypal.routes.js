// paypalRoutes.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/paypal/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not provided');

  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    const tokenResponse = await axios.post(
      'https://api.paypal.com/v1/oauth2/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.APP_URL}/paypal/callback`
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    // Save tokens and account details associated with the user (e.g., in your database)
    res.send('PayPal account connected successfully!');
  } catch (error) {
    console.error('PayPal callback error:', error.response.data);
    res.status(500).send('Error connecting PayPal account');
  }
});

export default router;
