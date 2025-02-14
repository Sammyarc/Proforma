import Features from "../components/Features/Features"
import Hero from "../components/Hero/Hero"
import HowItWorks from "../components/How/HowItWorks"
import Navbar from "../components/Navbar/Navbar"
import Pricing from "../components/Pricing/Pricing"
import FaQ from "../components/FaQ/FaQ"
import Testimonial from "../components/Testimonials/Testimonial"
import Footer from "../components/Footer/Footer"


const Home = () => {
  return (
    <div>
    <Navbar />
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FaQ />
      <Testimonial />
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
  )
}

export default Home