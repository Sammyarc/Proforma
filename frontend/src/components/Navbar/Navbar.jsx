import {useState} from "react";
import {HiOutlineMenuAlt3} from "react-icons/hi";
import Logo from "../../assets/Images/P-removebg-preview.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleGenerate = () => {
        navigate('/signup'); 
    };


    return (
        <nav className=" text-Gray800 bg-[#F5F5F2] fixed top-0 left-0 w-full z-[20]">
            <div
                className="container mx-auto flex items-center justify-between p-4 my-[0.1vw]">
                {/* Logo */}
                <div>
                    <a href="/" className="flex items-center">
                        <img
                            src={Logo}
                            alt='Profoma Logo'
                            className='w-[10vw] h-[3vw] md:w-[5vw] md:h-[5vw]'/>
                        <span className='font-clash text-[4vw] text-black md:text-[1.5vw]'>Proforma</span>
                    </a>
                </div>
                {/* Hamburger Menu */}
                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="outline-none border-none bg-transparent w-[10vw] h-[10vw] text-Gray800 flex justify-center items-center">
                        <HiOutlineMenuAlt3 className="text-[8vw]"/>
                    </button>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-8 text-xl font-medium">
                    <li>
                        <a href="#features" className="hover:text-gray-600 text-Gray800 font-satoshi">
                            Features
                        </a>
                    </li>
                    <li>
                        <a
                            href="#pricing"
                            className="hover:text-gray-600 text-Gray800 font-satoshi">
                            Pricing
                        </a>
                    </li>
                    <li>
                        <a
                            href=""
                            className="hover:text-gray-600 text-Gray800 font-satoshi">
                            Help
                        </a>
                    </li>
                    <li>
                        <a
                            href=""
                            className="hover:text-gray-600 text-Gray800 font-satoshi">
                            Resources
                        </a>
                    </li>
                </ul>

                <button
                onClick={handleGenerate}
                    type="submit"
                    className="flex justify-center gap-2 items-center shadow-xl text-[1.2vw] font-satoshi bg-gray-50 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-Gray800 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group">
                    Generate
                    <svg
                        className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
                        viewBox="0 0 16 19"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                            className="fill-gray-800 group-hover:fill-gray-800"/>
                    </svg>
                </button>

            </div>

            {/* Mobile Overlay Menu */}
            <div
                className={`mobile-menu ${
                isOpen
                    ? "slide-in"
                    : "slide-out"} fixed inset-0 text-Gray800 flex flex-col items-center justify-center z-50 md:hidden`}>
                <button
                    onClick={toggleMenu}
                    className="absolute top-5 right-5 outline-none border-none bg-transparent w-[10vw] h-[10vw] text-Gray800 flex justify-center items-center">
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                <ul className="space-y-8 text-2xl font-semibold">
                    <li>
                        <a
                            href="#home"
                            className="hover:text-green-500 font-satoshi"
                            onClick={toggleMenu}>
                            Home
                        </a>
                    </li>
                    <li>
                        <a
                            href="#about"
                            className="hover:text-green-500 font-satoshi"
                            onClick={toggleMenu}>
                            About
                        </a>
                    </li>
                    <li>
                        <a
                            href="#projects"
                            className="hover:text-green-500 font-satoshi"
                            onClick={toggleMenu}>
                            Projects
                        </a>
                    </li>
                    <li>
                        <a
                            href="#contact"
                            className="hover:text-green-500 font-satoshi"
                            onClick={toggleMenu}>
                            Contact
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
