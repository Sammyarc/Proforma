import axios from "axios";
import { User } from "../models/user.model.js";
import { decrypt, encrypt } from "../utils/encrypt.js";
const getUserById = (id) => User.findById(id);
export async function getValidPayPalAccessToken(userId) {
  const user = await getUserById(userId);
  if (!user || user.isDeleted)
    throw new Error("Merchant account is unavailable");
  const currentTime = Date.now();

  if (user.paypal?.tokenExpiry > currentTime) {
    return decrypt(user.paypal.accessToken);
  }

  // Check if refresh token exists
  if (!user.paypal?.refreshToken) {
    throw new Error("No PayPal refresh token available");
  }

  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`,
    ).toString("base64");

    // Decrypt the refresh token before use
    const refreshToken = decrypt(user.paypal.refreshToken);

    const response = await axios.post(
      `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken, // Use decrypted token
      }),
      {
        timeout: 15000,
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const newAccessToken = response.data.access_token;
    const expiresIn = response.data.expires_in;

    //Ensure paypal object exists
    user.paypal = user.paypal || {};
    user.paypal.accessToken = encrypt(newAccessToken);
    if (response.data.refresh_token)
      user.paypal.refreshToken = encrypt(response.data.refresh_token);
    user.paypal.tokenExpiry = currentTime + expiresIn * 1000;
    await user.save();

    return newAccessToken;
  } catch (error) {
    throw new Error("Could not refresh PayPal access token");
  }
}
