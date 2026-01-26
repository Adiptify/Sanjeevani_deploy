'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DoctorSignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const router = useRouter()
  const totalSteps = 5

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    medicalLicenseNumber: '',
    medicalCouncilRegistration: '',
    specialization: '',
    medicalDegree: '',
    yearsOfExperience: '',
    governmentIdType: '',
    governmentIdNumber: '',
    aadhaarNumber: '',
    currentEmployer: '',
    clinicAddress: '',
    consultationTimings: '',
    consultationFees: '',
    languagesSpoken: '',
    additionalQualifications: '',
    areasOfExpertise: '',
    insuranceAccepted: '',
    professionalBio: '',
    privacyConsent: false,
    credentialsVerification: false,
    termsOfService: false,
    servicesOffered: [] as string[]
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
      if (!formData.fullName || !formData.email || !formData.password || !formData.phone || !formData.medicalLicenseNumber || !formData.medicalCouncilRegistration || !formData.specialization || !formData.medicalDegree || !formData.yearsOfExperience) {
        alert('Please fill in all required fields in Professional Information')
        return false
      }
    } else if (currentStep === 2) {
      if (!formData.governmentIdType || !formData.governmentIdNumber) {
        alert('Please fill in all required identity verification fields')
        return false
      }
    } else if (currentStep === 3) {
      if (!formData.currentEmployer || !formData.clinicAddress || !formData.consultationTimings || !formData.consultationFees) {
        alert('Please fill in all required practice details')
        return false
      }
    } else if (currentStep === 5) {
      if (!formData.privacyConsent || !formData.credentialsVerification || !formData.termsOfService) {
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
          role: 'Doctor',
          ...formData,
          signatureBase64,
          registrationId: `DOC-${Date.now()}`,
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
      localStorage.setItem('selectedRole', 'Doctor')
      localStorage.setItem('userName', `Dr. ${formData.fullName}`)

      alert(`✅ Doctor Registration Successful! Redirecting to your dashboard...`)

      setTimeout(() => {
        router.push('/dashboard/doctor')
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

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      servicesOffered: checked
        ? [...prev.servicesOffered, value]
        : prev.servicesOffered.filter(s => s !== value)
    }))
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="caveat text-4xl font-bold text-gray-800">Sanjeevni AI</h1>
          </Link>
          <h2 className="caveat text-4xl font-bold text-gray-800 mb-2">Doctor Registration</h2>
          <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
        </div>

        <div className="max-w-4xl w-full mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="max-w-4xl w-full bg-white rounded-3xl p-8 shadow-2xl mb-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Professional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (As per License) *</label>
                  <input type="text" id="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Dr. John Smith" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input type="email" id="email" required value={formData.email} onChange={handleChange} placeholder="doctor@hospital.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input type="password" id="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" id="phone" required value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Number *</label>
                    <input type="text" id="medicalLicenseNumber" required value={formData.medicalLicenseNumber} onChange={handleChange} placeholder="MED-123456" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Council Registration *</label>
                    <input type="text" id="medicalCouncilRegistration" required value={formData.medicalCouncilRegistration} onChange={handleChange} placeholder="Registration Number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                    <select id="specialization" required value={formData.specialization} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors">
                      <option value="">Select Specialization</option>
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                      <option value="Surgeon">Surgeon</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Degree *</label>
                    <input type="text" id="medicalDegree" required value={formData.medicalDegree} onChange={handleChange} placeholder="MBBS, MD, DO, etc." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                  <input type="number" id="yearsOfExperience" required min="0" value={formData.yearsOfExperience} onChange={handleChange} placeholder="Years" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                </svg>
                Identity Verification
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p className="text-sm text-yellow-700">All documents will be verified by our team before your account is activated.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Government ID Type *</label>
                    <select id="governmentIdType" required value={formData.governmentIdType} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors">
                      <option value="">Select ID Type</option>
                      <option value="Passport">Passport</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="National ID">National ID Card</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Government ID Number *</label>
                    <input type="text" id="governmentIdNumber" required value={formData.governmentIdNumber} onChange={handleChange} placeholder="ID Number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number (Optional - for India)</label>
                  <input type="text" id="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" maxLength={14} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3">Document Upload (Coming Soon)</h3>
                  <p className="text-sm text-gray-600 mb-4">You will be able to upload the following documents:</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Medical License Certificate (PDF/Image)</li>
                    <li>✓ Degree Certificates (PDF/Image)</li>
                    <li>✓ Government ID Proof (PDF/Image)</li>
                    <li>✓ Employment ID/Hospital Badge (Optional)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-4 italic">Note: Our team will contact you for document verification.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Practice Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Employer/Hospital Name *</label>
                  <input type="text" id="currentEmployer" required value={formData.currentEmployer} onChange={handleChange} placeholder="City General Hospital" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clinic/Hospital Address *</label>
                  <textarea id="clinicAddress" required value={formData.clinicAddress} onChange={handleChange} rows={3} placeholder="Full address including street, city, state, ZIP" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Timings *</label>
                  <input type="text" id="consultationTimings" required value={formData.consultationTimings} onChange={handleChange} placeholder="e.g., Mon-Fri: 9AM-5PM" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fees (USD) *</label>
                  <input type="number" id="consultationFees" required min="0" step="0.01" value={formData.consultationFees} onChange={handleChange} placeholder="50.00" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                  <input type="text" id="languagesSpoken" value={formData.languagesSpoken} onChange={handleChange} placeholder="English, Spanish, Hindi" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Qualifications/Certifications</label>
                  <textarea id="additionalQualifications" value={formData.additionalQualifications} onChange={handleChange} rows={3} placeholder="Board certifications, fellowships, etc." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"></textarea>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                Specialization & Services
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Expertise</label>
                  <textarea id="areasOfExpertise" value={formData.areasOfExpertise} onChange={handleChange} rows={3} placeholder="List specific conditions or procedures you specialize in" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Services Offered</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['In-Person Consultation', 'Telemedicine', 'Emergency Services', 'Home Visits', 'Diagnostic Services', 'Follow-up Care'].map(service => (
                      <label key={service} className="flex items-center space-x-2">
                        <input type="checkbox" value={service} checked={formData.servicesOffered.includes(service)} onChange={handleServiceChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Accepted</label>
                  <textarea id="insuranceAccepted" value={formData.insuranceAccepted} onChange={handleChange} rows={2} placeholder="List insurance providers accepted" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio/Summary</label>
                  <textarea id="professionalBio" value={formData.professionalBio} onChange={handleChange} rows={4} placeholder="Brief description about your practice and patient care approach" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"></textarea>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Legal Agreements & Digital Signature
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-start">
                    <input type="checkbox" id="privacyConsent" checked={formData.privacyConsent} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <label htmlFor="privacyConsent" className="ml-3 text-sm text-gray-700">
                      I agree to the <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span> and confirm that I will maintain patient confidentiality as per HIPAA regulations.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input type="checkbox" id="credentialsVerification" checked={formData.credentialsVerification} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <label htmlFor="credentialsVerification" className="ml-3 text-sm text-gray-700">
                      I certify that all credentials, licenses, and information provided are accurate and up-to-date.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input type="checkbox" id="termsOfService" checked={formData.termsOfService} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <label htmlFor="termsOfService" className="ml-3 text-sm text-gray-700">
                      I agree to the <span className="text-blue-600 underline cursor-pointer">Terms of Service</span> and professional conduct guidelines.
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">Professional Digital Signature *</label>
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
          <button onClick={nextStep} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-800">Submitting your registration...</p>
              <p className="text-sm text-gray-600 mt-2">Verifying credentials and documents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
