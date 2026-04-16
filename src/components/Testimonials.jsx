import { testimonials } from '../data/homeData'
import { useEffect, useState, useRef } from 'react'

export default function Testimonials() {
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
    <section ref={sectionRef} id="testimonials" className="max-w-7xl mx-auto px-4 py-20">
      <h2 className={`text-white text-4xl font-bold text-center mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        Что говорят родители
      </h2>
      <p className={`text-white/70 text-lg text-center max-w-2xl mx-auto mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        Реальные истории наших пользователей
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, index) => (
          <div
            key={t.name}
            className={`bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover-lift transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {t.avatar}
              </div>
              <div>
                <h4 className="text-white font-medium">{t.name}</h4>
                <p className="text-white/50 text-xs">{t.child}</p>
              </div>
            </div>
            <p className="text-white/80 italic leading-relaxed">
              "{t.text}"
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}