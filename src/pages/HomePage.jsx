import AnimatedBackground from '../components/AnimatedBackground'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Services from '../components/Services'
import HowItWorks from '../components/HowItWorks'
import Advantages from '../components/Advantages'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Header />
      <main className="relative z-10">
        <Hero />
        <Services />
        <HowItWorks />
        <Advantages />
        <Testimonials />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}