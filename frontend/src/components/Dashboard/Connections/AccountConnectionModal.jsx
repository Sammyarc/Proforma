import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Paypal from "../../../assets/Images/Account Icons/Logotype.svg";
import flutter from "../../../assets/Images/Account Icons/full.svg";
import stripe from "../../../assets/Images/Account Icons/Logotype (1).svg";
import paystack from "../../../assets/Images/Account Icons/images (1).png";
import skrill from "../../../assets/Images/Account Icons/Skrill.svg";
import googlepay from "../../../assets/Images/Account Icons/GooglePay.svg";
import { GoShieldLock } from 'react-icons/go';
import { motion } from "framer-motion";

const AccountConnectionModal = () => {
  const [showModal, setShowModal] = useState(false);


  // Disable scrolling when the modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const paymentOptions = [
    { 
      name: 'PayPal', 
      icon: Paypal,
      action: '',
      connected: ''
    },
    { name: 'Flutterwave', icon: flutter },
    { name: 'Stripe', icon: stripe },
    { name: 'Paystack', icon: paystack },
    { name: 'Skrill', icon: skrill },
    { name: 'Google Pay', icon: googlepay }
  ];

  return (
    <>
      {/* Connect Account Button */}
      <button 
        onClick={() => setShowModal(true)}
        className='py-[0.5vw] px-[1.5vw] box font-medium font-satoshi border border-neutral-500 rounded-xl mr-[1vw]'
      >
        Connect Account
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }} 
            className="bg-white rounded-2xl p-6 w-[400px] relative"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[4vw] font-satoshi font-bold md:text-[1.2vw]">
                Connect Payment Account
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-neutral-100 border border-neutral-300 rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Payment Options List */}
            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}  // Add action handler here
                  className={`w-full flex items-center p-3 rounded-lg transition-colors border ${
                    option.connected 
                      ? 'border-green-500 bg-green-50 hover:bg-green-100'
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                  disabled={option.connected}
                >
                  <img 
                    src={option.icon} 
                    alt={option.name}
                    className="w-10 h-8 mr-3 object-cover" 
                  />
                  <span className="font-medium text-[4vw] font-satoshi md:text-[1vw]">
                    {option.connected ? `${option.name} Connected` : `Connect with ${option.name}`}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer Text */}
            <div className="text-neutral-400 text-[4vw] flex justify-center items-center space-x-[0.5vw] font-semibold font-satoshi mt-6 md:text-[0.9vw]">
              <GoShieldLock size={25}/>
              <span>Secure connection via encrypted protocols</span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AccountConnectionModal;