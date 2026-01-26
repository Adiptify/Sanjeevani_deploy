'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PatientSignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const router = useRouter()
  const totalSteps = 6

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    bloodGroup: '',
    medicalConditions: '',
    currentMedications: '',
    allergies: '',
    previousSurgeries: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupId: '',
    preferredPaymentMethod: '',
    preferredDoctor: '',
    preferredLocation: '',
    appointmentPreferences: '',
    privacyConsent: false,
    treatmentConsent: false
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

  const stopDrawing = () => {
    setIsDrawing(false)
  }

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

    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    )

    return pixelBuffer.some(color => color !== 0)
  }

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.dateOfBirth || !formData.gender) {
        alert('Please fill in all required fields in Basic Information')
        return false
      }
    } else if (currentStep === 2) {
      if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
        alert('Please fill in all required fields in Address Information')
        return false
      }
    } else if (currentStep === 3) {
      if (!formData.emergencyContactName || !formData.emergencyContactRelation || !formData.emergencyContactPhone) {
        alert('Please fill in all required fields in Emergency Contact')
        return false
      }
    } else if (currentStep === 4) {
      if (!formData.bloodGroup) {
        alert('Please select your blood group')
        return false
      }
    } else if (currentStep === 6) {
      if (!formData.privacyConsent || !formData.treatmentConsent) {
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
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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
          role: 'Patient',
          ...formData,
          signatureBase64,
          registrationId: `PAT-${Date.now()}`,
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
      localStorage.setItem('selectedRole', 'User')
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`)

      alert(`✅ Patient Registration Successful! Redirecting to your dashboard...`)

      setTimeout(() => {
        router.push('/dashboard/patient')
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

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8 px-4">
      <div className="flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="caveat text-4xl font-bold text-gray-800">Sanjeevni AI</h1>
          </Link>
          <h2 className="caveat text-4xl font-bold text-gray-800 mb-2">Patient Registration</h2>
          <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl w-full mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl w-full bg-white rounded-3xl p-8 shadow-2xl mb-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input type="text" id="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input type="text" id="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input type="email" id="email" required value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input type="password" id="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" id="phone" required value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input type="date" id="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select id="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Address Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input type="text" id="address" required value={formData.address} onChange={handleChange} placeholder="123 Main Street" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input type="text" id="city" required value={formData.city} onChange={handleChange} placeholder="New York" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input type="text" id="state" required value={formData.state} onChange={handleChange} placeholder="NY" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                    <input type="text" id="zipCode" required value={formData.zipCode} onChange={handleChange} placeholder="10001" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Emergency Contact
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
                  <input type="text" id="emergencyContactName" required value={formData.emergencyContactName} onChange={handleChange} placeholder="Jane Doe" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
                    <select id="emergencyContactRelation" required value={formData.emergencyContactRelation} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors">
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone *</label>
                    <input type="tel" id="emergencyContactPhone" required value={formData.emergencyContactPhone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Medical History */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Medical History & Health Status
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
                  <select id="bloodGroup" required value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Existing Medical Conditions</label>
                  <textarea id="medicalConditions" value={formData.medicalConditions} onChange={handleChange} rows={3} placeholder="Diabetes, Hypertension, Asthma, etc." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                  <textarea id="currentMedications" value={formData.currentMedications} onChange={handleChange} rows={3} placeholder="List all current medications with dosage" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
                  <textarea id="allergies" value={formData.allergies} onChange={handleChange} rows={2} placeholder="Drug allergies, food allergies, etc." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Surgeries/Hospitalizations (Last 5 years)</label>
                  <textarea id="previousSurgeries" value={formData.previousSurgeries} onChange={handleChange} rows={3} placeholder="List any surgeries or hospital stays" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Insurance & Preferences */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Insurance & Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                  <input type="text" id="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} placeholder="Blue Cross, Aetna, etc." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                    <input type="text" id="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={handleChange} placeholder="Policy #" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group ID</label>
                    <input type="text" id="insuranceGroupId" value={formData.insuranceGroupId} onChange={handleChange} placeholder="Group ID" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Payment Method</label>
                  <select id="preferredPaymentMethod" value={formData.preferredPaymentMethod} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors">
                    <option value="">Select Payment Method</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Doctor/Specialist</label>
                  <input type="text" id="preferredDoctor" value={formData.preferredDoctor} onChange={handleChange} placeholder="Dr. Smith (Optional)" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Clinic Location</label>
                  <input type="text" id="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="Main Street Clinic (Optional)" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Best Days/Times for Appointments</label>
                  <input type="text" id="appointmentPreferences" value={formData.appointmentPreferences} onChange={handleChange} placeholder="e.g., Weekdays after 3 PM" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Legal Agreements & Signature */}
          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Legal Agreements & Digital Signature
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-start">
                    <input type="checkbox" id="privacyConsent" checked={formData.privacyConsent} onChange={handleChange} className="mt-1 w-5 h-5 text-teal-600 rounded" />
                    <label htmlFor="privacyConsent" className="ml-3 text-sm text-gray-700">
                      I agree to the <span className="text-teal-600 underline cursor-pointer">Privacy Policy</span> and understand that my health information will be protected under HIPAA compliance regulations.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input type="checkbox" id="treatmentConsent" checked={formData.treatmentConsent} onChange={handleChange} className="mt-1 w-5 h-5 text-teal-600 rounded" />
                    <label htmlFor="treatmentConsent" className="ml-3 text-sm text-gray-700">
                      I consent to medical treatment and authorize healthcare providers to perform necessary medical procedures.
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">Please Sign Below *</label>
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
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-4 px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
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

        {/* Navigation Buttons */}
        <div className="max-w-4xl w-full flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={previousStep}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl hover:bg-gray-300 transition-all duration-300"
            >
              <svg className="inline-block w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
              </svg>
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {currentStep === totalSteps ? 'Submit Registration' : 'Next'}
            {currentStep < totalSteps && (
              <svg className="inline-block w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Loading Modal */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-800">Submitting your registration...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
