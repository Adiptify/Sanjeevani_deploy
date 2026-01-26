'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type SectionType = 'dashboard' | 'patients' | 'appointments' | 'consultations' | 'prescriptions';

export default function DoctorDashboard() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome');
  const [email, setEmail] = useState('');
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUserData(data);
        setEmail(data.user.email);

        const apptRes = await fetch('/api/appointments');
        if (apptRes.ok) {
          const appts = await apptRes.json();
          setAppointments(appts);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
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

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date.startsWith(today) || a.date === today);
  const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date());

  const uniquePatients = Array.from(new Set(appointments.map(a => a.patientEmail)));
  const totalPatients = uniquePatients.length;
  const estimatedRevenue = appointments.reduce((sum, a) => sum + (a.type === 'physical' ? 800 : 500), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl transform -translate-x-full lg:translate-x-0 transition-transform z-50">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-teal-600">🏥 SanjeevniAI</h1>
          <p className="text-sm text-gray-600 mt-1">Doctor Portal</p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${activeSection === 'dashboard'
                ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Command Center
          </button>
          <button
            onClick={() => setActiveSection('patients')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${activeSection === 'patients'
                ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Patient Registry
          </button>
          <button
            onClick={() => setActiveSection('appointments')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${activeSection === 'appointments'
                ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Appointments
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
      <main className="lg:ml-64 p-8 min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {greeting}, {userData?.user?.name || `Dr. ${email.split('@')[0]}`}
          </h1>
          <p className="text-gray-600">Your professional command center for patient care</p>
        </div>

        {/* Dashboard View (Command Center) */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Clickable Metric Cards with Glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Patients Card */}
              <button
                onClick={() => setActiveSection('patients')}
                className="group relative overflow-hidden rounded-3xl p-6 shadow-xl backdrop-blur-xl bg-white bg-opacity-30 border border-white border-opacity-40 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(6, 182, 212, 0.35) 100%)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white bg-opacity-40 group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-7 h-7 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-teal-900">{totalPatients}</div>
                  <div className="text-sm font-medium text-teal-800 opacity-90">Total Patients</div>
                  <div className="mt-3 text-xs text-teal-700 flex items-center gap-1">
                    <span>View Registry</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Today's Appointments Card */}
              <button
                onClick={() => setActiveSection('appointments')}
                className="group relative overflow-hidden rounded-3xl p-6 shadow-xl backdrop-blur-xl bg-white bg-opacity-30 border border-white border-opacity-40 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.35) 100%)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white bg-opacity-40 group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-green-900">{todayAppointments.length}</div>
                  <div className="text-sm font-medium text-green-800 opacity-90">Today's Appointments</div>
                  <div className="mt-3 text-xs text-green-700 flex items-center gap-1">
                    <span>View Calendar</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Total Appointments Card */}
              <div
                className="relative overflow-hidden rounded-3xl p-6 shadow-xl backdrop-blur-xl bg-white bg-opacity-30 border border-white border-opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(139, 92, 246, 0.35) 100%)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white bg-opacity-40 shadow-sm">
                    <svg className="w-7 h-7 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-purple-900">{appointments.length}</div>
                  <div className="text-sm font-medium text-purple-800 opacity-90">Total Consultations</div>
                </div>
              </div>

              {/* Estimated Revenue Card */}
              <div
                className="relative overflow-hidden rounded-3xl p-6 shadow-xl backdrop-blur-xl bg-white bg-opacity-30 border border-white border-opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.35) 0%, rgba(234, 88, 12, 0.35) 100%)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white bg-opacity-40 shadow-sm">
                    <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-orange-900">₹{estimatedRevenue.toLocaleString()}</div>
                  <div className="text-sm font-medium text-orange-800 opacity-90">Estimated Earnings</div>
                </div>
              </div>
            </div>

            {/* Interactive Today's Schedule */}
            <div className="backdrop-blur-xl bg-white bg-opacity-40 rounded-3xl p-8 shadow-xl border border-white border-opacity-50">
              <h2 className="text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                Today's Schedule
              </h2>
              <div className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-12 bg-white/30 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 italic">No appointments scheduled for today.</p>
                  </div>
                ) : (
                  todayAppointments.map((appointment, idx) => (
                    <div key={idx} className="group">
                      <button
                        onClick={() => setExpandedPatient(expandedPatient === appointment._id ? null : appointment._id)}
                        className="w-full flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl bg-white/60 border border-white/40 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {appointment.patientEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-gray-800 text-lg">{appointment.patientEmail.split('@')[0]}</h3>
                            <p className="text-sm text-teal-600 font-semibold">{appointment.problemType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 mt-4 md:mt-0">
                          <div className="text-right">
                            <p className="font-bold text-lg text-teal-700">{appointment.time}</p>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${new Date(appointment.date) >= new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {new Date(appointment.date) >= new Date() ? 'Upcoming' : 'Completed'}
                            </span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedPatient === appointment._id ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </button>

                      {/* Expandable Patient Details */}
                      {expandedPatient === appointment._id && (
                        <div className="mt-2 p-6 bg-white/90 rounded-2xl border-2 border-teal-200 shadow-xl animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                Patient Information
                              </h4>
                              <div className="space-y-3 text-sm">
                                <p className="text-gray-600"><span className="font-bold text-gray-800">Email:</span> {appointment.patientEmail}</p>
                                <p className="text-gray-600"><span className="font-bold text-gray-800">Hospital:</span> {appointment.hospitalName}</p>
                                <p className="text-gray-600"><span className="font-bold text-gray-800">Mode:</span> {appointment.type.toUpperCase()}</p>
                                <p className="text-gray-600"><span className="font-bold text-gray-800">Status:</span> {appointment.status}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                Clinical Actions
                              </h4>
                              <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                Launch Virtual Consultation
                              </button>
                              <button className="w-full bg-white border-2 border-teal-200 text-teal-600 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                Prescribe Medication
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Patient Registry Section */}
        {activeSection === 'patients' && (
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-800 italic shadow-sm inline-block" style={{ fontFamily: 'Georgia, serif' }}>Patient Registry</h1>
            <div className="relative">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by patient name or email..."
                className="w-full bg-white/60 border border-white/40 rounded-3xl px-6 py-4 focus:ring-2 focus:ring-teal-500 outline-none shadow-inner"
              />
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniquePatients.filter(email => email.includes(searchQuery)).map((patEmail, idx) => (
                <div key={idx} className="bg-white/60 p-6 rounded-3xl border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-md">
                    {patEmail.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl mb-1">{patEmail.split('@')[0]}</h3>
                  <p className="text-sm text-gray-500 mb-4 truncate">{patEmail}</p>
                  <p className="text-xs text-teal-600 font-bold mb-6">Last visit: {appointments.filter(a => a.patientEmail === patEmail).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || 'N/A'}</p>
                  <button className="w-full bg-teal-50 text-teal-600 border border-teal-200 py-3 rounded-2xl font-bold hover:bg-teal-100 transition-all">Full History</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Section */}
        {activeSection === 'appointments' && (
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-800 italic shadow-sm inline-block" style={{ fontFamily: 'Georgia, serif' }}>Full Schedule</h1>
            <div className="grid gap-6">
              {[...upcomingAppointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((appt, idx) => (
                <div key={idx} className="bg-white/60 p-6 rounded-3xl border border-white/40 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xl transition-all">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl shadow-sm">
                      {appt.patientEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{appt.patientEmail.split('@')[0]}</h3>
                      <p className="text-teal-600 text-sm font-semibold">{appt.problemType}</p>
                      <p className="text-gray-500 text-xs mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1">📅 {appt.date}</span>
                        <span className="flex items-center gap-1">⏰ {appt.time}</span>
                        <span className="flex items-center gap-1">📍 {appt.hospitalName}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-5 py-2 rounded-full text-xs font-bold shadow-sm bg-teal-100 text-teal-700">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
