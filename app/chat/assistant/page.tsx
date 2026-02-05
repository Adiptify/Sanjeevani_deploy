'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickActions?: string[];
  doctorRecommendation?: {
    name: string;
    specialization: string;
    reason: string;
  };
}

export default function AIHealthAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initial greeting
    setMessages([{
      id: '1',
      text: "Hello! 👋 I'm your AI Health Assistant. I'm here to help you with health information, symptom checks, and connecting you with the right doctors. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      quickActions: ['Check Symptoms', 'Find a Doctor', 'Book Appointment', 'Health Tips']
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = async (userMessage: string) => {
    setIsTyping(true);

    const botMessageId = Date.now().toString();
    const newBotMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newBotMessage]);

    try {
      const apiMessages = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      apiMessages.push({ role: 'user', content: userMessage });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader found');

      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages(prev => prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
        ));
      }

    } catch (error: any) {
      console.error('Error fetching bot response:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId ? {
          ...msg,
          text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later."
        } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    simulateBotResponse(currentInput);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    handleSend();
  };

  const handleBookDoctor = (doctorName: string) => {
    router.push('/appointments/book?fromAI=true&doctor=' + encodeURIComponent(doctorName));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl text-white font-bold" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              AI Health Assistant
            </h1>
            <p className="text-white text-sm opacity-90">24/7 Medical Support</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Online</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 font-semibold">AI Assistant</span>
                  </div>
                )}

                <div className={`${message.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-3xl rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-3xl rounded-tl-none shadow-lg'
                  } px-6 py-4 overflow-hidden`}>
                  <div className="prose prose-sm max-w-none prose-teal">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 rounded-xl border border-teal-100 shadow-sm">
                            <table className="min-w-full divide-y divide-teal-100 italic-normal">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-teal-50">{children}</thead>,
                        th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider border-b border-teal-100">{children}</th>,
                        td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-600 border-b border-teal-50">{children}</td>,
                        tr: ({ children }) => <tr className="hover:bg-teal-50/30 transition-colors last:border-0">{children}</tr>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs mt-2 opacity-60">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Doctor Recommendation Card */}
                {message.doctorRecommendation && (
                  <div className="mt-4 bg-white rounded-2xl p-4 shadow-lg border-2 border-teal-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">👨‍⚕️ Recommended Doctor:</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{message.doctorRecommendation.name}</p>
                        <p className="text-sm text-teal-600">{message.doctorRecommendation.specialization}</p>
                        <p className="text-xs text-gray-600 mt-1 italic">{message.doctorRecommendation.reason}</p>
                      </div>
                      <button
                        onClick={() => handleBookDoctor(message.doctorRecommendation!.name)}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons */}
                {message.quickActions && message.quickActions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(action)}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold border border-teal-200 transition-all"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-3xl rounded-tl-none shadow-lg px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t-4 border-teal-500 px-6 py-4 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          {/* Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded-r-xl">
            <p className="text-xs text-yellow-800 italic">
              💡 This AI provides general health information. Always consult a healthcare professional for medical advice.
            </p>
          </div>

          {/* Input Field */}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your health question..."
              className="flex-1 bg-gray-100 border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              style={{ fontStyle: 'italic' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all ${input.trim()
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
