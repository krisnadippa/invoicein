import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Capabilities from "./components/Capabilities";
import Footer from "./components/Footer";
import SmoothScrollProvider from "./components/SmoothScrollProvider";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', overflowX: 'hidden' }}>
        <Navbar />
        
        {/* Pinned Sticky Hero Section */}
        <Hero />
        
        {/* The White Card Curtain that Rises Up Over the Hero on Scroll */}
        <div className="home-main-sheet">
          <Features />
          <Capabilities />
        </div>

        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
