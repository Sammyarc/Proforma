
import { FaFileInvoiceDollar, FaFilePdf, FaUserFriends } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { IoAnalytics } from "react-icons/io5";

const Features = () => {
  const features = [
    { icon: <GiTakeMyMoney />, text: "Track expenses, income, and revenue", position: "-translate-y-[2vw]" },
    { icon: <FaFileInvoiceDollar />, text: "Set up invoices and payments", position: "translate-y-[4vw]" },
    { icon: <FaFilePdf />, text: "Generate PDF invoices and statements", position: "-translate-y-[7vw]" },
    { icon: <FaUserFriends />, text: "View and manage your clients and suppliers", position: "translate-y-[8vw]" },
    { icon: <IoAnalytics />, text: "Track and analyze sales performance", position: "-translate-y-[8.2vw]" },
  ];

  return (
    <section className="p-8 relative" id="features">
      <h1 className="text-[5vw] font-bold font-satoshi text-center mb-2 md:text-[3vw]">
        Features
      </h1>
      <p className="text-center text-Gray800 font-satoshi mb-10">
        Proforma is a modern, user-friendly, and secure software for managing your business finances.
      </p>
      {/* Wavy Line Container */}
      <div className="relative w-full h-[26vw] mx-auto overflow-hidden md:mt-[3vw]">
        {/* Wavy Line */}
        <svg
      className="w-full h-32 md:h-[26vw]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
    >
      <path
        d="M0,100 C150,200 350,0 600,100 C850,200 1050,0 1200,100"
        fill="none"
        stroke="#4a4a4a"
        strokeWidth="0.5"
      />
    </svg>

        {/* Features */}
        <ul className="absolute inset-0 flex justify-between items-center h-full w-full">
          {features.map((feature, index) => (
            <li
              key={index}
              className={`relative w-[15%] flex flex-col items-center ${feature.position}`}
            >
              <div className="text-white p-4 rounded-full bg-Gray800 text-2xl mb-4">
                {feature.icon}
              </div>
              <p className="text-Gray800 font-satoshi text-center">
                {feature.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;
