import {useState} from "react";
import {HiArrowRight, HiOutlineMenuAlt3} from "react-icons/hi";
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
        <nav className="text-Gray800 bg-[#F5F5F2] fixed top-0 left-0 w-full z-[20]">
            <div
                className="container mx-auto flex items-center justify-between p-3 my-[0.1vw]">
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
                            Contact
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
                    className="px-[1.5vw] py-[0.5vw] flex gap-x-[0.5vw] items-center font-satoshi font-bold border border-neutral-500 rounded-3xl box">
                    Generate
                    <HiArrowRight size={18}/>
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
                            href=""
                            className="font-satoshi"
                            onClick={toggleMenu}>
                            Home
                        </a>
                    </li>
                    <li>
                        <a
                            href=""
                            className="font-satoshi"
                            onClick={toggleMenu}>
                            About
                        </a>
                    </li>
                    <li>
                        <a
                            href=""
                            className="font-satoshi"
                            onClick={toggleMenu}>
                            Projects
                        </a>
                    </li>
                    <li>
                        <a
                            href=""
                            className="font-satoshi"
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
