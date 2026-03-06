import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function signout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full mb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold">
                                J
                            </div>
                            <span className="font-semibold text-xl text-slate-800 tracking-tight">Job Bot SaaS</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
                            <form action={signout}>
                                <button className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium">
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {children}
            </main>
        </div>
    )
}
