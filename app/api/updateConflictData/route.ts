import { NextResponse } from 'next/server';
import { updateConflictData } from '@/app/lib/conflictData';

// Simple API route to update conflict data - no token required as requested
export async function GET() {
  try {
    // Update the conflict data
    const updatedData = await updateConflictData();
    
    return NextResponse.json({
      success: true,
      message: 'Conflict data updated successfully',
      timestamp: updatedData.lastUpdated
    });
  } catch (error) {
    console.error('Failed to update conflict data:', error);
    return NextResponse.json(
      { error: 'Failed to update conflict data' },
      { status: 500 }
    );
  }
}