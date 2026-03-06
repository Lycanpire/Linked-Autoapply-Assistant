'use client'

import { useState } from 'react'
import { saveProfile } from './actions'

type ProfileData = {
    phone: string | null
    email: string | null
    experience: string | null
    current_ctc: string | null
    expected_ctc: string | null
    notice_period: string | null
    blacklist: string[] | null
}

export default function ProfileForm({ initialData }: { initialData?: ProfileData | null }) {
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsSaving(true)
        setMessage('')

        try {
            const result = await saveProfile(formData)
            if (result.success) {
                setMessage('Settings saved successfully!')
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage('Failed to save settings: ' + result.error)
            }
        } catch (e) {
            setMessage('An error occurred. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-800">Job Bot Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Configure the data that will be automatically injected into your LinkedIn Easy Apply forms.</p>
            </div>

            <form action={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                    <div className="col-span-full mb-2">
                        <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2">Personal Details</h3>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            required
                            defaultValue={initialData?.phone || ''}
                            placeholder="+1234567890"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            defaultValue={initialData?.email || ''}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                        <input
                            type="number"
                            id="experience"
                            name="experience"
                            min="0"
                            required
                            defaultValue={initialData?.experience || ''}
                            placeholder="e.g. 4"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition-all"
                        />
                    </div>

                    <div className="col-span-full mt-4 mb-2">
                        <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2">Job Requirements</h3>
                    </div>

                    <div>
                        <label htmlFor="currentCtc" className="block text-sm font-medium text-slate-700 mb-1">Current CTC (Numbers only)</label>
                        <input
                            type="text"
                            id="currentCtc"
                            name="currentCtc"
                            required
                            defaultValue={initialData?.current_ctc || ''}
                            placeholder="e.g. 1500000"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="expectedCtc" className="block text-sm font-medium text-slate-700 mb-1">Expected CTC (Numbers only)</label>
                        <input
                            type="text"
                            id="expectedCtc"
                            name="expectedCtc"
                            required
                            defaultValue={initialData?.expected_ctc || ''}
                            placeholder="e.g. 2000000"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="noticePeriod" className="block text-sm font-medium text-slate-700 mb-1">Notice Period (Days)</label>
                        <input
                            type="number"
                            id="noticePeriod"
                            name="noticePeriod"
                            min="0"
                            required
                            defaultValue={initialData?.notice_period || ''}
                            placeholder="e.g. 30"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition-all"
                        />
                    </div>

                    <div className="col-span-full mt-4 mb-2">
                        <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2">Filters</h3>
                    </div>

                    <div className="col-span-full">
                        <label htmlFor="blacklist" className="block text-sm font-medium text-slate-700 mb-1">Company Blacklist</label>
                        <p className="text-xs text-slate-500 mb-2">Comma-separated list of company names to skip (e.g. paytm, sovos). Case insensitive.</p>
                        <textarea
                            id="blacklist"
                            name="blacklist"
                            rows={4}
                            defaultValue={initialData?.blacklist ? initialData.blacklist.join(', ') : ''}
                            placeholder="paytm, one 97, iris gst"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none transition-all font-sans resize-y"
                        ></textarea>
                    </div>

                </div>

                <div className="mt-10 flex items-center justify-end gap-6 pt-6 border-t border-slate-200">
                    {message && (
                        <p className={`text-sm font-medium ${message.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold py-2.5 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    )
}
