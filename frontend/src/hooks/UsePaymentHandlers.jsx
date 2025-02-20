import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const API_URL =
  import.meta.env.MODE === "development"
    ? "https://afe5-105-113-33-172.ngrok-free.app"
    : "https://proforma-gen.vercel.app";

export const UsePaymentHandlers = () => {
  const [connections, setConnections] = useState({
    paypal: false,
    flutterwave: false,
    stripe: false,
    paystack: false,
    skrill: false,
    googlePay: false
  });

  const {user} = useAuthStore(); 

  // PayPal Account Connection
  const handlePayPalConnect = () => {
    try {
      const clientId = import.meta.env.VITE_REACT_APP_PAYPAL_CLIENT_ID;
      const userId = user._id; // Getting the MongoDB ObjectId
      const stateObj = { userId };
      console.log('State object before encoding:', stateObj);
      const state = encodeURIComponent(JSON.stringify(stateObj));
      console.log('Encoded state:', state);
      const redirectUri = encodeURIComponent(`${API_URL}/paypal/callback`);
      const scope = encodeURIComponent('openid email profile')
      
      // Use PayPal's OAuth flow for merchant/seller account connection
      const authUrl = `https://www.sandbox.paypal.com/connect?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
      
      const popup = window.open(authUrl, 'PayPalConnect', 'width=600,height=600');
      
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'PAYPAL_CONNECTION_SUCCESS') {
          setConnections(prev => ({ ...prev, paypal: true }));
          popup?.close();
        }
      });
    } catch (error) {
      console.error('PayPal account connection error:', error);
    }
  };

  // Flutterwave Account Connection
  const handleFlutterwaveConnect = async () => {
    try {
      const response = await fetch('/api/flutterwave/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { authorizationUrl } = await response.json();
      const popup = window.open(authorizationUrl, 'FlutterwaveConnect', 'width=600,height=600');

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'FLUTTERWAVE_CONNECTION_SUCCESS') {
          setConnections(prev => ({ ...prev, flutterwave: true }));
          popup?.close();
        }
      });
    } catch (error) {
      console.error('Flutterwave account connection error:', error);
    }
  };

  // Stripe Account Connection
  const handleStripeConnect = () => {
    try {
      const clientId = import.meta.env.VITE_STRIPE_CLIENT_ID;
      const redirectUri = encodeURIComponent(`${window.location.origin}/stripe/callback`);
      
      // Use Stripe Connect OAuth for account connection
      const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${redirectUri}`;
      
      const popup = window.open(connectUrl, 'StripeConnect', 'width=600,height=600');

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'STRIPE_CONNECTION_SUCCESS') {
          setConnections(prev => ({ ...prev, stripe: true }));
          popup?.close();
        }
      });
    } catch (error) {
      console.error('Stripe account connection error:', error);
    }
  };

  // Paystack Account Connection
  const handlePaystackConnect = async () => {
    try {
      const response = await fetch('/api/paystack/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { authorizationUrl } = await response.json();
      const popup = window.open(authorizationUrl, 'PaystackConnect', 'width=600,height=600');

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'PAYSTACK_CONNECTION_SUCCESS') {
          setConnections(prev => ({ ...prev, paystack: true }));
          popup?.close();
        }
      });
    } catch (error) {
      console.error('Paystack account connection error:', error);
    }
  };

  // Skrill Account Connection
  const handleSkrillConnect = async () => {
    try {
      const response = await fetch('/api/skrill/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { authorizationUrl } = await response.json();
      const popup = window.open(authorizationUrl, 'SkrillConnect', 'width=600,height=600');

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'SKRILL_CONNECTION_SUCCESS') {
          setConnections(prev => ({ ...prev, skrill: true }));
          popup?.close();
        }
      });
    } catch (error) {
      console.error('Skrill account connection error:', error);
    }
  };

  // Google Pay Account Connection
  const handleGooglePayConnect = async () => {
    try {
      const response = await fetch('/api/google-pay/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { authorizationUrl } = await response.json();
      const popup = window.open(authorizationUrl, 'GooglePayConnect', 'width=600,height=600');

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'GOOGLEPAY_CONNECTION_SUCCESS') {
          setConnections(prev => ({ ...prev, googlePay: true }));
          popup?.close();
        }
      });
    } catch (error) {
      console.error('Google Pay account connection error:', error);
    }
  };

  return {
    connections,
    handlers: {
      handlePayPalConnect,
      handleFlutterwaveConnect,
      handleStripeConnect,
      handlePaystackConnect,
      handleSkrillConnect,
      handleGooglePayConnect
    }
  };
};