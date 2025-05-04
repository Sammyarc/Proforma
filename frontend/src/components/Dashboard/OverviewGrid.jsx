
import { GiCheckMark, GiPayMoney } from "react-icons/gi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { AiOutlineWarning } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/invoice"
    : "https://proforma-h8qh.onrender.com/api/invoice";

axios.defaults.withCredentials = true;

const OverviewGrid = ({ userId }) => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingPayments: { count: 0, amount: 0 },
    completedPayments: { count: 0, amount: 0 },
    failedPayments: { count: 0, amount: 0 },
    isLoading: true,
  });

  // Format number as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const { user } = useAuthStore();

  useEffect(() => {
    const userId = user?._id;
    const fetchOverviewStats = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/invoices/stats/overview?userId=${userId}`
        );
        setStats({
          ...response.data,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching invoice overview stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (userId) {
      fetchOverviewStats();
    }
  }, [userId]);

  // Skeleton loader for each card
  const SkeletonLoader = () => (
        <div className="h-[6vw] w-[6vw] animate-pulse md:h-[2.5vw] md:w-[2.5vw] bg-gray-200 rounded-lg"></div>
  );

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 mb-[5vw] md:mb-[2vw]"
    >
      {/* Invoices Sent */}
      <div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl">
        <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">
          Invoices Sent:
        </h2>

        <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
          <LiaFileInvoiceSolid className="text-teal-600 text-[6vw] md:text-[2.5vw]" />
          {stats.isLoading ? (
            <SkeletonLoader />
          ) : (
            <p className="text-[4vw] font-satoshi font-bold text-Gray700 md:text-[1vw]">
              {stats.totalInvoices}
            </p>
          )}
        </div>
      </div>

      {/* Pending Payments */}
      <div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl">
        <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">
          Pending Payments
        </h2>
        <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
          <GiPayMoney className="text-indigo-600 text-[6vw] md:text-[2.5vw]" />
          {stats.isLoading ? (
            <SkeletonLoader />
          ) : (
            <div>
              <p className="text-[4vw] font-satoshi font-bold text-Gray700 md:text-[1vw]">
                {stats.pendingPayments.count}
              </p>
              <p className="text-[3.6vw] font-satoshi text-gray-500 md:text-[0.9vw]">
                {formatCurrency(stats.pendingPayments.amount)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Invoices */}
      <div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl">
        <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">
          Completed Payments
        </h2>
        <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
          <GiCheckMark className="text-green-500 text-[6vw] md:text-[2.5vw]" />
          {stats.isLoading ? (
            <SkeletonLoader />
          ) : (
            <div>
              <p className="text-[4vw] font-satoshi font-bold text-Gray700 md:text-[1vw]">
                {stats.completedPayments.count}
              </p>
              <p className="text-[3.6vw] font-satoshi text-gray-500 md:text-[0.9vw]">
                {formatCurrency(stats.completedPayments.amount)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recurring Payments */}
      <div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl">
        <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">
          Failed Payments
        </h2>
        <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
          <AiOutlineWarning className="text-red-500 text-[6vw] md:text-[2.5vw]" />
          {stats.isLoading ? (
            <SkeletonLoader />
          ) : (
            <div>
              <p className="text-[4vw] font-satoshi font-bold text-Gray700 md:text-[1vw]">
                {stats.failedPayments.count}
              </p>
              <p className="text-[3.6vw] font-satoshi text-gray-500 md:text-[0.9vw]">
                {formatCurrency(stats.failedPayments.amount)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewGrid;
