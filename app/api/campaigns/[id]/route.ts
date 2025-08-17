// app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCosmic } from '@/lib/cosmic'

const cosmic = getCosmic()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updateData = await request.json()

    // Update the campaign in Cosmic
    const { object: updatedCampaign } = await cosmic.objects.updateOne(id, updateData)

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete the campaign from Cosmic
    await cosmic.objects.deleteOne(id)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}