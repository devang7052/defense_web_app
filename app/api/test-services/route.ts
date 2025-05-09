import { testAI, testFirebase, testNewsApi } from '@/app/lib/service-test';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test all three services
    const firebaseTest = await testFirebase();
    const newsApiTest = await testNewsApi();
    const aiTest = await testAI();

    return NextResponse.json({
      firebase: firebaseTest,
      newsApi: newsApiTest,
      ai: aiTest
    });
  } catch (error) {
    console.error('Service test error:', error);
    return NextResponse.json(
      { error: 'Failed to test services' },
      { status: 500 }
    );
  }
}