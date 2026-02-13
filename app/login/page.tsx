'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('User')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedRole = localStorage.getItem('selectedRole') || 'User'
    setRole(savedRole)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('selectedRole', data.user.role === 'Patient' ? 'User' : data.user.role)
      localStorage.setItem('userName', data.user.name)

      // Redirect based on role
      if (data.user.role === 'Doctor') {
        router.push('/dashboard/doctor')
      } else if (data.user.role === 'NGO') {
        router.push('/dashboard/ngo')
      } else {
        router.push('/dashboard/patient')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = () => {
    const savedRole = localStorage.getItem('selectedRole') || 'User'
    if (savedRole === 'User') {
      router.push('/signup/patient')
    } else if (savedRole === 'Doctor') {
      router.push('/signup/doctor')
    } else {
      router.push('/signup/ngo')
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-28 h-28 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h1 className="caveat text-5xl font-bold text-gray-800 mb-2">
          {role === 'User' ? 'Welcome Back' : `Continue as ${role}`}
        </h1>
        <p className="text-gray-600">
          {role === 'User' ? 'Sign in to your account' : 'Sign in to continue'}
        </p>
      </div>

      {/* Login Form */}
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-xl text-sm font-medium animate-fadeIn">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors duration-300"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            <button type="button" className="text-sm font-medium text-teal-600 hover:text-teal-500">Forgot password?</button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Sign In
            <svg className="inline-block w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?
            <button onClick={handleSignUp} className="font-semibold text-teal-600 hover:text-teal-500 ml-1">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  )
}
