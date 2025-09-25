import React from 'react'
import Header from '../components/header.jsx'
import Hero from '../components/hero.jsx'
import Footer from '../components/footer.jsx'

function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Footer />
    </div>
  )
}

export default LandingPage