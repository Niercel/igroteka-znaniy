import { advantages } from '../data/homeData'

export default function AdvantagesList() {
  return (
    <ul className="space-y-5">
      {advantages.map((adv, index) => (
        <li 
          key={adv.title} 
          className="flex gap-4 group cursor-default"
          style={{ 
            opacity: 0,
            animation: `slide-up 0.5s ease-out ${index * 100}ms forwards` 
          }}
        >
          <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-green-500/40 group-hover:scale-110 transition-all">
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="text-white text-lg font-medium mb-1 group-hover:text-green-300 transition-colors">{adv.title}</h4>
            <p className="text-white/60 text-sm leading-relaxed">{adv.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}