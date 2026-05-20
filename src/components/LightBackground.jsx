export default function LightBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100" />

      {/* Яркие круги */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-400/50 rounded-full animate-float" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-400/50 rounded-full animate-float animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-blue-400/50 rounded-full animate-float animation-delay-4000" />
      <div className="absolute top-2/3 right-1/3 w-36 h-36 bg-yellow-300/50 rounded-full animate-float animation-delay-1000" />
      <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-green-400/50 rounded-full animate-float animation-delay-3000" />

      {/* Парящие эмодзи */}
      <div className="absolute top-1/4 right-1/4 text-5xl animate-float animation-delay-500">⭐</div>
      <div className="absolute bottom-1/4 left-1/4 text-6xl animate-float animation-delay-2500">🎈</div>
      <div className="absolute top-1/3 left-1/3 text-4xl animate-float animation-delay-1500">🌈</div>
      <div className="absolute bottom-1/3 right-1/3 text-3xl animate-float animation-delay-3500">🦋</div>
    </div>
  )
}