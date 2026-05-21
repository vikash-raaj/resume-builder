import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TemplatesGallery from "../components/landing/TemplatesGallery";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <TemplatesGallery />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
}
