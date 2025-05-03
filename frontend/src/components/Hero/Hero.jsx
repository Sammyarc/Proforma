import HeroImage from "../../assets/Images/proforma-dashboard.jpg";
import HeroRating from "../Ratings/HeroRating";
import {IoPlaySkipForwardSharp} from "react-icons/io5";

const Hero = () => {

    return (
        <section
            className="relative px-[2vw] pt-[28vw] pb-[10vw] text-center md:pt-[12vw] md:pb-[4vw]">

            {/* Grid Background */}
            <div
                className="absolute inset-0 -z-10 pointer-events-none"
                style={{
                    backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.09) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.09) 1px, transparent 1px)
            `,
                    backgroundSize: '50px 50px'
                }}/> {/* Content Wrapper with Higher Z-index */}
            <div className="relative z-10 flex flex-col justify-center items-center">
                <div
                    className="w-[95vw] h-[9vw] flex justify-center items-center bg-[#F5F5F5] border border-gray-600 box rounded-3xl text-[4vw] text-Gray800 font-medium font-satoshi md:text-[1vw] md:w-[25vw] md:h-[2.5vw] md:rounded-full">
                    <span>Your Personalized AI Enhanced Invoice Generator</span>
                </div>
                <h1
                    className="font-satoshi text-left text-[9vw] mt-[3vw] font-extrabold text-Gray800 md:mt-[1vw] md:text-[3.5vw] md:text-center">
                    Create invoices in seconds, get paid faster
                </h1>
                <p
                    className="text-Gray800 text-left text-[4vw] font-satoshi mt-[3vw] md:mt-[0.5vw] md:text-[1.3vw] md:max-w-[55vw] md:text-center">
                    Streamline your billing process with Proforma, create professional, customizable invoices in seconds, automate
                    repetitive tasks, and ensure faster payments.
                </p>

                <div className="my-[6vw] md:my-[1.5vw]">
                    <button
                        type="submit"
                        className="px-[4vw] py-[2vw] flex gap-[1.6vw] items-center font-satoshi bg-[#F5F5F5] border border-neutral-500 rounded-3xl box md:px-[1.5vw] md:py-[0.5vw] md:gap-x-[0.5vw]">
                        Watch Demo
                        <IoPlaySkipForwardSharp size={20}/>
                    </button>
                </div>
                <HeroRating/>
                <img
                    src={HeroImage}
                    alt="proforma dashboard"
                    className="mt-[6vw] flex justify-center items-center mx-auto border box border-neutral-500 rounded-xl md:rounded-3xl md:w-[80vw] md:mt-[1vw]"/>
            </div>
        </section>

    );
};

export default Hero;
