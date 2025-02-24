import {useAuthStore} from "../store/authStore";
import Paypal from "../assets/Images/Account Icons/PayPal_Logo_Icon_2014.svg";
import flutter from "../assets/Images/Account Icons/full.svg";
import stripe from "../assets/Images/Account Icons/Logotype (1).svg";
import paystack from "../assets/Images/Account Icons/images (1).png";
import skrill from "../assets/Images/Account Icons/Skrill.svg";
import googlepay from "../assets/Images/Account Icons/GooglePay.svg";
import {UsePaymentHandlers} from "../hooks/UsePaymentHandlers";
import {IoCheckmarkOutline} from "react-icons/io5";
import {useState} from "react";

const Settings = () => {
    const {connections} = useAuthStore();
    const {handlers} = UsePaymentHandlers();
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const paymentOptions = [
        {
            name: "PayPal",
            icon: Paypal,
            action: handlers.handlePayPalConnect, // For connecting
            disconnect: handlers.handleDisconnectPayPal, // For disconnecting
            connected: connections.paypal
        }, {
            name: "Flutterwave",
            icon: flutter,
            action: handlers.handleFlutterwaveConnect,
            disconnect: handlers.handleDisconnectFlutterwave,
            connected: connections.flutterwave
        }, {
            name: "Stripe",
            icon: stripe,
            action: handlers.handleStripeConnect,
            disconnect: handlers.handleDisconnectStripe,
            connected: connections.stripe
        }, {
            name: "Paystack",
            icon: paystack,
            action: handlers.handlePaystackConnect,
            disconnect: handlers.handleDisconnectPaystack,
            connected: connections.paystack
        }, {
            name: "Skrill",
            icon: skrill,
            action: handlers.handleSkrillConnect,
            disconnect: handlers.handleDisconnectSkrill,
            connected: connections.skrill
        }, {
            name: "Google Pay",
            icon: googlepay,
            action: handlers.handleGooglePayConnect,
            disconnect: handlers.handleDisconnectGooglePay,
            connected: connections.googlePay
        }
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
    

    return (
        <div className="border border-neutral-500 rounded-3xl p-4 box md:w-[25vw]">
            <h1
                className="mb-[0.5vw] font-satoshi font-semibold text-[5vw] md:text-[1.2vw]">
                Payment Account
            </h1>

            {/* If no payment methods are connected, show a message */}
            {
                connectedOptions.length === 0 && (
                    <p className="p-4 text-gray-600 text-center font-satoshi">No Payment Method Connected</p>
                )
            }

            {/* Render a card for each connected method */}
            {
                connectedOptions.map((option) => (
                    <div className="p-4 rounded-xl" key={option.name}>
                        <div className="flex items-center justify-between mb-[1.5vw]">
                            {/* Left side: Icon + Method Name */}
                            <div className="flex items-center space-x-2">
                                <img src={option.icon} alt={option.name} className="w-full h-10 object-cover"/>
                                <span className="font-medium text-[4vw] font-satoshi md:text-[1vw]">
                                    {option.name}
                                </span>
                            </div>
                            {/* Right side: Connected Indicator */}
                            <div
                                className="flex items-center border border-neutral-500 px-[0.9vw] py-[0.3vw] rounded-full">
                                <div
                                    className="w-4 h-4 flex justify-center items-center bg-green-600 rounded-full mr-2">
                                    <IoCheckmarkOutline size={10}/>
                                </div>
                                <span className="text-[4vw] font-satoshi md:text-[1vw]">Connected</span>
                            </div>
                        </div>
                        {/* Disconnect Button */}
                        <button
                           title="Disconnect Payment Account"
                           onClick={() => handleDisconnect(option)}
                            disabled={isDisconnecting}
                            className={`px-[1vw] py-[0.4vw] text-[4vw] font-satoshi bg-[#F5F5F5] border border-neutral-500 rounded-3xl md:text-[1vw] ${isDisconnecting ? "font-normal text-gray-400 cursor-not-allowed" : "text-neutral-800 font-semibold"}`}>
                            {
                                isDisconnecting
                                    ? "Disconnecting..."
                                    : "Disconnect"
                            }
                        </button>
                    </div>
                ))
            }
        </div>
    )
}

export default Settings