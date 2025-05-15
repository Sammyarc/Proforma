import { useAuthStore } from "../store/authStore";
import Paypal from "../assets/Images/Account Icons/PayPal_Logo_Icon_2014.svg";
import flutter from "../assets/Images/Account Icons/full.svg";
import stripe from "../assets/Images/Account Icons/Logotype (1).svg";
import paystack from "../assets/Images/Account Icons/images (1).png";
import skrill from "../assets/Images/Account Icons/Skrill.svg";
import googlepay from "../assets/Images/Account Icons/GooglePay.svg";
import { UsePaymentHandlers } from "../hooks/UsePaymentHandlers";
import { IoCheckmarkOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { FiUpload } from "react-icons/fi";
import { RiLoader4Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useInvoiceStore } from "../store/invoiceStore";
import { IoIosArrowRoundForward } from "react-icons/io";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/settings"
    : "https://proforma-h8qh.onrender.com/settings";

axios.defaults.withCredentials = true;

const Settings = () => {
  const { connections, user } = useAuthStore();
  const { handlers } = UsePaymentHandlers();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  // State for form fields
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    city: "",
    country: "",
    state: "",
    phoneNumber: "",
  });
  const { invoiceCount, nextReset, fetchInvoiceCount, isLoading } =
    useInvoiceStore();

  // State for logo
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // navigate function to redirect to another page
  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/user-settings`);
        const userData = response.data;

        setFormData({
          businessName: userData.businessName || "",
          email: userData.email || "",
          city: userData.city || "",
          country: userData.country || "",
          state: userData.state || "",
          phoneNumber: userData.phoneNumber || "",
        });

        if (userData.logoUrl) {
          setLogoUrl(userData.logoUrl);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your settings. Please refresh the page.");
      }
    };

    fetchUserData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, SVG)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append("logo", file);

      // Upload to server which will handle Cloudinary upload
      const response = await axios.post(`${API_URL}/upload-logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Set the logo URL from response
      setLogoUrl(response.data.logoUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const updatedUserData = {
        ...formData,
      };

      // Send data to API
      await axios.put(`${API_URL}/user-settings`, updatedUserData);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClick = () => {
    navigate("/forgot-password");
  };

  const paymentOptions = [
    {
      name: "PayPal",
      icon: Paypal,
      action: handlers.handlePayPalConnect, // For connecting
      disconnect: handlers.handleDisconnectPayPal, // For disconnecting
      connected: connections.paypal,
    },
    {
      name: "Flutterwave",
      icon: flutter,
      action: handlers.handleFlutterwaveConnect,
      disconnect: handlers.handleDisconnectFlutterwave,
      connected: connections.flutterwave,
    },
    {
      name: "Stripe",
      icon: stripe,
      action: handlers.handleStripeConnect,
      disconnect: handlers.handleDisconnectStripe,
      connected: connections.stripe,
    },
    {
      name: "Paystack",
      icon: paystack,
      action: handlers.handlePaystackConnect,
      disconnect: handlers.handleDisconnectPaystack,
      connected: connections.paystack,
    },
    {
      name: "Skrill",
      icon: skrill,
      action: handlers.handleSkrillConnect,
      disconnect: handlers.handleDisconnectSkrill,
      connected: connections.skrill,
    },
    {
      name: "Google Pay",
      icon: googlepay,
      action: handlers.handleGooglePayConnect,
      disconnect: handlers.handleDisconnectGooglePay,
      connected: connections.googlePay,
    },
  ];

  // Filter out only the connected payment methods
  const connectedOptions = paymentOptions.filter((opt) => opt.connected);

  // Function to disconnect the payment account
  const handleDisconnect = async (option) => {
    setIsDisconnecting(true);
    try {
      // Wait for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (option.disconnect) {
        await option.disconnect();
      } else {
        console.warn(`No disconnect handler for ${option.name}`);
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Fetch when dropdown opens (or on mount if you prefer)
  useEffect(() => {
    if (user?._id) {
      fetchInvoiceCount(user._id);
    }
  }, [user?._id, fetchInvoiceCount]);

  // Format reset date once we have periodStart
  const resetDateFormatted = nextReset
    ? new Date(nextReset).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "";

  return (
    <div className="mx-4 lg:mx-6">
      <div className="my-6">
        <h1 className="text-[4vw] font-satoshi font-bold mb-6 md:text-[3vw] lg:text-[2.5vw]">
          Profile
        </h1>

        {/* Logo Upload Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div
              onClick={triggerFileInput}
              className={`w-32 h-32 flex flex-col items-center justify-center cursor-pointer rounded-md ${logoUrl
                ? "border-none"
                : "border-2 border-dashed border-gray-300 hover:bg-gray-50"
                }`}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <FiUpload size={24} className="text-gray-400" />
                  <span className="text-[4vw] font-satoshi mt-1 text-gray-400 md:text-base lg:text-[1vw]">
                    Upload Logo
                  </span>
                </>
              )}
              {isUploading && (
                <div className="text-[4vw] font-satoshi mt-1 text-green-400 md:text-base lg:text-[1vw]">
                  Uploading...
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />

            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="py-[0.5vw] px-[1.5vw] box font-bold font-satoshi border rounded-xl"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-[3vw]">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 px-[2vw] py-[3vw] border border-gray-300 box rounded-3xl w-full gap-6 lg:w-3/5 lg:grid-cols-2"
          >
            {/* Business Details Form */}
            <div>
              <label
                htmlFor="businessName"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Business Name:
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Email Address:
              </label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                City:
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Country:
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                State:
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Phone No:
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-[2vw] py-[0.5vw] box font-bold font-satoshi border rounded-xl lg:py-[0.5vw] lg:px-[1.5vw] ${isSaving
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100 cursor-pointer"
                  }`}
              >
                {isSaving ? (
                  <div className="text-[4vw] flex items-center gap-2 md:text-sm lg:text-[1vw]">
                    <RiLoader4Line className="animate-spin" size={20} />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span className="text-[4vw] md:text-sm lg:text-base">Save Changes</span>
                )}
              </button>
            </div>
          </form>

          <div className="w-full px-[2vw] py-[3vw] border border-gray-300 box rounded-3xl lg:w-2/5">
            <h1 className="mb-[1vw] font-satoshi font-semibold text-[5vw] md:text-lg lg:text-base">
              Password
            </h1>
            <button
              title="Change Password"
              onClick={handleClick}
              className="px-[1vw] py-[0.4vw] text-[4vw] font-satoshi bg-[#F5F5F5] border border-neutral-500 rounded-3xl md:text-base lg:text-sm"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden border border-neutral-500 rounded-3xl p-4 box lg:block w-[25vw]">
        <h1 className="font-satoshi font-semibold text-base mb-[0.5vw]">
          Payment Account
        </h1>

        {/* If no payment methods are connected, show a message */}
        {connectedOptions.length === 0 && (
          <p className="p-4 text-gray-600 text-center font-satoshi">
            No Payment Method Connected
          </p>
        )}

        {/* Render a card for each connected method */}
        {connectedOptions.map((option) => (
          <div className="rounded-xl lg:p-2" key={option.name}>
            <div className="flex items-center justify-between mb-[1.5vw]">
              {/* Left side: Icon + Method Name */}
              <div className="flex items-center gap-2">
                <img
                  src={option.icon}
                  alt={option.name}
                  className="w-full h-10 object-cover"
                />
                <span className="font-medium font-satoshi text-base">
                  {option.name}
                </span>
              </div>
              {/* Right side: Connected Indicator */}
              <div className="flex items-center border border-neutral-500 rounded-full px-[0.9vw] py-[0.3vw]">
                <div className="flex justify-center items-center bg-green-600 rounded-full mr-2 w-4 h-4">
                  <IoCheckmarkOutline size={10} />
                </div>
                <span className="font-satoshi text-xs">
                  Connected
                </span>
              </div>
            </div>
            {/* Disconnect Button */}
            <button
              title="Disconnect Payment Account"
              onClick={() => handleDisconnect(option)}
              disabled={isDisconnecting}
              className={`font-satoshi bg-[#F5F5F5] border border-neutral-500 rounded-3xl text-sm px-[1vw] py-[0.4vw] ${isDisconnecting
                ? "font-normal text-gray-400 cursor-not-allowed"
                : "text-neutral-800 font-semibold"
                }`}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ))}
      </div>

      {/* Tablet and mobile view */}
      <div className="grid grid-cols-2 gap-5 lg:hidden">
        <div className="border border-neutral-500 rounded-3xl p-4 box">
          <h1 className="mb-[2vw] font-satoshi font-semibold text-lg">
            Payment Account
          </h1>

          {/* If no payment methods are connected, show a message */}
          {connectedOptions.length === 0 && (
            <p className="p-4 text-gray-600 text-sm text-center font-satoshi">
              No Payment Method Connected
            </p>
          )}

          {/* Render a card for each connected method */}
          {connectedOptions.map((option) => (
            <div className="rounded-xl lg:p-2" key={option.name}>
              <div className="flex items-center justify-between mb-[1.5vw]">
                {/* Left side: Icon + Method Name */}
                <div className="flex items-center gap-2">
                  <img
                    src={option.icon}
                    alt={option.name}
                    className="w-full h-10 object-cover"
                  />
                  <span className="font-medium font-satoshi text-lg ">
                    {option.name}
                  </span>
                </div>
                {/* Right side: Connected Indicator */}
                <div className="flex items-center border border-neutral-500 px-[1.2vw] py-[0.5vw] rounded-full">
                  <div className="w-5 h-5 flex justify-center items-center bg-green-600 rounded-full mr-2">
                    <IoCheckmarkOutline size={10} />
                  </div>
                  <span className="font-satoshi text-base">
                    Connected
                  </span>
                </div>
              </div>
              {/* Disconnect Button */}
              <button
                title="Disconnect Payment Account"
                onClick={() => handleDisconnect(option)}
                disabled={isDisconnecting}
                className={`font-satoshi mt-3 bg-[#F5F5F5] border border-neutral-500 px-[3vw] py-[0.4vw] rounded-3xl text-base ${isDisconnecting
                  ? "font-normal text-gray-400 cursor-not-allowed"
                  : "text-neutral-800 font-semibold"
                  }`}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          ))}
        </div>
        <div className="text-Gray800 font-satoshi box p-3 border border-gray-500 rounded-2xl flex flex-col">
          <h3 className="text-lg font-semibold">
            Free Plan Usage
          </h3>

          {isLoading ? (
            <p className="text-sm mt-[0.5vw]">
              Loading usage…
            </p>
          ) : (
            <>
              {/* Usage Text */}
              <p className="text-base mt-[0.5vw] mb-2">
                {invoiceCount} / 10 invoices sent
              </p>

              {/* Progress Meter */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${invoiceCount >= 8
                    ? "bg-red-500"
                    : invoiceCount >= 5
                      ? "bg-yellow-400"
                      : "bg-green-500"
                    }`}
                  style={{ width: `${(invoiceCount / 10) * 100}%` }}
                />
              </div>

              {/* Upgrade Text */}
              <button className="mt-3 flex items-center gap-1 text-base text-blue-600 font-medium hover:underline lg:mt-2">
                Upgrade to Pro
                <IoIosArrowRoundForward size={20} />
              </button>

              {/* Reset Info */}
              <p className="text-base text-gray-500 mt-2">
                {resetDateFormatted &&
                  `Limit resets on ${resetDateFormatted}`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
