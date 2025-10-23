import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Hero from '@/components/Hero';
const LandingPage = ({
  onNavigate
}) => {
  return <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">TijaniUkay.Connect</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')} className="text-sm">
              Login
            </Button>
            <Button size="sm" onClick={() => onNavigate('register')} className="bg-green-600 hover:bg-green-700 text-sm">
              Register
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <Hero onNavigate={onNavigate} />

        <section className="py-12 px-4 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Are You A Resident?</h2>
            <p className="text-base text-green-100 mb-6">
              Register Now Because Home Is More Than a Place
            </p>
            <Button size="sm" onClick={() => onNavigate('register')} className="bg-white text-green-700 hover:bg-green-50 text-sm px-4 py-2">
              Create Account
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-4 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-xs">© 2025 Tijani Ukay Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>;
};
export default LandingPage;