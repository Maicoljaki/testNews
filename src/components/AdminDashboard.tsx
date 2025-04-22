"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react";

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const session = useSession();
    const supabaseClient = useSupabaseClient();

    useEffect(() => {
        // Check if the user is logged in
        if (session) {
            setIsLoggedIn(true);
        } else {
            // Redirect to the login page if not logged in
            router.push('/login');
        }
    }, [session, router]);

    const handleSignOut = async () => {
        await supabaseClient.auth.signOut();
        router.push('/login');
    };

    if (!isLoggedIn) {
        // This is a loading state or the redirect will happen quickly
        return <div>Checking login status...</div>;
    }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2>Content Hub Admin</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/blogs">
                 <FileText className="mr-2 h-4 w-4" /> Blog Management
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <Button onClick={handleSignOut} variant="outline">
                Sign Out
            </Button>
        </SidebarFooter>
      </Sidebar>
      <div className="pl-64">
        {/* Main content area */}
        <h1>Welcome to the Admin Dashboard</h1>
        <p>Manage your blog content here.</p>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
