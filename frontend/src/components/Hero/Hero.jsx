
import { IoPlaySharp } from "react-icons/io5";
import HeroImage from "../../assets/Images/Proforma-dashboard.png"
import HeroRating from "../Ratings/HeroRating";

const Hero = () => {


    return (
        <section
            className="flex flex-col justify-center items-center mt-[30vw] mb-[10vw] text-center md:mt-[12vw] md:mb-[4vw]">
                <div
                className="w-[90vw] h-[9vw] flex justify-center items-center border border-gray-600 rounded-xl text-[4vw] text-Gray800 font-medium font-satoshi md:text-[1vw] md:w-[25vw] md:h-[2.5vw] md:rounded-full">
                <span>Your Personalized AI Enhanced Invoice Generator</span>
            </div>
            
            <h1
                className="font-satoshi text-[9vw] mt-[3vw] font-extrabold text-Gray800 md:mt-[1vw] md:text-[3.5vw]">
                Create invoices in seconds, get paid faster
            </h1>
            <p
                className="text-Gray800 text-[4vw] font-satoshi mt-[3vw] md:mt-[1vw] md:text-[1.3vw] md:max-w-[40vw]">
                Say goodbye to manual invoicing! Proforma makes billing effortless, so you can focus on growing your business.
            </p>
            
                <button
                    type="submit"
                    className="flex justify-center shadow-xl gap-[1vw] items-center w-[13vw] mt-[6vw] md:mt-[1.5vw] text-[1.2vw] font-satoshi bg-[#fff] isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-Gray800 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-3 py-2 overflow-hidden border-2 rounded-full group">
                    Watch Demo
                    <IoPlaySharp className="w-8 h-8 justify-end group-hover:bg-gray-50 text-Gray800 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2"/>
                </button>
            

            <HeroRating />

            <img src={HeroImage} alt="proforma dashboard" className="mt-[1vw] flex justify-center items-center mx-auto border border-gray-200 rounded-lg md:w-[70vw]"/>

        </section>
    );
};

export default Hero;
