import { NextResponse } from 'next/server';

// This endpoint is no longer needed since admin auth now uses Supabase Auth.
// Keeping it as a redirect helper for backwards compatibility.
export async function POST() {
  return NextResponse.json(
    { error: 'Admin login via password is no longer supported. Please use your Supabase account with admin/moderator role.' },
    { status: 410 } // 410 Gone
  );
}
