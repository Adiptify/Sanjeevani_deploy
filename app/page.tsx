'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function Home() {
  const router = useRouter()
  const featuresRef = useRef<HTMLDivElement>(null)
  const animationData = require('../public/online-doctor.json')
  const [showJourneyModal, setShowJourneyModal] = useState(false)
  const [showAIPreview, setShowAIPreview] = useState(false)

  // Chat States for Preview
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'ai', text: "Hello! I'm the Sanjeevni AI Preview. Ask me anything about health, symptoms, or our services!" }
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

      // Add a placeholder message for the AI
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
      setChatMessages(prev => {
        const lastMsg = prev[prev.length - 1]
        if (lastMsg?.sender === 'ai') {
          const newMsgs = [...prev]
          newMsgs[newMsgs.length - 1].text += (lastMsg.text ? '\n\n' : '') + "⚠️ Connection Issue. Please try again later."
          return newMsgs
        }
        return [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]
      })
    } finally {
      setIsTyping(false)
    }
  }

  const scrollFeatures = (direction: 'left' | 'right') => {
    if (featuresRef.current) {
      const scrollAmount = 400
      featuresRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      title: 'AI-Powered Healthcare',
      description: 'Instant health support with advanced AI technology'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
      title: 'Smart Health Records',
      description: 'Access your medical records anytime, anywhere'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      title: 'Expert Consultation',
      description: 'Connect with healthcare professionals instantly'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      ),
      title: '24/7 Availability',
      description: 'Healthcare support available round the clock'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      ),
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected'
    }
  ]

  const reviews = [
    {
      name: 'Priya Sharma',
      role: 'Patient',
      rating: 5,
      comment: 'Sanjeevni AI has transformed how I manage my health. The AI chatbot is incredibly helpful and the doctors are very professional.',
      avatar: 'PS'
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Cardiologist',
      rating: 5,
      comment: 'As a doctor, this platform makes it easy to connect with patients and provide quality care remotely. Highly recommended!',
      avatar: 'RK'
    },
    {
      name: 'Anita Desai',
      role: 'NGO Coordinator',
      rating: 5,
      comment: 'The perfect solution for our community healthcare initiatives. Easy to use and very effective in reaching underserved areas.',
      avatar: 'AD'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSequence1 {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSequence2 {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSequence3 {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        .animate-sequence-1 {
          animation: fadeInSequence1 0.8s ease-out 0.2s both;
        }
        .animate-sequence-2 {
          animation: fadeInSequence2 0.8s ease-out 0.4s both;
        }
        .animate-sequence-3 {
          animation: fadeInSequence3 0.8s ease-out 0.6s both;
        }
        .button-elevation {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .button-elevation:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(20, 184, 166, 0.25);
        }
      `}} />

      {/* Journey Selection Modal */}
      {showJourneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative"
            style={{
              animation: 'fadeInUp 0.4s ease-out'
            }}
          >
            <button
              onClick={() => setShowJourneyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                Begin Your Health Journey
              </h3>
              <p className="text-gray-600">Choose your path to personalized healthcare</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Patient Path */}
              <button
                onClick={() => {
                  localStorage.setItem('selectedRole', 'Patient')
                  router.push('/signup/patient')
                }}
                className="group relative overflow-hidden rounded-2xl p-6 border-2 border-teal-200 hover:border-teal-500 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)'
                }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">I'm a Patient</h4>
                    <p className="text-sm text-gray-600">Check health, book doctors, track wellness</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-teal-600 font-semibold text-sm flex items-center gap-1">
                      Start Assessment
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </button>

              {/* Doctor Path */}
              <button
                onClick={() => {
                  localStorage.setItem('selectedRole', 'Doctor')
                  router.push('/signup/doctor')
                }}
                className="group relative overflow-hidden rounded-2xl p-6 border-2 border-cyan-200 hover:border-cyan-500 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)'
                }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">I'm a Doctor</h4>
                    <p className="text-sm text-gray-600">Manage patients, consultations, prescriptions</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-cyan-600 font-semibold text-sm flex items-center gap-1">
                      Enter Portal
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </button>

              {/* NGO Path */}
              <button
                onClick={() => {
                  localStorage.setItem('selectedRole', 'NGO')
                  router.push('/signup/ngo')
                }}
                className="group relative overflow-hidden rounded-2xl p-6 border-2 border-emerald-200 hover:border-emerald-500 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)'
                }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">I'm an NGO</h4>
                    <p className="text-sm text-gray-600">Coordinate health camps, track beneficiaries</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-emerald-600 font-semibold text-sm flex items-center gap-1">
                      Access Platform
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 font-semibold hover:text-teal-700">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="text-lg font-bold text-gray-900">Sanjeevni AI Preview</h3>
                  <p className="text-xs text-gray-500">Experience our health intelligence</p>
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
                          ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1 mb-2">{children}</ol>,
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
                id="ai-preview-input"
                name="ai-preview-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about a symptom or health topic..."
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

            <p className="text-[10px] text-gray-400 text-center mt-4">
              Preview mode: Sign up to save your chat history and connect with doctors.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{
        background: 'radial-gradient(ellipse at top, rgba(20, 184, 166, 0.12) 0%, rgba(255, 255, 255, 0.98) 40%, rgba(255, 255, 255, 1) 100%)'
      }}>
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="text-center md:text-left space-y-6">
            {/* Primary Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 animate-sequence-1" style={{ fontFamily: 'Georgia, serif' }}>
                Sanjeevni AI
              </h1>
              <h2 className="text-2xl md:text-3xl text-teal-700 animate-sequence-2" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 500 }}>
                AI-Powered Personal Health Monitoring & Doctor Access
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl animate-sequence-3">
                Experience intelligent healthcare that understands you—certified doctors, secure records, and AI guidance at your fingertips.
              </p>
            </div>

            {/* Enhanced Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-sequence-3">
              <button
                onClick={() => setShowJourneyModal(true)}
                className="button-elevation bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-lg font-semibold py-4 px-8 rounded-xl shadow-lg inline-flex items-center justify-center group"
              >
                Start Your Journey
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
              <button
                onClick={() => setShowAIPreview(true)}
                className="button-elevation text-teal-700 text-lg font-semibold py-4 px-8 rounded-xl border-2 border-teal-300 hover:border-teal-500 inline-flex items-center justify-center group"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
              >
                Talk to AI Assistant
                <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </button>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 animate-sequence-3">
              <div className="flex flex-col items-center md:items-start group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 mb-1">Certified</span>
                <p className="text-xs text-teal-600">Doctors</p>
              </div>
              <div className="flex flex-col items-center md:items-start group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 mb-1">Secure</span>
                <p className="text-xs text-teal-600">Health Data</p>
              </div>
              <div className="flex flex-col items-center md:items-start group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 mb-1">AI-Assisted</span>
                <p className="text-xs text-teal-600">Insights</p>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Lottie Animation */}
          <div className="flex items-center justify-center">
            <div
              className="w-full max-w-2xl rounded-3xl p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '2px solid rgba(20, 184, 166, 0.25)',
                boxShadow: '0 12px 40px rgba(20, 184, 166, 0.15)',
                animation: 'floatAnimation 6s ease-in-out infinite'
              }}
            >
              <Lottie
                animationData={animationData}
                loop={true}
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'saturate(0.85)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Keyframe Animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes floatAnimation {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 px-4 bg-gradient-to-b from-white via-teal-50/30 to-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #14b8a6 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header with system explanation */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Our Features
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              Discover what makes Sanjeevni AI special
            </p>
            <p className="text-teal-600 italic text-sm max-w-2xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
              An integrated healthcare ecosystem where AI diagnostics, secure records, and expert consultation work seamlessly together
            </p>
          </div>

          {/* Feature tabs navigation */}
          <div className="flex justify-center mb-12 gap-3 flex-wrap">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => {
                  const element = document.getElementById(`feature-${index}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${index === 0
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white/60 text-teal-700 hover:bg-teal-50 border border-teal-200/50'
                  }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Features showcase with central narrative */}
          <div
            ref={featuresRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                id={`feature-${index}`}
                className="group relative snap-center min-w-[380px] transition-all duration-500"
              >
                {/* Glassmorphism card */}
                <div
                  className="relative rounded-3xl p-8 backdrop-blur-xl bg-white/70 border border-teal-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(224,247,250,0.6) 100%)',
                    boxShadow: '0 8px 32px rgba(20,184,166,0.08)'
                  }}
                >
                  {/* Gradient border effect */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(6,182,212,0.2) 100%)',
                      padding: '2px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />

                  {/* Icon with subtle animation */}
                  <div className="relative mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(178,235,242,0.12) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                        {feature.icon}
                      </div>
                    </div>
                    {/* Indicator dot for active feature */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-2xl font-bold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-teal-700"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Expandable use case - appears on hover */}
                  <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-24">
                    <div className="pt-4 border-t border-teal-100/50 mt-2">
                      <p className="text-sm text-teal-700 italic" style={{ fontFamily: 'Georgia, serif' }}>
                        {index === 0 && "Used during doctor consultations and NGO health camps for instant symptom analysis"}
                        {index === 1 && "Seamlessly integrated across all touchpoints—appointments, prescriptions, and follow-ups"}
                        {index === 2 && "Connecting patients with verified healthcare professionals in under 2 minutes"}
                        {index === 3 && "Ensuring continuous care with automated reminders and instant emergency support"}
                        {index === 4 && "Bank-grade encryption protecting sensitive health information across all transactions"}
                      </p>
                    </div>
                  </div>

                  {/* Subtle elevation indicator */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const element = document.getElementById(`feature-${index}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className="w-2 h-2 rounded-full bg-teal-200 hover:bg-teal-400 transition-all duration-300"
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Keyframe animations */}
        <style jsx>{`
          @keyframes fadeInElevate {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">About Us</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Sanjeevni AI is revolutionizing healthcare accessibility through cutting-edge artificial intelligence
              and seamless digital experiences. Our mission is to make quality healthcare available to everyone, everywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">10K+</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Active Users</h3>
              <p className="text-gray-600">Trusted by thousands of patients</p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">500+</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Medical Experts</h3>
              <p className="text-gray-600">Qualified doctors ready to help</p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">24/7</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Support Available</h3>
              <p className="text-gray-600">Always here when you need us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 text-lg">Real experiences from real people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{review.name}</h4>
                    <p className="text-sm text-gray-600">{review.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 italic">&ldquo;{review.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Company Details */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-teal-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="caveat text-2xl font-bold">Sanjeevni AI</h3>
              </div>
              <p className="text-gray-400 text-sm">Your trusted healthcare companion powered by AI</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/roles" className="hover:text-teal-400 transition-colors">Get Started</Link></li>
                <li><Link href="/login" className="hover:text-teal-400 transition-colors">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Health Chatbot</li>
                <li>Doctor Consultation</li>
                <li>Health Records</li>
                <li>Medicine Matrix</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: support@sanjeevniai.com</li>
                <li>Phone: +91 1800-XXX-XXXX</li>
                <li>Address: Mumbai, India</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Sanjeevni AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
