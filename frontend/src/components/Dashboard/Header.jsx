import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {Filter, CheckCircle } from 'lucide-react';
import Logo from "../../assets/Images/P-removebg-preview.png";
import {GoSearch} from "react-icons/go";
import { CiBellOn } from "react-icons/ci";
import AccountConnectionModal from './Connections/AccountConnectionModal';
import { useAuthStore } from '../../store/authStore';


const Header = () => { 
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    const toggleAlerts = () => {
        setIsAlertsOpen(!isAlertsOpen);

        // Trigger the animation
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500); // Remove class after animation duration
    };


    const { user } = useAuthStore();

    const getInitials = (name) => {
        if (!name) return "";
        const words = name.trim().split(" ");
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        // Use first letter of first and last words for initials
        return (
          words[0].charAt(0).toUpperCase() +
          words[words.length - 1].charAt(0).toUpperCase()
        );
    };
      

    return (
        <div className='relative'>
            <div className="fixed top-0 left-0 right-0 z-[50] bg-[#F5F5F2]">
            <div className="flex items-center justify-between p-2">
                {/* Logo */}
                <div className='flex items-center'>
                        <img
                            src={Logo}
                            alt='Profoma Logo'
                            className='w-[10vw] h-[3vw] md:w-[5vw] md:h-[5vw]'/>
                        <span className='font-clash text-[4vw] text-black md:text-[1.5vw]'>Proforma</span>
                </div>

                {/* Search */}
                <div className="ml-4 relative">
                    <label htmlFor="search-input" className="sr-only">Search</label>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search"
                        className="bg-transparent text-Gray800 font-satoshi px-3 py-2 rounded-md pl-10 w-64 border border-gray-400 outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:w-[25vw] md:rounded-xl"/>
                    <GoSearch className="absolute left-3 top-3 text-gray-900"/>
                </div>


                {/* Right side buttons */}
                <div className="flex items-center gap-[0.8vw]">

                    {/* Alerts Button */}
                    <div className="relative">
                        <button
                            title="What's New"
                            className="w-10 h-10 flex justify-center items-center border border-neutral-500 box rounded-lg"
                            onClick={toggleAlerts}
                            aria-haspopup="true"
                            aria-expanded={isAlertsOpen}>
                            <CiBellOn
                            size={27}
                                className={` ${animate
                                    ? "shake"
                                    : ""}`}/>
                        </button>
                        {
                            isAlertsOpen && (
                                <div
                                    className="absolute right-0 mt-4 w-64 bg-MilkWhite text-black font-satoshi rounded-md shadow-lg p-4 md:w-[20vw] md:rounded-lg animate-moveUp">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-[4vw] font-semibold md:text-[1.2vw]">Notifications</h2>
                                        <div className="flex space-x-2">
                                            <button title="Filter">
                                                <Filter size={20}/>
                                            </button>
                                            <button title="Mark as read">
                                                <CheckCircle size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[3.2vw] text-center text-gray-600 md:text-[0.9vw]">No new notifications</p>
                                </div>
                            )
                        }
                    </div>

                    {/* User Profile */}
                        <button
                            title="User Profile"
                            className="w-10 h-10 flex justify-center items-center border border-neutral-500 box rounded-lg"
                            onClick={() => navigate('/dashboard/settings')}>
                            <span
                                className="text-[4vw] font-satoshi font-bold md:text-[1.1vw]">
                                {getInitials(user?.name) || ""}
                            </span>
                        </button>
                        
                    {/* Connect account button */}
                    <AccountConnectionModal />
                </div>
            </div>
        </div>
        </div>
        
    )
}

export default Header
