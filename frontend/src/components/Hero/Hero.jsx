import HeroImage from "../../assets/Images/proforma-dashboard.png";
import HeroRating from "../Ratings/HeroRating";

const Hero = () => {
  return (
    <section className="relative px-[2vw] pt-[28vw] pb-[10vw] text-center md:pt-[15vw] lg:pt-[10vw] lg:pb-[4vw]">
      {/* Grid Background */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.09) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.09) 1px, transparent 1px)
            `,
          backgroundSize: "50px 50px",
        }}
      />{" "}
      {/* Content Wrapper with Higher Z-index */}
      <div className="relative z-10 flex flex-col justify-center items-center">
        <div className="w-[95vw] h-[9vw] flex justify-center items-center bg-[#F5F5F5] border border-gray-600 box rounded-3xl text-[4vw] text-Gray800 font-medium font-satoshi md:text-base md:w-[40vw] md:h-[3.5vw] lg:text-[1vw] lg:w-[25vw] lg:h-[2.5vw] lg:rounded-full">
          <span>Fast and Easy Custom Invoice Generator</span>
        </div>
        <h1 className="font-satoshi text-left text-[9vw] mt-[3vw] font-extrabold text-Gray800 md:text-[4vw] lg:mt-[1vw] lg:text-[3.5vw] lg:text-center">
          Create invoices in seconds, get paid faster
        </h1>
        <p className="text-Gray800 text-left text-[4.5vw] font-satoshi mt-[3vw] md:text-lg md:text-center md:mt-[0.5vw] lg:text-[1.3vw] lg:max-w-[55vw]">
          Streamline your billing process with Proforma, create professional,
          customizable invoices in seconds, automate repetitive tasks, and
          ensure faster payments.
        </p>
        <HeroRating />
        <img
          src={HeroImage}
          alt="proforma dashboard"
          className="mt-[6vw] flex justify-center items-center mx-auto shadow-2xl border border-gray-300 md:mt-[1vw] lg:w-[80vw]"
        />
      </div>
    </section>
  );
};

export default Hero;
