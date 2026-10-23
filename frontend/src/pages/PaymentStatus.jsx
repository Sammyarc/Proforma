import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";
import { Loader2 } from "lucide-react";
import "../workspace.css";

// Set the API URL based on the environment
const API_URL = `${API_BASE_URL}/upgrade`;

axios.defaults.withCredentials = true;

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transactionId) return navigate("/upgrade-error");

      try {
        const res = await axios.post(`${API_URL}/verify-payment`, {
          transactionId,
        });
        if (res.data.status === "success") {
          navigate("/upgrade-success");
        } else {
          navigate("/upgrade-error");
        }
      } catch (err) {
        console.error(err);
        navigate("/upgrade-error");
      }
    };

    verifyPayment();
  }, [transactionId, navigate]);

  return (
    <main className="ws-result-page" role="status">
      <span className="ws-result-brand">
        proforma<span>.</span>
      </span>
      <section className="ws-result-card">
        <Loader2 className="animate-spin mx-auto mb-6" size={30} />
        <h1>Checking your payment status</h1>
        <p>
          We’re checking your payment. Your plan will update once verification
          is complete.
        </p>
      </section>
    </main>
  );
};

export default PaymentStatus;
