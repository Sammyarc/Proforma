import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../lib/api";

export const UsePaymentHandlers = () => {
  const { checkAuth } = useAuthStore();
  const handlePayPalConnect = async () => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/paypal/connect`,
        {},
        { withCredentials: true },
      );
      const url = new URL(data.url);
      if (
        url.protocol !== "https:" ||
        !["www.paypal.com", "www.sandbox.paypal.com"].includes(url.hostname)
      )
        throw new Error("Invalid PayPal URL");
      window.location.assign(url.href);
    } catch {
      toast.error("Could not start the PayPal connection. Please try again.");
    }
  };
  const handleDisconnectPayPal = async () => {
    await axios.post(
      `${API_BASE_URL}/paypal/disconnect`,
      {},
      { withCredentials: true },
    );
    await checkAuth();
  };
  return { handlers: { handlePayPalConnect, handleDisconnectPayPal } };
};
