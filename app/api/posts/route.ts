import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }); if (error) return NextResponse.json({ error: 'Could not load queue.' }, { status: 500 }); return NextResponse.json(data || []) }
