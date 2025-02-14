import Logo from "../../assets/Images/P-removebg-preview.png";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter, FaLinkedin } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";

const Footer = () => {
    return (
      <footer className="py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-start">
            {/* About Section */}
            <div>
             <a href="#" className="flex items-center">
                                     <img
                                         src={Logo}
                                         alt='Profoma Logo'
                                         className='w-[10vw] h-[3vw] md:w-[5vw] md:h-[5vw]'/>
                                     <span className='font-clash text-[4vw] text-black md:text-[1.5vw]'>Proforma</span>
                                 </a>
              <p className="text-[4vw] w-[40ch] leading-relaxed font-satoshi md:text-[1vw]">
                Our invoice generator app simplifies the way businesses and freelancers manage their billing needs. Create, send, and manage professional invoices seamlessly.
              </p>
            </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-[6vw]">
    {/* Quick Links */}
    <div>
              <h3 className="text-lg font-bold font-satoshi mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-Gray800 font-satoshi text-[4vw] transition-colors md:text-[1vw]">Features</a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-Gray800 font-satoshi text-[4vw] transition-colors md:text-[1vw]">Pricing</a>
                </li>
                <li>
                  <a href="#support" className="hover:text-Gray800 font-satoshi text-[4vw] transition-colors md:text-[1vw]">Support</a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-Gray800 font-satoshi text-[4vw] transition-colors md:text-[1vw]">Contact Us</a>
                </li>
              </ul>
            </div>
  
            {/* Social Media Section */}
            <div>
              <h3 className="text-lg font-satoshi font-bold mb-4">Socials</h3>
              <div className="flex flex-col space-y-4">
                <a
                  href="#"
                  className="hover:text-Gray800 transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebookF  size={18}/>
                </a>
                <a
                  href="#"
                  className="hover:text-Gray800 transition-colors"
                  aria-label="Twitter"
                >
                  <FaXTwitter  size={18}/>
                </a>
                <a
                  href="#"
                  className="hover:text-Gray800 transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin  size={18}/>
                </a>
                <a
                  href="#"
                  className="hover:text-Gray800 transition-colors"
                  aria-label="Instagram"
                >
                  <IoLogoInstagram  size={18}/>
                </a>
              </div>
            </div>
  </div>
            
          </div>
  
          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center font-satoshi text-base">
            <p>&copy; {new Date().getFullYear()} Proforma. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  