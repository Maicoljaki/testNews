"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const session = useSession();

    useEffect(() => {
        if (!session) {
            router.push('/login');
        }
    }, [session, router]);

    if (!session) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};
