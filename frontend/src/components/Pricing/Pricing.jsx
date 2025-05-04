import { useState } from "react";

const pricingData = {
  monthly: {
    price: "10",
    description: "Perfect for individuals and small businesses",
    features: [
      "Up to 20 Invoice per month",
      "Basic customization",
      "PDF generation",
      "Email support",
      "PDF Downloads",
      "Client management",
      "Payment integrations",
    ],
  },
  yearly: {
    price: "108",
    description: "Save 10% with annual billing",
    features: [
      "Create unlimited invoices",
      "Advanced customization",
      "PDF generation",
      "Priority email support",
      "PDF Downloads",
      "Client management",
      "Payment integrations",
      "One month free",
      "Advanced reporting",
    ],
  },
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const planData = pricingData[billingCycle];

  return (
    <section className="py-16" id="pricing">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-[8vw] font-bold mb-[3vw] font-satoshi md:text-[3vw]">
          Choose a Plan
        </h2>

        {/* Billing toggle */}
        <div className="flex justify-center gap-[1vw] mb-6">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 text-[4vw] font-medium font-satoshi transition-all duration-300 md:text-[1.1vw] ${
              billingCycle === "monthly"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 relative text-[4vw] font-medium font-satoshi transition-all duration-300 md:text-[1.1vw] ${
              billingCycle === "yearly"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500"
            }`}
          >
            Yearly
            <span className="absolute w-[15vw] py-[0.2vw] -top-1 text-[3vw] bg-green-200 text-green-800 rounded-[0.2vw] md:text-[0.8vw] md:w-[5vw] md:-top-2">
              Save 10%
            </span>
          </button>
        </div>

        {/* Two-column pricing card */}
        <div className="max-w-4xl md:mx-auto">
          <div className="flex flex-col justify-center items-center gap-x-[3vw] md:flex-row">
            {/* Left column - Price with fieldset border */}
            <div className="w-full h-full p-[4vw] relative border border-neutral-400 rounded-3xl m-4 md:w-[50vw] md:h-[24vw] md:p-[1.5vw]">
              {/* Fieldset legend */}
              {billingCycle === "yearly" && (
                <div className="absolute -top-3 right-6 rounded-lg bg-white flex justify-center px-2 py-0.5">
                  <span className="text-[3vw] font-bold font-satoshi text-gray-600 md:text-[0.8vw]">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex flex-col pt-2">
                <div className="mt-4 mb-1">
                  <span className="text-[10vw] font-bold text-gray-900 font-satoshi md:text-[4vw]">
                    ${planData.price}
                  </span>
                  <span className="text-[5vw] text-gray-600 font-satoshi md:text-[1.5vw]">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>
                <p className="text-gray-600 text-[4vw] font-satoshi mb-2 max-w-xs md:text-[1vw]">
                  {planData.description}
                </p>
                <button className="px-[1.5vw] py-[1.2vw] mt-[10vw] mb-[2vw] font-satoshi font-bold border border-neutral-500 rounded-xl box md:mt-[7vw] md:py-[0.5vw]">
                  Get Started
                </button>
              </div>
            </div>

            {/* Right column - Features */}
            <div className="mt-[2vw] md:p-8 w-full">
              <h4 className="text-[6.5vw] font-semibold font-clash text-gray-900 mb-4 md:mb-2 md:text-[3vw]">
                What&apos;s included:
              </h4>
              <ul className="space-y-4">
                {planData.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-neutral-700 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-[4vw] font-satoshi md:text-[1vw]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
