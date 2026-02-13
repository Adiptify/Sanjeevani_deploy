'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('User')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [showAIPreview, setShowAIPreview] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'ai', text: "Hello! I'm Sanjeevni AI. How can I help you today?" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMsg = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          messages: chatMessages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      })

      if (!response.ok) throw new Error('API failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader found')

      const decoder = new TextDecoder()
      let accumulatedText = ''

      setChatMessages(prev => [...prev, { sender: 'ai', text: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        accumulatedText += decoder.decode(value, { stream: true })

        setChatMessages(prev => {
          const newMsgs = [...prev]
          if (newMsgs.length > 0) {
            newMsgs[newMsgs.length - 1].text = accumulatedText
          }
          return newMsgs
        })
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "⚠️ Connection Issue. Please try again later." }])
    } finally {
      setIsTyping(false)
    }
  }


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

      {/* AI Preview Assistant Button */}
      <button
        onClick={() => setShowAIPreview(true)}
        className="fixed bottom-8 right-8 bg-teal-600 text-white p-4 rounded-full shadow-2xl hover:bg-teal-700 transform hover:scale-110 transition-all duration-300 z-40 group"
      >
        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </button>

      {/* AI Preview Panel */}
      {showAIPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div
            className="bg-white rounded-t-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col"
            style={{
              animation: 'fadeInUp 0.4s ease-out',
              maxHeight: '80vh'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sanjeevni AI Support</h3>
                  <p className="text-xs text-gray-500">Need help logging in?</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm ${msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-teal-50 text-gray-800 border border-teal-100 rounded-tl-none'
                    }`}>
                    <div className="prose prose-sm max-w-none prose-teal leading-relaxed whitespace-pre-wrap">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4 rounded-xl border border-teal-100 shadow-sm bg-white">
                              <table className="min-w-full divide-y divide-teal-100 table-auto">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-teal-50">{children}</thead>,
                          th: ({ children }) => <th className="px-4 py-2 text-left text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-teal-100">{children}</th>,
                          td: ({ children }) => <td className="px-4 py-2 text-sm text-gray-700 border-b border-teal-50">{children}</td>,
                          tr: ({ children }) => <tr className="hover:bg-teal-50/50 transition-colors">{children}</tr>,
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-gray-100 text-gray-400 p-3 rounded-2xl rounded-tl-none text-xs italic">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
              <input
                id="ai-login-input"
                name="ai-login-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="How can I help you today?"
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 py-3"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isTyping}
                className="bg-teal-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>

  )
}
