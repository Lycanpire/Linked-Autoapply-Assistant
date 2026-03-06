'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveProfile(formData: FormData) {
    const supabase = await createClient()

    // Get current user session securely from the server
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    // Parse Blacklist array
    const blacklistRaw = formData.get('blacklist') as string
    const blacklistArray = blacklistRaw
        ? blacklistRaw.split(',').map(item => item.trim()).filter(Boolean)
        : []

    // Upsert the profile record
    const { error } = await supabase
        .from('profiles')
        .upsert({
            user_id: user.id, // Primary key links to auth.users
            phone: formData.get('phone'),
            email: formData.get('email'),
            experience: formData.get('experience'),
            current_ctc: formData.get('currentCtc'),
            expected_ctc: formData.get('expectedCtc'),
            notice_period: formData.get('noticePeriod'),
            blacklist: blacklistArray,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })

    if (error) {
        console.error('Error saving profile:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
