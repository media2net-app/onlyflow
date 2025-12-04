import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('demo@onlyflow.com')
  const [password, setPassword] = useState('test')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simple check: password is 'test' for demo purposes
    if (password === 'test') {
      navigate('/dashboard')
    } else {
      alert('Invalid credentials. Try password: test')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OnlyFlow</h1>
          <p className="text-gray-400 text-lg">Automate Your Success</p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-surface rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Join the Flow
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-dark-surface shadow-lg shadow-purple-600/20"
            >
              Log In
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Demo: Use password "test" to login
        </p>
      </div>
    </div>
  )
}

export default Login

