import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Submission from '@/models/Submission'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { role, signatureBase64, ...formData } = body

    if (!signatureBase64) {
      return NextResponse.json({ error: 'Missing signatureBase64' }, { status: 400 })
    }

    // For Vercel/Cloud compatibility, we store the full Base64 in MongoDB 
    // instead of local files (which are temporary and read-only on Vercel).

    // Generate unique ID for NGOs
    let uniqueId = null
    if (role === 'NGO') {
      uniqueId = 'NGO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    }


    // Save to MongoDB
    const submission = new Submission({
      role: role || null,
      ...formData,
      signatureFilename: null,
      signatureBase64: signatureBase64,

      uniqueId: uniqueId,
      submittedAt: new Date(),
      status: 'pending'
    })

    await submission.save()

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      uniqueId: uniqueId,
      submissionId: submission._id
    })

  } catch (error: any) {
    console.error('Error submitting form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await dbConnect()
    const submissions = await Submission.find({}).sort({ submittedAt: -1 }).limit(50)
    return NextResponse.json({ submissions })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    )
  }
}
