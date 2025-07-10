import DisclaimerSection from "../components/landing/disclaimer-section";
import HeroSection from "../components/landing/hero-section";
import HowItWorksSection from "../components/landing/how-it-works-section";
import StatsSection from "../components/landing/stats-section";
import ValuePropSection from "../components/landing/value-prop-section";
import Footer from "../components/layout/footer";
import Header from "../components/layout/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ValuePropSection />
        <HowItWorksSection />
        <StatsSection />
        <DisclaimerSection />
      </main>
      <Footer />
    </div>
  );
}
