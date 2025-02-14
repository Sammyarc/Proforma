import { FaCheckCircle } from "react-icons/fa";

const HowItWorks = () => {
  return (
    <section className="container mx-auto my-[5vw] md:my-[4vw]">
        <h1 className="text-[5vw] font-bold font-satoshi text-center mb-2 md:text-[3vw]">How Proforma Works</h1>
        <div className="flex items-center justify-between mt-[2vw]">
            <div className="w-45vw flex flex-col mx-auto justify-center">
                <h1 className="text-[4vw] font-bold font-satoshi mb-2 md:text-[1.5vw]">Invoicing made simple, seamless, and stress-free.</h1>
                <ul className="space-y-[1vw] mt-[1vw] px-[0.5vw]">
      <li className="flex items-center space-x-3">
        <FaCheckCircle className="text-Gray800" size={22} />
        <p className="text-gray-700 font-satoshi font-medium">
          Create an account
        </p>
      </li>
      <li className="flex items-center space-x-3">
        <FaCheckCircle className="text-Gray800" size={22} />
        <p className="text-gray-700 font-satoshi font-medium">
          Customize Your Invoice
        </p>
      </li>
      <li className="flex items-center space-x-3">
        <FaCheckCircle className="text-Gray800" size={22} />
        <p className="text-gray-700 font-satoshi font-medium">
          Send and Track Payments
        </p>
      </li>
    </ul>
            </div>
            <div className="w-[35vw] h-[40vw]">
            <video
  autoPlay 
  loop 
  muted 
  playsInline 
  className="w-full h-full object-cover"
>
  <source src="https://res.cloudinary.com/diwj3q9hg/video/upload/v1734769414/Proforma_Login_Guide_fbj6ws.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

            </div>
        </div>
    </section>
  )
}

export default HowItWorks