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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"


interface BlogPost {
    id: string;
    image: string;
    title: string;
    content: string;
    user_id: string;
}


const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
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

    useEffect(() => {
        loadBlogPosts();
    }, []);

    const loadBlogPosts = async () => {
        try {
            const { data, error } = await supabaseClient
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching blog posts:", error.message);
            }

            if (data) {
                setBlogPosts(data);
            }
        } catch (error: any) {
            console.error("Unexpected error loading blog posts:", error.message);
        }
    };


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
      <div className="pl-64 p-6">
        {/* Main content area */}
        <h1>Welcome to the Admin Dashboard</h1>
        <p>Manage your blog content here.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
                <Card key={post.id}>
                    <CardHeader>
                        <CardTitle>{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <img
                            src={post.image}
                            alt={post.title}
                            className="mb-4 w-full h-40 object-cover rounded-md"
                        />
                        <p>{post.content.substring(0, 100)}...</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;

