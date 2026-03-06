import ProfileForm from './ProfileForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch the user's existing profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back!</h1>
                <p className="mt-2 text-slate-500 max-w-2xl">
                    Manage your Job Bot settings and subscription below. Your profile data directly powers the Chrome Extension autocomplete.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form */}
                <div className="lg:col-span-2">
                    <ProfileForm initialData={profile} />
                </div>

                {/* Right Column: Active Subscription Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-5 bg-slate-50">
                            <h2 className="text-xl font-semibold text-slate-800">Subscription</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Plan</p>
                                    <p className="text-2xl font-bold text-slate-800 mt-1 mt-1">Free Tier</p>
                                </div>
                                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    Active
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start text-sm text-slate-600">
                                    <svg className="h-5 w-5 text-emerald-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Basic auto-applying
                                </li>
                                <li className="flex items-start text-sm text-slate-600 opacity-50">
                                    <svg className="h-5 w-5 text-slate-300 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Custom company blacklist
                                </li>
                                <li className="flex items-start text-sm text-slate-600 opacity-50">
                                    <svg className="h-5 w-5 text-slate-300 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Advanced AI question answering
                                </li>
                            </ul>

                            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-md">
                                Upgrade to Pro (₹999/mo)
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0a66c2]/5 rounded-2xl border border-[#0a66c2]/20 p-6">
                        <h3 className="font-semibold text-[#0a66c2] mb-2">Extension Connection</h3>
                        <p className="text-sm text-[#0a66c2]/80 leading-relaxed">
                            Ensure you are logged into this exact same account inside the Chrome Extension popup so it can securely access this profile data!
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
