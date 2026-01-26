'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NGOSignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const router = useRouter()
  const totalSteps = 5

  const [formData, setFormData] = useState({
    organizationName: '',
    ngoRegistrationNumber: '',
    ngoType: '',
    dateOfEstablishment: '',
    missionStatement: '',
    panCard: '',
    fcraRegistration: '',
    registeredOfficeAddress: '',
    email: '',
    password: '',
    phone: '',
    websiteUrl: '',
    authorizedPersonName: '',
    authorizedPersonDesignation: '',
    authorizedPersonContact: '',
    authorizedPersonEmail: '',
    servicesProvided: '',
    targetBeneficiaries: '',
    customizationNeeds: '',
    privacyConsent: false,
    documentsVerification: false,
    termsOfService: false,
    areasOfFocus: [] as string[],
    geographicalAreas: [] as string[]
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => setIsDrawing(false)

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const hasSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return false
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)
    return pixelBuffer.some(color => color !== 0)
  }

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!formData.organizationName || !formData.ngoRegistrationNumber || !formData.ngoType || !formData.dateOfEstablishment || !formData.missionStatement || !formData.panCard) {
        alert('Please fill in all required fields in Organization Details')
        return false
      }
    } else if (currentStep === 2) {
      if (!formData.registeredOfficeAddress || !formData.email || !formData.password || !formData.phone) {
        alert('Please fill in all required contact information')
        return false
      }
    } else if (currentStep === 3) {
      if (!formData.authorizedPersonName || !formData.authorizedPersonDesignation || !formData.authorizedPersonContact || !formData.authorizedPersonEmail) {
        alert('Please fill in all required authorized representative details')
        return false
      }
    } else if (currentStep === 4) {
      if (!formData.servicesProvided || formData.areasOfFocus.length === 0 || formData.geographicalAreas.length === 0) {
        alert('Please fill in all required operational details')
        return false
      }
    } else if (currentStep === 5) {
      if (!formData.privacyConsent || !formData.documentsVerification || !formData.termsOfService) {
        alert('Please accept all required agreements')
        return false
      }
      if (!hasSignature()) {
        alert('Please provide your digital signature')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (!validateCurrentStep()) return
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      submitForm()
    }
  }

  const previousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const submitForm = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const signatureBase64 = canvas.toDataURL()

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'NGO',
          ...formData,
          signatureBase64,
          registrationId: `NGO-${Date.now()}`,
          registrationDate: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Set user session
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', formData.email)
      localStorage.setItem('selectedRole', 'NGO')
      localStorage.setItem('userName', formData.organizationName)

      alert(`✅ NGO Registration Successful! Redirecting to your dashboard...`)

      setTimeout(() => {
        router.push('/dashboard/ngo')
      }, 500)

    } catch (error: any) {
      alert(`Error: ${error.message}`)
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [id]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [id]: value }))
    }
  }

  const handleCheckboxArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'areasOfFocus' | 'geographicalAreas') => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }))
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-4">
      <div className="flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="caveat text-4xl font-bold text-gray-800">Sanjeevni AI</h1>
          </Link>
          <h2 className="caveat text-4xl font-bold text-gray-800 mb-2">NGO Registration</h2>
          <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
        </div>

        <div className="max-w-4xl w-full mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="max-w-4xl w-full bg-white rounded-3xl p-8 shadow-2xl mb-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Organization Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                  <input type="text" id="organizationName" required value={formData.organizationName} onChange={handleChange} placeholder="Health for All Foundation" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NGO Registration Number *</label>
                    <input type="text" id="ngoRegistrationNumber" required value={formData.ngoRegistrationNumber} onChange={handleChange} placeholder="NGO-REG-123456" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NGO Type *</label>
                    <select id="ngoType" required value={formData.ngoType} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors">
                      <option value="">Select Type</option>
                      <option value="Trust">Trust</option>
                      <option value="Society">Society</option>
                      <option value="Section 8 Company">Section 8 Company</option>
                      <option value="Foundation">Foundation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Establishment *</label>
                  <input type="date" id="dateOfEstablishment" required value={formData.dateOfEstablishment} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement *</label>
                  <textarea id="missionStatement" required value={formData.missionStatement} onChange={handleChange} rows={4} placeholder="Describe your organization's mission and vision..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number *</label>
                    <input type="text" id="panCard" required value={formData.panCard} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">FCRA Registration (if applicable)</label>
                    <input type="text" id="fcraRegistration" value={formData.fcraRegistration} onChange={handleChange} placeholder="FCRA Number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registered Office Address *</label>
                  <textarea id="registeredOfficeAddress" required value={formData.registeredOfficeAddress} onChange={handleChange} rows={3} placeholder="Full address including street, city, state, ZIP" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Official Email Address *</label>
                    <input type="email" id="email" required value={formData.email} onChange={handleChange} placeholder="contact@ngo.org" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Password *</label>
                    <input type="password" id="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" id="phone" required value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                  <input type="url" id="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://www.ngo.org" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Authorized Representative
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input type="text" id="authorizedPersonName" required value={formData.authorizedPersonName} onChange={handleChange} placeholder="John Smith" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                    <input type="text" id="authorizedPersonDesignation" required value={formData.authorizedPersonDesignation} onChange={handleChange} placeholder="President, Director, etc." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                    <input type="tel" id="authorizedPersonContact" required value={formData.authorizedPersonContact} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input type="email" id="authorizedPersonEmail" required value={formData.authorizedPersonEmail} onChange={handleChange} placeholder="person@ngo.org" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                </div>
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-700">The authorized person will be the primary contact for all communications and verifications.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Operational Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Primary Areas of Focus *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Healthcare', 'Education', 'Women Empowerment', 'Child Welfare', 'Rural Development', 'Emergency Relief', 'Mental Health', 'Nutrition'].map(area => (
                      <label key={area} className="flex items-center space-x-2">
                        <input type="checkbox" value={area} checked={formData.areasOfFocus.includes(area)} onChange={(e) => handleCheckboxArrayChange(e, 'areasOfFocus')} className="w-5 h-5 text-indigo-600 rounded" />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Geographical Areas Served *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Urban', 'Rural', 'Tribal', 'National'].map(geo => (
                      <label key={geo} className="flex items-center space-x-2">
                        <input type="checkbox" value={geo} checked={formData.geographicalAreas.includes(geo)} onChange={(e) => handleCheckboxArrayChange(e, 'geographicalAreas')} className="w-5 h-5 text-indigo-600 rounded" />
                        <span className="text-sm text-gray-700">{geo === 'National' ? 'Pan-National' : `${geo} Areas`}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services Provided *</label>
                  <textarea id="servicesProvided" required value={formData.servicesProvided} onChange={handleChange} rows={4} placeholder="List the main services and programs your organization offers..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Beneficiary Groups</label>
                  <textarea id="targetBeneficiaries" value={formData.targetBeneficiaries} onChange={handleChange} rows={3} placeholder="e.g., Underprivileged children, pregnant women, elderly, etc." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customization Needs on Platform</label>
                  <textarea id="customizationNeeds" value={formData.customizationNeeds} onChange={handleChange} rows={3} placeholder="Describe any specific features or customizations needed..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"></textarea>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Legal Agreements & Digital Signature
              </h2>
              <div className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-xl mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Document Upload (Coming Soon)</h3>
                  <p className="text-sm text-gray-600 mb-4">You will be able to upload the following documents:</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ NGO Registration Certificate (PDF/Image)</li>
                    <li>✓ PAN Card Copy (PDF/Image)</li>
                    <li>✓ FCRA Registration (if applicable)</li>
                    <li>✓ Trust Deed / MOA & AOA (PDF)</li>
                    <li>✓ Annual Report (Latest)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-4 italic">Note: Our team will contact you for document verification.</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-start">
                    <input type="checkbox" id="privacyConsent" checked={formData.privacyConsent} onChange={handleChange} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
                    <label htmlFor="privacyConsent" className="ml-3 text-sm text-gray-700">
                      I agree to the <span className="text-indigo-600 underline cursor-pointer">Privacy Policy</span> and confirm that beneficiary data will be protected as per data protection regulations.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input type="checkbox" id="documentsVerification" checked={formData.documentsVerification} onChange={handleChange} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
                    <label htmlFor="documentsVerification" className="ml-3 text-sm text-gray-700">
                      I certify that all organization details, registration documents, and information provided are accurate and current.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input type="checkbox" id="termsOfService" checked={formData.termsOfService} onChange={handleChange} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
                    <label htmlFor="termsOfService" className="ml-3 text-sm text-gray-700">
                      I agree to the <span className="text-indigo-600 underline cursor-pointer">Terms of Service</span> and platform usage guidelines.
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">Authorized Person's Digital Signature *</label>
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={200}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <p className="text-sm text-gray-500 mt-2">Draw your signature using your mouse or touch screen</p>
                  <button type="button" onClick={clearSignature} className="mt-4 px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                    <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Clear Signature
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl w-full flex gap-4">
          {currentStep > 1 && (
            <button onClick={previousStep} className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl hover:bg-gray-300 transition-all duration-300">
              <svg className="inline-block w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
              </svg>
              Back
            </button>
          )}
          <button onClick={nextStep} className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            {currentStep === totalSteps ? 'Submit Registration' : 'Next'}
            {currentStep < totalSteps && (
              <svg className="inline-block w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-800">Submitting your registration...</p>
              <p className="text-sm text-gray-600 mt-2">Verifying organization documents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
