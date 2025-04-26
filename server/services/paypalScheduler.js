import cron from 'node-cron';
import { refreshPayPalToken } from '../utils/refreshPayPalToken.js';
import { User } from '../models/user.model.js';

// Function to start the token refresh scheduler
export const startPayPalTokenRefreshScheduler = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled PayPal token refresh job');
    
    try {
      // Find all users with PayPal connected and tokens that expire within 3 days
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      
      const users = await User.find({
        'paypal.connected': true,
        'paypal.tokenExpiry': { $lt: threeDaysFromNow }
      });
      
      console.log(`Found ${users.length} users with PayPal tokens expiring soon`);
      
      // Process each user
      for (const user of users) {
        try {
          await refreshPayPalToken(user._id);
        } catch (userError) {
          console.error(`Error refreshing token for user ${user._id}:`, userError);
          // Continue with next user even if one fails
        }
      }
      
      console.log('Completed PayPal token refresh job');
    } catch (error) {
      console.error('Error in PayPal token refresh job:', error);
    }
  });
  
  console.log('PayPal token refresh scheduler started');
};