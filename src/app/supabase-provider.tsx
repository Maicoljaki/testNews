"use client";

import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Database } from '@/lib/database.types'
import React, { useState, useEffect, createContext, useContext } from 'react';

const SupabaseContext = createContext<any>(undefined);

export function useSupabase() {
    const context = useContext(SupabaseContext)

    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider')
    }

    return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [supabaseClient] = useState(() =>
        createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    )

    return (
        <SupabaseContext.Provider value={supabaseClient}>
            <SessionContextProvider supabaseClient={supabaseClient} >
                {children}
            </SessionContextProvider>
        </SupabaseContext.Provider>
    )
}
