import {
  IoChevronBack,
  IoChevronForward,
  IoSettingsOutline,
} from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { GoPeople } from "react-icons/go";
import { GiTakeMyMoney } from "react-icons/gi";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";

const SIDEBAR_ITEMS = [
  {
    name: "Overview",
    icon: TbBrandGoogleAnalytics,
    path: "/dashboard",
  },
  {
    name: "Invoices",
    icon: LiaFileInvoiceSolid,
    path: "/dashboard/invoices",
  },
  {
    name: "Clients",
    icon: GoPeople,
    path: "/dashboard/clients",
  },
  {
    name: "Payments",
    icon: GiTakeMyMoney,
    path: "/dashboard/payments",
  },
  {
    name: "Settings",
    icon: IoSettingsOutline,
    path: "/dashboard/settings",
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { invoiceCount, nextReset, fetchInvoiceCount, isLoading } =
    useInvoiceStore();

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Determine styles based on screen width
  const isMobile = windowWidth < 768;
  const sidebarWidth = isOpen
    ? isMobile
      ? "50vw"
      : "15vw"
    : isMobile
    ? ""
    : "4vw";
  const sidebarLinkTop = isOpen
    ? isMobile
      ? "2vw"
      : ""
    : isMobile
    ? "2vw"
    : "";
  const sidebarLinkClick = () => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className="fixed pr-4 top-[6vw] bottom-0 flex flex-col transition-transform duration-300 z-[1]"
        style={{
          width: sidebarWidth,
          paddingTop: isOpen ? "0.5vw" : "0.5vw",
        }}
      >
        <button
          onClick={toggleSidebar}
          className="text-[6vw] md:text-[1.2vw] rounded-full border border-neutral-500 w-[2vw] h-[2vw] flex justify-center items-center ml-auto"
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen ? <IoChevronBack /> : <IoChevronForward />}
        </button>
        {/* Sidebar Items */}
        <div
          style={{
            marginTop: sidebarLinkTop,
          }}
        >
          {SIDEBAR_ITEMS.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              isOpen && (
                <Link
                  to={item.path}
                  key={index}
                  onClick={sidebarLinkClick}
                  className={`flex items-center space-x-[2vw] md:space-x-1.5 px-[1vw] py-[4vw] md:py-[0.7vw] md:my-[1vw] rounded-r-xl ${
                    isActive
                      ? "bg-neutral-600 box  text-MilkWhite"
                      : "bg-transparent text-Gray800"
                  } hover:bg-neutral-600 hover:text-white transition delay-75`}
                  title={item.name}
                >
                  <item.icon className="w-[5vw] h-[5vw] md:w-[2vw] md:h-[1.5vw]" />
                  <span className="font-satoshi text-[4vw] md:text-[1.1vw]">
                    {item.name}
                  </span>
                </Link>
              )
            );
          })}
        </div>

        {isOpen && (
          <div className="text-Gray800 font-satoshi box ml-4 mt-[1vw] p-3 border border-gray-500 rounded-2xl flex flex-col">
            <h3 className="text-[5vw] font-semibold md:text-[1.1vw]">
              Free Plan Usage
            </h3>

            {isLoading ? (
              <p className="text-[4vw] md:text-[0.9vw] mt-[0.5vw]">
                Loading usage…
              </p>
            ) : (
              <>
                {/* Usage Text */}
                <p className="text-[4vw] md:text-[0.9vw] mt-[0.5vw] mb-2">
                  {invoiceCount} / 10 invoices sent
                </p>

                {/* Progress Meter */}
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      invoiceCount >= 8
                        ? "bg-red-500"
                        : invoiceCount >= 5
                        ? "bg-yellow-400"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${(invoiceCount / 10) * 100}%` }}
                  />
                </div>

                {/* Upgrade Text */}
                <button className="mt-3 flex items-center gap-1 text-[4vw] md:text-[1vw] text-blue-600 font-medium hover:underline md:mt-2">
                  Upgrade to Pro
                  <IoIosArrowRoundForward size={20} />
                </button>

                {/* Reset Info */}
                <p className="text-[3.5vw] md:text-[0.8vw] text-gray-500 mt-2">
                  {resetDateFormatted &&
                    `Limit resets on ${resetDateFormatted}`}
                </p>
              </>
            )}
          </div>
        )}

        {/* Logout Button */}
        {isOpen && (
          <div className=" mb-[1vw] md:mt-auto">
            <button
              className="font-satoshi text-red-600 flex items-center px-[1vw] space-x-1.5"
              title="Logout"
              onClick={() => {
                logout();
                window.location.href = "/signup";
              }}
            >
              <LogOut
                className="w-[6vw] h-[6vw] md:w-[2vw] md:h-[1.5vw]"
                title="logout"
              />
              {isOpen && (
                <span className="text-[4vw] md:text-[1.1vw]">Logout</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Overlay for smaller screens */}
      {isOpen && isMobile && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-Gray700 bg-opacity-50 z-40"
          onClick={toggleSidebar} // Close sidebar on overlay click
        ></div>
      )}
    </>
  );
};

export default Sidebar;
