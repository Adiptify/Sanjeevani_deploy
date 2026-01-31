'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type SectionType = 'dashboard' | 'campaigns' | 'beneficiaries' | 'donations' | 'volunteers';

export default function NGODashboard() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome');
  const [email, setEmail] = useState('');
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
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

        const simRes = await fetch('/api/simulation');
        if (simRes.ok) {
          const simData = await simRes.json();
          setSimulationData(simData);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
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

      {/* Sidebar - Enhanced Premium Look */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl transform -translate-x-full lg:translate-x-0 transition-transform z-50">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-teal-600">🏥 SanjeevniAI</h1>
          <p className="text-sm text-gray-600 mt-1">NGO Portal</p>
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
            Mission Control
          </button>
          <button
            onClick={() => setActiveSection('campaigns')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${activeSection === 'campaigns'
              ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
            </svg>
            Campaign Manager
          </button>
          <button
            onClick={() => setActiveSection('beneficiaries')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${activeSection === 'beneficiaries'
              ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Beneficiary Registry
          </button>
          <button
            onClick={() => setActiveSection('donations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${activeSection === 'donations'
              ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Funding Tracker
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
            {greeting}, {userData?.user?.name || email.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Medical assistance and community health management hub</p>
        </div>

        {/* Dashboard View (Mission Control) */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Clickable Glassmorphism Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Campaigns Card */}
              <button
                onClick={() => setActiveSection('campaigns')}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-teal-900">{userData?.systemStats?.totalNGOs || '8'}</div>
                  <div className="text-sm font-medium text-teal-800 opacity-90">Active Campaigns</div>
                  <div className="mt-3 text-xs text-teal-700 flex items-center gap-1">
                    <span>Manage Campaigns</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Total Beneficiaries Card */}
              <button
                onClick={() => setActiveSection('beneficiaries')}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-green-900">{userData?.systemStats?.totalPatients || '1,543'}</div>
                  <div className="text-sm font-medium text-green-800 opacity-90">Total Beneficiaries</div>
                  <div className="mt-3 text-xs text-green-700 flex items-center gap-1">
                    <span>View Registry</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Funds This Month Card */}
              <button
                onClick={() => setActiveSection('donations')}
                className="group relative overflow-hidden rounded-3xl p-6 shadow-xl backdrop-blur-xl bg-white bg-opacity-30 border border-white border-opacity-40 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.35) 0%, rgba(8, 145, 178, 0.35) 100%)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white bg-opacity-40 group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-7 h-7 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-cyan-900">₹3.2L</div>
                  <div className="text-sm font-medium text-cyan-800 opacity-90">Funds Raised</div>
                  <div className="mt-3 text-xs text-cyan-700 flex items-center gap-1">
                    <span>View Tracking</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Training Programs Card */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-purple-900">12</div>
                  <div className="text-sm font-medium text-purple-800 opacity-90">Live Training Sessions</div>
                </div>
              </div>
            </div>

            {/* NGO Simulation & Impact Section */}
            {simulationData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="backdrop-blur-xl bg-white bg-opacity-40 rounded-3xl p-8 shadow-xl border border-white border-opacity-50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                    Community Health Simulation
                  </h3>
                  <div className="space-y-6">
                    {simulationData.trends.map((trend: any, idx: number) => (
                      <div key={idx} className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                              {trend.week}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-emerald-600">
                              Impact Score: {trend.mentalHealthTrend}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-100">
                          <div style={{ width: `${trend.mentalHealthTrend}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white bg-opacity-40 rounded-3xl p-8 shadow-xl border border-white border-opacity-50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                    Regional Impact Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {simulationData.regions.map((region: any, idx: number) => (
                      <div key={idx} className="bg-white bg-opacity-50 p-4 rounded-2xl border border-white shadow-sm">
                        <p className="text-sm font-bold text-emerald-700 uppercase">{region.name}</p>
                        <p className="text-2xl font-bold text-emerald-800">{region.healthScore}%</p>
                        <p className="text-xs text-gray-400">Reach: {Math.floor(region.activeUsers * 1.5)} people</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Expandable Active Campaigns */}
            <div className="backdrop-blur-xl bg-white bg-opacity-40 rounded-3xl p-8 shadow-xl border border-white border-opacity-50">
              <h2 className="text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                Active Campaigns
              </h2>
              <div className="space-y-4">
                {[
                  { id: 1, name: 'Free Health Checkup Camp', beneficiaries: 245, status: 'Active', endDate: 'Ends in 5 days', color: 'teal', location: 'Rajiv Gandhi Hospital, Delhi', doctors: ['Dr. Sharma', 'Dr. Kumar'], medicines: 'Adequate Stock' },
                  { id: 2, name: 'Rural Education Support', beneficiaries: 312, status: 'Ongoing', endDate: 'Ongoing', color: 'cyan', location: 'Multiple Schools, Mumbai', doctors: ['Health Educators'], medicines: 'N/A' },
                  { id: 3, name: 'Women Empowerment Drive', beneficiaries: 128, status: 'Active', endDate: 'Ends in 12 days', color: 'emerald', location: 'Community Center, Pune', doctors: ['Dr. Patel', 'Dr. Singh'], medicines: 'Basic Supplies' }
                ].map((campaign) => (
                  <div key={campaign.id} className="group">
                    <button
                      onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border-l-4 transition-all shadow-sm ${campaign.color === 'teal' ? 'bg-teal-50 border-teal-500 hover:bg-teal-100' :
                        campaign.color === 'cyan' ? 'bg-cyan-50 border-cyan-500 hover:bg-cyan-100' :
                          'bg-emerald-50 border-emerald-500 hover:bg-emerald-100'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md ${campaign.color === 'teal' ? 'bg-teal-500' :
                          campaign.color === 'cyan' ? 'bg-cyan-500' :
                            'bg-emerald-500'
                          }`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                          </svg>
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-800 text-lg">{campaign.name}</h3>
                          <p className="text-sm text-gray-600 font-medium">{campaign.beneficiaries} beneficiaries served</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${campaign.color === 'teal' ? 'bg-teal-200 text-teal-800' :
                            campaign.color === 'cyan' ? 'bg-cyan-200 text-cyan-800' :
                              'bg-emerald-200 text-emerald-800'
                            }`}>
                            {campaign.status}
                          </span>
                          <p className="text-xs text-gray-600 mt-2 font-bold uppercase tracking-wider">{campaign.endDate}</p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedCampaign === campaign.id ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                    </button>

                    {/* Expandable Campaign Drawer */}
                    {expandedCampaign === campaign.id && (
                      <div className="mt-2 p-6 bg-white rounded-2xl border border-teal-100 shadow-xl animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                              Field Operations
                            </h4>
                            <div className="space-y-3 text-sm">
                              <p className="text-gray-600"><span className="font-bold text-gray-800">Primary Location:</span> {campaign.location}</p>
                              <p className="text-gray-600"><span className="font-bold text-gray-800">Assigned Doctors:</span> {campaign.doctors.join(', ')}</p>
                              <p className="text-gray-600"><span className="font-bold text-gray-800">Inventory Status:</span> {campaign.medicines}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                              Impact Metrics
                            </h4>
                            <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                              View Live Dashboard
                            </button>
                            <button className="w-full bg-white border border-teal-200 text-teal-600 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all">
                              Update Case Files
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaign Manager Full Section */}
        {activeSection === 'campaigns' && (
          <div className="backdrop-blur-xl bg-white bg-opacity-40 rounded-3xl p-8 shadow-xl border border-white border-opacity-50 animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                Active Initiatives
              </h2>
              <button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                New Campaign
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: 'Rural Tele-Health Link', beneficiaries: 1150, status: 'Scaling', impact: 'High', coverage: '85%' },
                { name: 'Pediatric Vaccine Drive', beneficiaries: 540, status: 'Critical', impact: 'Vital', coverage: '42%' },
                { name: 'Geriatric Care Outreach', beneficiaries: 210, status: 'Steady', impact: 'Moderate', coverage: '68%' },
                { name: 'Community Nutrition Program', beneficiaries: 3000, status: 'Active', impact: 'High', coverage: '92%' }
              ].map((campaign, idx) => (
                <div key={idx} className="bg-white/70 p-8 rounded-3xl border border-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 text-2xl group-hover:scale-110 transition-all">
                      🚀
                    </div>
                    <span className="bg-teal-50 text-teal-700 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter shadow-sm">{campaign.status}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{campaign.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 font-medium">
                    <span>👥 {campaign.beneficiaries} Beneficiaries</span>
                    <span>📍 State-wide</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: campaign.coverage }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Coverage: {campaign.coverage}</span>
                    <button className="text-teal-600 font-bold hover:underline">Full Analytics →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funding Tracker Full Section */}
        {activeSection === 'donations' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="backdrop-blur-xl bg-white bg-opacity-40 rounded-3xl p-8 shadow-xl border border-white border-opacity-50">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Funding Allocation</h2>
                <button className="bg-teal-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-teal-700 transition-all">New Budget Plan</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/60 p-8 rounded-3xl border border-white">
                  <h4 className="font-bold text-gray-800 text-xl mb-6">Current Distribution</h4>
                  <div className="space-y-6">
                    {[
                      { label: 'Direct Medical Aid', val: 65, color: 'bg-teal-500' },
                      { label: 'Infrastructure', val: 20, color: 'bg-cyan-500' },
                      { label: 'Admin & Outreach', val: 15, color: 'bg-purple-500' }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-teal-700">{item.val}%</span>
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/60 p-8 rounded-3xl border border-white">
                  <h4 className="font-bold text-gray-800 text-xl mb-6">Recent Grants</h4>
                  <div className="space-y-4">
                    {[
                      { org: 'Global Health Fund', amt: '₹15,00,000', status: 'Approved' },
                      { org: 'City Municipal Corp', amt: '₹5,00,000', status: 'Pending' }
                    ].map((grant, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-gray-100 shadow-sm">
                        <div>
                          <p className="font-bold text-gray-800">{grant.org}</p>
                          <p className="text-xs text-gray-500">Scheduled: Feb 2026</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-teal-600">{grant.amt}</p>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">{grant.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
