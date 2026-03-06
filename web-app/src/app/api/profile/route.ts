import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // 1. Validate the Session Token (automatically pulled from cookies by createClient)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized. Please log into the Job Bot extension.' },
            { status: 401 }
        )
    }

    // 2. Fetch the User's Profile Configuration
    const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('phone, email, current_ctc, expected_ctc, notice_period, experience, blacklist')
        .eq('user_id', user.id)
        .single()

    if (dbError || !profile) {
        return NextResponse.json(
            { error: 'Profile not found. Please configure your settings in the Dashboard.' },
            { status: 404 }
        )
    }

    // 3. (Phase 3 Roadmap) Check Razorpay Subscription Status here before returning data
    // const isSubscribed = await checkRazorpaySubscription(user.id)
    // if (!isSubscribed) return NextResponse.json({ error: 'Payment required' }, { status: 402 })

    // 4. Return data to the Chrome Extension
    return NextResponse.json({
        phone: profile.phone,
        email: profile.email,
        currentCtc: profile.current_ctc,
        expectedCtc: profile.expected_ctc,
        noticePeriod: profile.notice_period,
        experience: profile.experience,
        blacklist: profile.blacklist || []
    })
}
