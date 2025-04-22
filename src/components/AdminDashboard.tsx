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

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if the user is logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            // Redirect to the login page if not logged in
            router.push('/login');
        }
    }, [router]);

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
                <SidebarMenuButton href="/blogs">Blog Management</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div>Footer content</div>
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
