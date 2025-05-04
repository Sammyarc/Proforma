import { HiArrowRight } from "react-icons/hi";
import Customize from "../../assets/Videos/customize invoice.mp4";
import Generate from "../../assets/Videos/review and generate.mp4";
import Send from "../../assets/Videos/Send Invoice.mp4";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: "Customize Your Invoice",
      description:
        "Input your business details, add line items, set payment terms, and customize " +
        "the design to match your brand identity.",
      videoSrc: Customize,
    },
    {
      id: 2,
      title: "Review and Generate",
      description:
        "Preview your invoice, make any necessary adjustments, add notes or terms, and " +
        "generate a professional PDF with one click.",
      videoSrc: Generate,
    },
    {
      id: 3,
      title: "Send to Client",
      description:
        "Automatically email the invoice to your client, track when they view it, and r" +
        "eceive notifications when payment is made.",
      videoSrc: Send,
    },
  ];

  const handleGenerate = () => {
    navigate("/signup");
  };

  return (
    <section className="py-10 px-[4vw] relative overflow-hidden md:py-16 md:px-0">
      <h2 className="text-center text-[8vw] font-bold mb-[6vw] font-satoshi md:text-[3vw]">
        How It Works
      </h2>
      <div>
        <div className="flex flex-col space-y-16 md:space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col ${
                index % 2 !== 0
                  ? "md:flex-row-reverse md:ml-[10vw]"
                  : "md:flex-row md:mr-[10vw]"
              } items-center gap-[5vw]`}
            >
              <div
                className='w-full md:w-1/2 md:h-[25vw] overflow-hidden shadow-2xl'
              >
                <video
                  src={step.videoSrc}
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => {
                    e.currentTarget.play();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                  className="w-full h-full object-cover md:w-[90vw]"
                />
              </div>

              <div className="w-full md:w-1/2 text-left">
                <div className="relative text-gray-600 border-b border-gray-600 w-32">
                  <span className="text-[9vw] font-satoshi md:text-[4vw]">
                    0
                  </span>
                  <span className="absolute text-[8vw] top-[4vw] font-clash md:text-[3.5vw] md:top-[2vw]">
                    {step.id}
                  </span>
                </div>

                <h3 className="font-bold text-[5vw] mb-1 mt-[1vw] font-clash md:text-[2vw]">
                  {step.title}
                </h3>
                <p className="text-gray-800 font-satoshi mb-4">
                  {step.description}
                </p>
                <button
                  onClick={handleGenerate}
                  className="px-[4vw] py-[2vw] flex gap-[1.2vw] items-center font-satoshi font-bold border border-neutral-500 rounded-3xl box md:px-[1.5vw] md:py-[0.5vw] md:gap-x-[0.5vw]"
                >
                  Learn More
                  <HiArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
