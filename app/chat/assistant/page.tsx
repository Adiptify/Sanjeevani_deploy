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

  const simulateBotResponse = async (userMessage: string, currentHistory: Message[]) => {
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
      const apiMessages = currentHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      console.log('Fetching AI response with body:', {
        messages: apiMessages,
        message: userMessage,
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          message: userMessage,
        }),
      });

      console.log('Response received, status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to get AI response';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader found');

      const decoder = new TextDecoder();
      let accumulatedText = "";
      let chunkIndex = 0;

      while (true) {
        const { done, value } = await reader.read();
        console.log(`Chunk ${chunkIndex} received. Done: ${done}`);
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        chunkIndex++;

        setMessages(prev => prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
        ));
      }
      console.log('Stream reading complete. Total chunks:', chunkIndex);

    } catch (error: any) {
      console.error('Error fetching bot response:', error);
      // Only show error if we haven't received any content, otherwise append it
      setMessages(prev => prev.map(msg => {
        if (msg.id === botMessageId) {
          const errorText = `\n\n⚠️ **Connection Issue:** ${error.message || "I'm having trouble connecting. Please try again."}`;
          return {
            ...msg,
            text: msg.text ? msg.text + errorText : errorText
          };
        }
        return msg;
      }));
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

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      const currentInput = input;
      setInput('');
      // Trigger API call with the updated list (excluding currentInput which is passed separately)
      simulateBotResponse(currentInput, prev);
      return newMessages;
    });
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
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-2xl ${message.sender === 'user' ? 'order-2' : 'order-1'} group`}>
                {message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2 opacity-0 animate-in fade-in fill-mode-forwards delay-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Sanjeevni AI</span>
                  </div>
                )}

                <div className={`${message.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-3xl rounded-tr-none shadow-md'
                  : 'bg-white text-gray-800 rounded-3xl rounded-tl-none shadow-xl border border-teal-50/50'
                  } px-6 py-4 overflow-hidden transition-all duration-300 hover:shadow-2xl`}>
                  <div className="prose prose-sm max-w-none prose-teal leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6 rounded-2xl border border-teal-100 shadow-md bg-white">
                            <table className="min-w-full divide-y divide-teal-100 table-auto">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">{children}</thead>,
                        th: ({ children }) => (
                          <th className="px-5 py-4 text-left text-xs font-bold text-teal-800 uppercase tracking-widest border-b border-teal-100">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-5 py-4 text-sm text-gray-700 border-b border-teal-50 transition-colors hover:bg-teal-50/20">
                            {children}
                          </td>
                        ),
                        tr: ({ children }) => <tr className="hover:bg-teal-50/10 transition-colors last:border-0">{children}</tr>,
                        ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="pl-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold text-teal-900 mb-4 mt-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold text-teal-800 mb-3 mt-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold text-teal-700 mb-2 mt-2">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-teal-500 pl-4 py-2 italic bg-teal-50/50 rounded-r-lg my-4 text-teal-800">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md font-mono text-sm border border-teal-100">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-4 shadow-inner font-mono text-sm leading-relaxed border border-gray-800">
                            {children}
                          </pre>
                        ),
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
              id="chat-input"
              name="chat-input"
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
