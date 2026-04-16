import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { scrollToTop } from '../utils/scroll'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <button
      className={`fixed bottom-8 right-8 z-50 bg-gradient-to-r from-violet-500 to-indigo-500 text-white p-3 rounded-full shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-110 hover:shadow-violet-500/50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      onClick={scrollToTop}
    >
      <ArrowUp size={24} />
    </button>
  )
}