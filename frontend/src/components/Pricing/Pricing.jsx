import { GoDotFill } from "react-icons/go";

const plans = [
  {
    name: "Free",
    description: "Perfect for individuals starting out.",
    price: "0",
    features: ["Create up to 5 invoices", "Basic customization", "Email support"],
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    description: "For small businesses and freelancers.",
    price: "19",
    features: [
      "Unlimited invoices",
      "Advanced customization",
      "PDF generation",
      "Priority support",
    ],
    buttonText: "Upgrade to Pro",
  },
  {
    name: "Business",
    description: "For growing teams and companies.",
    price: "49",
    features: [
      "Team collaboration",
      "Advanced revenue tracking",
      "Custom branding",
      "24/7 support",
    ],
    buttonText: "Contact Sales",
  },
];

const Pricing = () => {
  return (
    <section className="py-[2vw]" id="pricing">
      <div className=" mx-[10vw] text-center">
        <h2 className="text-[5vw] font-bold font-satoshi text-center mb-2 md:text-[3vw]">
          Choose Your Plan
        </h2>
        <p className="text-[4vw] font-satoshi mb-[3vw] md:text-[1.2vw]">
          Simple and transparent pricing for your invoice management needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="border border-gray-300 bg-MilkWhite p-6 rounded-xl"
            >
              <h3 className="text-[5vw] font-semibold font-satoshi text-Gray900 mb-2 md:text-[2vw]">
                {plan.name}
              </h3>
              <p className="text-Gray800 font-satoshi mb-2">{plan.description}</p>
              <p className="text-[6vw] font-bold font-satoshi text-gray-800 mb-6 md:text-[3vw]">
                ${plan.price}
                <span className="text-sm font-normal font-satoshi">/month</span>
              </p>
              <ul className="text-Gray800 space-y-2 h-[11vw]">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-[0.5vw] font-satoshi">
                    <GoDotFill /> <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="py-[0.6vw] w-full font-satoshi bg-Gray800 text-white rounded-lg">
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
