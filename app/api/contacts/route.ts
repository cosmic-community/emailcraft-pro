import { NextRequest, NextResponse } from 'next/server'
import { createContact, getContacts } from '@/lib/cosmic'

export async function GET() {
  try {
    const contacts = await getContacts()
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Add current date as subscription date if not provided
    if (!data.date_subscribed) {
      data.date_subscribed = new Date().toISOString().split('T')[0]
    }

    const contact = await createContact(data)
    
    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}