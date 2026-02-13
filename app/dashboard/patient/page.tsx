'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HealthMetric {
  title: string;
  percentage: number;
  status: string;
  color: string;
  icon: JSX.Element;
  chartData: number[];
}

export default function PatientDashboard() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome');
  const [email, setEmail] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [showMedicineSearch, setShowMedicineSearch] = useState(false);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [showPhysicalBreakdown, setShowPhysicalBreakdown] = useState(false);
  const [showMentalPanel, setShowMentalPanel] = useState(false);
  const [showWellnessLayers, setShowWellnessLayers] = useState(false);
  const [expandPhysicalTrend, setExpandPhysicalTrend] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ text: string, sender: 'user' | 'bot' }>>([{ text: "Hello! I'm your Sanjeevni AI Assistant. How can I help you with your health today?", sender: 'bot' }]);
  const [chatInput, setChatInput] = useState('');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'appointments' | 'chatbot' | 'medicine'>('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nearbyDoctors, setNearbyDoctors] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const healthMetrics: HealthMetric[] = [
    {
      title: 'Physical Health',
      percentage: userData?.health?.physicalHealth || 78.2,
      status: (userData?.health?.physicalHealth || 78.2) > 80 ? 'Excellent condition' : 'Steady improvement',
      color: 'from-teal-500 to-teal-600',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      ),
      chartData: userData?.health?.history?.map((h: any) => h.physicalHealth).slice(-7) || [65, 68, 72, 70, 75, 78, 78.2]
    },
    {
      title: 'Mental Health',
      percentage: userData?.health?.mentalHealth || 90.8,
      status: (userData?.health?.mentalHealth || 90.8) > 80 ? 'Very good state' : 'Stable state',
      color: 'from-indigo-500 to-indigo-600',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      ),
      chartData: userData?.health?.history?.map((h: any) => h.mentalHealth).slice(-7) || [82, 85, 87, 88, 89, 90, 90.8]
    },
    {
      title: 'Overall Wellness',
      percentage: userData?.health?.overallWellness || 84.5,
      status: (userData?.health?.overallWellness || 84.5) > 80 ? 'Great progress!' : 'Improving wellness',
      color: 'from-purple-500 to-purple-600',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      chartData: userData?.health?.history?.map((h: any) => h.overallWellness).slice(-7) || [73, 76, 79, 81, 83, 84, 84.5]
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUserData(data);
        setEmail(data.user.email);

        // Fetch parallel data
        const [apptRes, notifyRes, docRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/notifications'),
          fetch(`/api/doctors?location=${data.profile?.city || data.profile?.clinicAddress || ''}`)
        ]);

        if (apptRes.ok) setAppointments(await apptRes.json());
        if (notifyRes.ok) setNotifications(await notifyRes.json());
        if (docRes.ok) setNearbyDoctors(await docRes.json());

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else if (hour >= 17 && hour < 22) setGreeting('Good Evening');
    else setGreeting('Good Night');
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API failed');
    }
    localStorage.clear();
    router.push('/login');
  };

  const callSOS = () => {
    const sosConfirm = confirm(
      '🚨 EMERGENCY SERVICES\n\n📞 Ambulance: 108\n📞 Medical Emergency: 102\n📞 Police: 100\n📞 Fire: 101\n\nClick OK to call 108 (Ambulance)'
    );
    if (sosConfirm) {
      window.location.href = 'tel:108';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    const newUserMessage: { text: string, sender: 'user' | 'bot' } = { text: userMsgText, sender: 'user' };

    // Capture history before update
    const history = chatMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          messages: history
        })
      });

      if (!response.ok) throw new Error('API failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader found');

      const decoder = new TextDecoder();
      let accumulatedText = '';

      // Add placeholder for bot response
      setChatMessages(prev => [...prev, { text: '', sender: 'bot' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        setChatMessages(prev => {
          const newMsgs = [...prev];
          if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].sender === 'bot') {
            newMsgs[newMsgs.length - 1].text = accumulatedText;
          }
          return newMsgs;
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.sender === 'bot') {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text += (lastMsg.text ? '\n\n' : '') + "⚠️ Connection Issue. Please try again later.";
          return newMsgs;
        }
        return [...prev, { text: "I encountered an error. Please try again later.", sender: 'bot' }];
      });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100/30 via-cyan-100/20 to-emerald-50/40" style={{ background: 'linear-gradient(135deg, #d1f2eb 0%, #d0f0ef 25%, #c8ebe9 50%, #bfe5e3 75%, #b8e0dd 100%)' }}>
      {/* Sidebar */}
      <aside id="sidebar" className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl transform -translate-x-full lg:translate-x-0 transition-transform z-50">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-teal-600">🏥 SanjeevniAI</h1>
          <p className="text-sm text-gray-600 mt-1">Healthcare Platform</p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left relative overflow-hidden group cursor-pointer ${activeSection === 'dashboard'
              ? 'bg-teal-50 text-teal-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            {activeSection === 'dashboard' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r"></div>
            )}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSection('appointments')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left relative overflow-hidden group cursor-pointer ${activeSection === 'appointments'
              ? 'bg-teal-50 text-teal-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            {activeSection === 'appointments' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r"></div>
            )}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Appointments</span>
          </button>
          <button
            onClick={() => setActiveSection('chatbot')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left relative overflow-hidden group cursor-pointer ${activeSection === 'chatbot'
              ? 'bg-teal-50 text-teal-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            {activeSection === 'chatbot' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r"></div>
            )}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <span>AI Chatbot</span>
          </button>
          <button
            onClick={() => setActiveSection('medicine')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left relative overflow-hidden group cursor-pointer ${activeSection === 'medicine'
              ? 'bg-teal-50 text-teal-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            {activeSection === 'medicine' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r"></div>
            )}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span>Medicine Matrix</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden" onClick={() => document.getElementById('sidebar')?.classList.toggle('-translate-x-full')}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-teal-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] animate-fadeIn">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    <button className="text-xs text-teal-600 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <p className="text-sm">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-teal-50/30' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-gray-800">{n.title}</span>
                            <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Patient</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-600">{userData?.user?.name || email}</span>
            </div>
          </div>
        </div>

        {/* Conditional Content Based on Active Section */}
        {activeSection === 'dashboard' && (
          <div className="p-8 space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                {greeting}, {userData?.user?.name || email.split('@')[0]}!
              </h1>
              <p className="text-gray-600">Your personalized health sanctuary</p>
            </div>

            {/* Health Matrix - Enhanced Glassmorphism Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => metric.title === 'Physical Health' && setShowPhysicalBreakdown(true)}
                  onMouseLeave={() => metric.title === 'Physical Health' && setShowPhysicalBreakdown(false)}
                  onClick={() => setSelectedMetric(metric)}
                  className="rounded-3xl p-8 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid',
                    borderImage: `linear-gradient(135deg, rgba(20, 184, 166, 0.4), rgba(13, 148, 136, 0.2)) 1`,
                    boxShadow: '0 12px 40px rgba(20, 184, 166, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  ></div>

                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-105"
                      style={{ border: '1.5px solid rgba(20, 184, 166, 0.35)' }}
                    >
                      {metric.icon}
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-800 italic" style={{ fontFamily: 'Georgia, serif' }}>{metric.title}</h3>

                    <div className="relative w-32 h-32 mb-5">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle cx="64" cy="64" r="56" stroke="rgba(20, 184, 166, 0.1)" strokeWidth="8" fill="none" />
                        <circle
                          cx="64" cy="64" r="56"
                          stroke="rgba(20, 184, 166, 0.8)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="351.86"
                          strokeDashoffset={351.86 * (1 - metric.percentage / 100)}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{metric.percentage}%</span>
                      </div>
                    </div>

                    <p className="text-sm text-teal-700 mb-2 font-semibold">{metric.status}</p>
                  </div>

                  {/* Physical Breakdown on Hover */}
                  {metric.title === 'Physical Health' && showPhysicalBreakdown && (
                    <div className="absolute inset-0 bg-teal-700 bg-opacity-95 p-6 flex flex-col justify-center animate-[fadeIn_0.3s_ease-in]">
                      <h4 className="text-xl font-bold mb-4 text-white">Health Factors</h4>
                      <div className="space-y-3 text-sm text-white">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Activity Level</span>
                            <span>85%</span>
                          </div>
                          <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full animate-[slideIn_0.8s_ease-out]" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Sleep Quality</span>
                            <span>72%</span>
                          </div>
                          <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full animate-[slideIn_0.8s_ease-out]" style={{ width: '72%' }}></div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandPhysicalTrend(!expandPhysicalTrend); }}
                        className="mt-4 bg-white text-teal-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-opacity-90 transition-all"
                      >
                        View 7-Day Trend
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Health Metric Modal */}
            {selectedMetric && (
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setSelectedMetric(null)}>
                <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">{selectedMetric.title} Details</h2>
                    <button onClick={() => setSelectedMetric(null)} className="text-gray-500 hover:text-gray-700">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>

                  <div className={`bg-gradient-to-br ${selectedMetric.color} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Current Score</p>
                        <p className="text-5xl font-bold">{selectedMetric.percentage}%</p>
                        <p className="text-lg mt-2">{selectedMetric.status}</p>
                      </div>
                      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        {selectedMetric.icon}
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>7-Day Trend</h3>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-end justify-between h-32 gap-2">
                        {selectedMetric.chartData.map((value, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-lg transition-all hover:opacity-80"
                              style={{ height: `${(value / 100) * 100}%` }}
                            ></div>
                            <p className="text-[10px] text-gray-500 mt-2">D{idx + 1}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setSelectedMetric(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg">Close Details</button>
                </div>
              </div>
            )}

            {/* Nearby Doctors Section - Integrated with real data */}
            <div className="backdrop-blur-xl bg-white bg-opacity-30 rounded-3xl p-8 border border-white border-opacity-40 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 italic" style={{ fontFamily: 'Georgia, serif' }}>Healthcare Near You</h2>
                  <p className="text-gray-600 text-sm">Certified professionals in your region</p>
                </div>
                <button onClick={() => setActiveSection('appointments')} className="text-teal-600 font-semibold hover:underline">View all</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {nearbyDoctors.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center py-10 italic">Searching for doctors in your area...</p>
                ) : (
                  nearbyDoctors.slice(0, 4).map((doc, idx) => (
                    <div key={idx} className="bg-white/60 p-5 rounded-2xl border border-white/40 hover:shadow-lg transition-all transform hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mb-3 shadow-md">
                        {doc.fullName.split(' ').map((n: any) => n[0]).join('')}
                      </div>
                      <h4 className="font-bold text-gray-800">{doc.fullName}</h4>
                      <p className="text-xs text-teal-600 font-semibold mb-2">{doc.specialization}</p>
                      <p className="text-[10px] text-gray-500 mb-4 line-clamp-1">📍 {doc.clinicAddress || doc.city}</p>
                      <button onClick={() => router.push(`/appointments/book?doctor=${doc._id}`)} className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-teal-700 transition-colors">Book Appointment</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={callSOS} className="rounded-3xl p-8 bg-red-50/40 backdrop-blur-xl border border-red-200/50 shadow-xl cursor-pointer hover:bg-red-50/60 transition-all group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-red-300 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-800 italic" style={{ fontFamily: 'Georgia, serif' }}>SOS Emergency</h3>
                  <p className="text-red-700 font-semibold text-sm">Instant Help & Location Sharing</p>
                </div>
              </div>
              <div onClick={() => setActiveSection('medicine')} className="rounded-3xl p-8 bg-emerald-50/40 backdrop-blur-xl border border-emerald-200/50 shadow-xl cursor-pointer hover:bg-emerald-50/60 transition-all group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-300 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-800 italic" style={{ fontFamily: 'Georgia, serif' }}>Medicine Matrix</h3>
                  <p className="text-emerald-700 font-semibold text-sm">Find Medicines & Pharmacies</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Section */}
        {activeSection === 'appointments' && (
          <div className="p-8 space-y-6">
            <h1 className="text-4xl font-bold text-gray-800 italic mb-6 shadow-sm inline-block" style={{ fontFamily: 'Georgia, serif' }}>Your Appointments</h1>
            <div className="grid gap-6">
              {appointments.length === 0 ? (
                <div className="bg-white/40 p-12 rounded-3xl text-center border border-white/40 shadow-inner">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-6 font-medium">You have no upcoming appointments.</p>
                  <button onClick={() => router.push('/appointments/book')} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">Book Your First Consultation</button>
                </div>
              ) : (
                appointments.map((appt, idx) => (
                  <div key={idx} className="bg-white/60 p-6 rounded-3xl border border-white/40 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xl transition-all">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {appt.doctorName.split(' ').map((n: any) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{appt.doctorName}</h3>
                        <p className="text-teal-600 text-sm font-semibold">{appt.problemType}</p>
                        <p className="text-gray-500 text-xs mt-2 flex items-center gap-2">
                          <span className="flex items-center gap-1">📅 {new Date(appt.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">⏰ {appt.time}</span>
                          <span className="flex items-center gap-1">📍 {appt.hospitalName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1 rounded-full text-xs font-bold shadow-sm ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                      {appt.status === 'confirmed' && (
                        <button className="text-xs font-bold text-teal-600 hover:underline">Join Consult Voice/Video</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AI Chatbot Section */}
        {activeSection === 'chatbot' && (
          <div className="p-8 h-[calc(100vh-140px)] flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>Sanjeevni AI Assistant</h1>
            <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/40 p-6 overflow-y-auto mb-4 space-y-4 shadow-inner">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="dashboard-chat-input"
                name="dashboard-chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white/60 border border-white/40 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
                placeholder="Describe your symptoms or ask a health question..."
              />
              <button onClick={handleSendMessage} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 rounded-2xl font-bold hover:bg-teal-700 transition-colors shadow-lg active:scale-95">Send</button>
            </div>
          </div>
        )}

        {/* Medicine Matrix Section */}
        {activeSection === 'medicine' && (
          <div className="p-8 space-y-6">
            <h1 className="text-4xl font-bold text-gray-800 italic" style={{ fontFamily: 'Georgia, serif' }}>Medicine Matrix</h1>
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
              <div className="relative mb-6">
                <input
                  id="medicine-search"
                  name="medicine-search"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  className="w-full bg-white/60 border border-white/40 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-emerald-500 outline-none text-lg shadow-inner"
                  placeholder="Search for medicines or nearby pharmacies..."
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white/70 p-6 rounded-3xl border border-emerald-100 hover:shadow-lg transition-all">
                  <h4 className="font-bold text-gray-800 text-xl mb-1">Apollo Pharmacy</h4>
                  <p className="text-sm text-gray-600 font-medium">Jubilee Hills • 0.8 km away</p>
                  <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Open 24/7
                  </p>
                  <button className="mt-4 w-full bg-emerald-50 text-emerald-700 py-2 rounded-xl text-sm font-bold border border-emerald-200 hover:bg-emerald-100">Get Directions</button>
                </div>
                <div className="bg-white/70 p-6 rounded-3xl border border-emerald-100 hover:shadow-lg transition-all">
                  <h4 className="font-bold text-gray-800 text-xl mb-1">MedPlus Care</h4>
                  <p className="text-sm text-gray-600 font-medium">Banjara Hills • 1.5 km away</p>
                  <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Closing at 11 PM
                  </p>
                  <button className="mt-4 w-full bg-emerald-50 text-emerald-700 py-2 rounded-xl text-sm font-bold border border-emerald-200 hover:bg-emerald-100">Get Directions</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
