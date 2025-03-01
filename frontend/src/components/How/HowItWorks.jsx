import {HiArrowRight} from "react-icons/hi";
import Step1 from "../../assets/Images/proforma-dashboard.jpg"
import {useNavigate} from "react-router-dom";

const HowItWorks = () => {
    const navigate = useNavigate();
    const steps = [
        {
            id: 1,
            title: "Customize Your Invoice",
            description: "Input your business details, add line items, set payment terms, and customize " +
                    "the design to match your brand identity.",
            imageAlt: "Create invoice illustration",
            imageSrc: Step1
        }, {
            id: 2,
            title: "Review and Generate",
            description: "Preview your invoice, make any necessary adjustments, add notes or terms, and " +
                    "generate a professional PDF with one click.",
            imageAlt: "Review invoice illustration",
            imageSrc: Step1
        }, {
            id: 3,
            title: "Send to Client",
            description: "Automatically email the invoice to your client, track when they view it, and r" +
                    "eceive notifications when payment is made.",
            imageAlt: "Send invoice illustration",
            imageSrc: Step1
        }
    ];

    const handleGenerate = () => {
        navigate('/signup');
    };

    return (
        <section className="py-16 relative overflow-hidden">
            <h2 className="text-center text-[4vw] font-bold mb-[6vw] font-satoshi md:text-[3vw]">How It Works</h2>
            <div>
                <div className="flex flex-col space-y-16 md:space-y-24">
                    {
                        steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`flex flex-col ${index % 2 !== 0
                                    ? 'md:flex-row-reverse ml-[10vw]'
                                    : 'md:flex-row mr-[10vw]'} items-center gap-[5vw]`}>
                                <div
                                    className={`w-full md:w-1/2 md:h-[25vw] overflow-hidden border border-neutral-300  ${index % 2 !== 0
                                        ? 'rounded-l-[1vw]'
                                        : 'rounded-r-[1vw]'}`}>
                                    <img
                                        src={step.imageSrc}
                                        className="w-[90vw] h-full object-cover"
                                        alt={step.imageAlt}/>
                                </div>

                                <div className="w-full md:w-1/2 text-left">
                                    <div className="relative text-gray-600 border-b border-gray-600 w-32">
                                        <span className="text-[4vw] font-satoshi">0</span>
                                        <span className="absolute text-[3.5vw] top-[2vw] font-clash">{step.id}</span>
                                    </div>

                                    <h3 className="font-bold text-[4vw] mb-1 mt-[1vw] font-clash md:text-[2vw]">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-800 font-satoshi mb-4">{step.description}</p>
                                    <button
                                        onClick={handleGenerate}
                                        className="px-[1.5vw] py-[0.5vw] flex gap-x-[0.5vw] items-center font-satoshi font-bold border border-neutral-500 rounded-3xl box">
                                        Learn More
                                        <HiArrowRight size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
