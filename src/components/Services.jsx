import * as LucideIcons from 'lucide-react'
import { services } from '../data/homeData'
import { useEffect, useState, useRef } from 'react'

export default function Services() {
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
    <section ref={sectionRef} id="services" className="bg-white/5 backdrop-blur-md border-y border-white/10 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`text-white text-4xl font-bold text-center mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Направления развития
        </h2>
        <p className={`text-white/70 text-lg text-center max-w-2xl mx-auto mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Комплексная подготовка к школе по всем ключевым направлениям
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = LucideIcons[service.iconName]
            
            return (
              <div
                key={service.title}
                className={`bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover-lift cursor-pointer transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                  {IconComponent && <IconComponent size={32} className="text-white group-hover:scale-110 transition-transform" />}
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}