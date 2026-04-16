import { steps } from '../data/homeData'
import { useEffect, useState, useRef } from 'react'

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="max-w-7xl mx-auto px-4 py-20 overflow-hidden">
      <h2 className={`text-white text-4xl font-bold text-center mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        Как это работает
      </h2>
      <p className={`text-white/70 text-lg text-center max-w-2xl mx-auto mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        Всего 4 простых шага до увлекательных занятий
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Соединительная линия */}
        <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0">
          <div className={`h-full bg-gradient-to-r from-violet-400 to-indigo-400 transition-all duration-1000 ${isVisible ? 'w-full' : 'w-0'}`} />
        </div>

        {steps.map((step, index) => (
          <div 
            key={step.title} 
            className={`text-center group relative transition-all duration-700 ${isVisible ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-sm border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:border-violet-400 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300">
              <span className="text-white text-3xl font-bold group-hover:text-violet-300 group-hover:scale-110 transition-all">
                {index + 1}
              </span>
            </div>
            <h4 className="text-white text-lg font-semibold mb-2 group-hover:text-violet-300 transition-colors">
              {step.title}
            </h4>
            <p className="text-white/60 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}