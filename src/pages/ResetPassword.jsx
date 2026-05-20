import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/config'
import { ArrowLeft, Mail, Send } from 'lucide-react'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Письмо для сброса пароля отправлено на указанный email.')
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Пользователь с таким email не найден.')
          break
        case 'auth/invalid-email':
          setError('Неверный формат email.')
          break
        default:
          setError('Произошла ошибка. Попробуйте позже.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Забыли пароль?</h1>
          <p className="text-gray-500 text-sm">Введите email, и мы пришлём ссылку для сброса</p>
        </div>

        {message && (
          <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-3 mb-4 text-emerald-700 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-rose-100 border border-rose-200 rounded-xl p-3 mb-4 text-rose-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1.5 font-medium">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 transition-all"
                placeholder="example@mail.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Отправить
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  )
}