/**
 * Main App Component
 * Root component that renders the complete PetShop landing page
 * Organizes all sections in a logical flow from top to bottom
 */

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Partners from './components/Partners'
import Features from './components/Features'
import Testimonials from './components/Testimonials'
import Video from './components/Video'
import ContactUs from './components/ContactUs'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className='main'>
      <Navbar />

      <Hero />

      <Video />

      <Partners />

      <Features />

      <Testimonials />

      <ContactUs />

      <Footer />
      
    </div>
  )
}

export default App