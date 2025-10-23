import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
const Hero = ({
  onNavigate
}) => {
  const imageUrl = 'https://horizons-cdn.hostinger.com/cca606f9-2d00-4779-846c-f262007e7aab/db29623518ebfba0681db9f9eeb59958.png';
  return <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: `url(${imageUrl})`
    }} />
      <div className="absolute inset-0 bg-black/50" />
      <motion.div initial={{
      opacity: 0,
      y: 30
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.8
    }} className="max-w-4xl mx-auto text-center relative z-10 p-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">Tijani Ukay Connect</h1>
        <p className="text-base md:text-lg text-gray-200 mb-6 max-w-2xl mx-auto drop-shadow-md">
          Your exclusive digital hub for managing residence activities, booking facilities, and staying connected with our vibrant community.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button size="sm" onClick={() => onNavigate('register')} className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2">
            Get Started
          </Button>
          <Button size="sm" onClick={() => onNavigate('login')} className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2">
            Resident Login
          </Button>
        </div>
      </motion.div>
    </section>;
};
export default Hero;