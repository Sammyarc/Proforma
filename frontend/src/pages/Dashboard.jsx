import {useEffect, useState} from "react";
import {Route, Routes} from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import Overview from "./Overview";
import Invoices from "./Invoices";
import Clients from "./Clients";
import Settings from "./Settings";
import Payments from "./Payments";

const Dashboard = () => {

    const year = new Date().getFullYear();
    const [isSidebarOpen, setIsSidebarOpen] = useState('false');

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return() => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const mainWidth = isMobile
        ? (
            isSidebarOpen
                ? 'calc(100% - 18vw)'
                : 'calc(100% - 18vw)'
        )
        : (
            isSidebarOpen
                ? 'calc(100% - 17vw)'
                : 'calc(100% - 4vw)'
        );
    const mainMarginLeft = isMobile
        ? (
            isSidebarOpen
                ? '18vw'
                : '18vw'
        )
        : (
            isSidebarOpen
                ? '17vw'
                : '4vw'
        )

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

    return (
        <div className="bg-transparent">
            <Header />
            <div>
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}/> 
            {/* Main Content */}
            <div className="flex flex-col"
                style={{
                    marginLeft: mainMarginLeft,
                    width: mainWidth
                }}>
                <div className="mt-[5vw] md:mt-[8vw]">
                    <Routes>
                        <Route path="/" element={<Overview />}/>
                        <Route path="invoices" element={<Invoices />}/>
                        <Route path="clients" element={<Clients />}/>
                        <Route path="payments" element={<Payments />}/>
                        <Route path="settings" element={<Settings />}/>
                    </Routes>
                </div>
                <div className="pr-[2vw] pb-[1vw]">
                    <p className="text-[3.5vw] md:text-[1vw] text-Gray800 font-satoshi mt-2 pt-4 flex justify-center space-x-[1vw] items-center">
                        Proforma © {year}
                        <span className="text-[3.5vw] md:text-[1vw] font-satoshi ml-[0.3vw]">All Rights Reserved</span>
                    </p>
                </div>
            </div>
            </div>
            
        </div>
    )
}

export default Dashboard