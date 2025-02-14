import {useState} from 'react';
import {Filter, CheckCircle, Settings, LogOut} from 'lucide-react';
import Logo from "../../assets/Images/P-removebg-preview.png";
import {FaCheck} from "react-icons/fa6";
import {GoSearch} from "react-icons/go";
import {FaBell} from 'react-icons/fa';
import {VscAccount} from "react-icons/vsc";
import {useAuthStore} from '../../store/authStore';
import AccountConnectionModal from './Connections/AccountConnectionModal';

const Header = () => {

    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [animate, setAnimate] = useState(false);

    const toggleAlerts = () => {
        setIsAlertsOpen(!isAlertsOpen);

        // Trigger the animation
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500); // Remove class after animation duration
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const {logout} = useAuthStore();

    return (
        <div className='relative'>
            <div className="fixed top-0 left-0 right-0 z-[50] bg-[#F5F5F2]">
            <div className="flex items-center justify-between p-2">
                {/* Logo */}
                <div>
                    <a href="#" className="flex items-center">
                        <img
                            src={Logo}
                            alt='Profoma Logo'
                            className='w-[10vw] h-[3vw] md:w-[5vw] md:h-[5vw]'/>
                        <span className='font-clash text-[4vw] text-black md:text-[1.5vw]'>Proforma</span>
                    </a>
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
                <div className="flex items-center">
                    
                    {/* Connect account button */}
                    <AccountConnectionModal />

                    {/* Alerts Button */}
                    <div className="relative">
                        <button
                            title="What's New"
                            className="p-2 bg-neutral-600 box rounded-lg"
                            onClick={toggleAlerts}
                            aria-haspopup="true"
                            aria-expanded={isAlertsOpen}>
                            <FaBell
                                className={`text-white ${animate
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

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            className="flex items-center space-x-2 p-2"
                            onClick={toggleMenu}
                            aria-haspopup="true"
                            aria-expanded={isMenuOpen}>
                            <span
                                className="bg-neutral-600 box text-[4vw] font-satoshi text-white rounded-lg w-8 h-8 flex items-center justify-center md:text-[0.9vw]">
                                JD
                            </span>
                            <span className="font-satoshi text-[4vw] md:text-[1.1vw]">John Doe</span>
                        </button>
                        {
                            isMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-64 bg-white text-black rounded-md shadow-lg md:w-[20vw] md:rounded-lg animate-moveUp">
                                    <div className="p-4 border-b flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className="bg-neutral-600 box text-[4vw] font-satoshi text-white rounded-md w-8 h-8 flex items-center justify-center md:text-[0.9vw]">
                                                JD
                                            </span>
                                            <div>
                                                <p className="font-semibold font-satoshi">John Doe</p>
                                                <p className="text-sm text-gray-600 font-satoshi">johndoe@gmail.com</p>
                                            </div>
                                        </div>
                                        <FaCheck size={20} className='text-green-600'/>
                                    </div>
                                    <ul className="py-[0.5vw]">
                                        <li>
                                            <a
                                                href="#"
                                                className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 font-satoshi">
                                                <VscAccount size={22}/>
                                                <span>Account</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 font-satoshi">
                                                <Settings size={22}/>
                                                <span>Settings</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    logout();
                                                    window.location.href = "/signup";
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 font-satoshi text-red-600">
                                                <LogOut size={22}/>
                                                <span>Logout</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )
                        }
                    </div>

                </div>
            </div>
        </div>
        </div>
        
    )
}

export default Header
