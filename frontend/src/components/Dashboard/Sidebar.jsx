
import { IoChevronBack, IoChevronForward, IoPlay, IoSettingsOutline } from "react-icons/io5";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { TbBrandGoogleAnalytics} from "react-icons/tb";
import { GoPeople } from "react-icons/go";
import { GiTakeMyMoney } from "react-icons/gi";
import {Link, useLocation} from "react-router-dom";
import {useAuthStore} from "../../store/authStore";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

const SIDEBAR_ITEMS = [
    {
        name: 'Overview',
        icon: TbBrandGoogleAnalytics,
        path: "/dashboard"
    }, {
        name: 'Invoices',
        icon: LiaFileInvoiceSolid,
        path: "/dashboard/invoices"
    }, {
        name: 'Clients',
        icon: GoPeople,
        path: "/dashboard/clients"
    }, {
        name: 'Payments',
        icon: GiTakeMyMoney,
        path: "/dashboard/payments"
    }, {
        name: 'Settings',
        icon: IoSettingsOutline,
        path: "/dashboard/settings"
    }
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { logout } = useAuthStore();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determine styles based on screen width
    const isMobile = windowWidth < 768;
    const sidebarWidth = isOpen ? (isMobile ? '50vw' : '15vw') : (isMobile ? '' : '4vw');
    const sidebarLinkTop = isOpen ? (isMobile ? '2vw' : '') : (isMobile ? '2vw' : '');
    const sidebarLinkClick = () => {
        if (isMobile && isOpen) {
            toggleSidebar();
    }
   };



    return (
        <>
            {/* Sidebar */}
            <div
                className='fixed pr-4 top-[6vw] bottom-0 flex flex-col transition-transform duration-300 z-[1]'
                style={{
                    width: sidebarWidth,
                    paddingTop: isOpen ? '0.5vw' : '0.5vw'
                }}>

                <button onClick={toggleSidebar} className="text-[6vw] md:text-[1.2vw] rounded-full border border-neutral-500 w-[2vw] h-[2vw] flex justify-center items-center ml-auto"
                    title={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
                    >  
                        {isOpen ? <IoChevronBack /> : <IoChevronForward />}
                </button>
                {/* Sidebar Items */}
                <div style={{
                    marginTop : sidebarLinkTop
                }} >
                    {SIDEBAR_ITEMS.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (isOpen && (
            <Link
                to={item.path}
                key={index}
                onClick={sidebarLinkClick}
                className={`flex items-center space-x-[2vw] md:space-x-1.5 px-[1vw] py-[4vw] md:py-[0.7vw] md:my-[1vw] rounded-r-xl ${
                isActive
                    ? 'bg-neutral-600 box  text-MilkWhite'
                    : 'bg-transparent text-Gray800'} hover:bg-neutral-600 hover:text-white transition delay-75`}
                title={item.name}>
                <item.icon className="w-[5vw] h-[5vw] md:w-[2vw] md:h-[1.5vw]"/>
                <span className="font-satoshi text-[4vw] md:text-[1.1vw]">
                    {item.name}
                </span>
            </Link>
             ));
           })
              }
                </div>

                {isOpen && (<div
                            className=" text-Gray800 mt-[2vw] font-satoshi box ml-4 p-3 border border-gray-500 rounded-2xl flex flex-col">
                            <h3
                                className="text-[5vw] font-semibold md:text-[1.1vw]">Need Help?</h3>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex justify-between items-center text-[4vw] mt-[2vw] text-blue-600 rounded-md font-medium md:text-[1vw]">
                                <span>Watch this video</span>
                                <IoPlay size={30} className="ml-2 p-2 bg-Gray900 text-[#F8FAFC] rounded-md"/>
                            </a>
                        </div>)}


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
                        <LogOut className="w-[6vw] h-[6vw] md:w-[2vw] md:h-[1.5vw]" title="logout" />
                        {isOpen && <span className="text-[4vw] md:text-[1.1vw]">Logout</span>}
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
