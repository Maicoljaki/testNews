"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from "@/components/ui/table"
import { suggestKeywords } from '@/ai/flows/suggest-keywords';
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface BlogPost {
    id: string;
    image: string;
    title: string;
    content: string;
    user_id: string;
}

const BlogManagementPage = () => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [newImage, setNewImage] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState('');
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const { toast } = useToast()
    const supabaseClient = useSupabaseClient();
    const session = useSession();
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();


    useEffect(() => {
        const fetchUserId = async () => {
            // Fetch the user ID if the session is available
            if (session?.user?.id) {
                setUserId(session.user.id);
            }
        };

        fetchUserId();
    }, [session]);

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
                toast({
                    title: "Error fetching blog posts",
                    description: "Failed to load blog posts from Supabase. " + error.message,
                    variant: "destructive",
                });
            }

            if (data) {
                setBlogPosts(data);
            }
        } catch (error: any) {
            console.error("Unexpected error loading blog posts:", error.message);
            toast({
                title: "Unexpected error",
                description: "An unexpected error occurred while loading blog posts. " + error.message,
                variant: "destructive",
            });
        }
    };


    const saveBlogPosts = async () => {
        loadBlogPosts();
    };

    const handleCreate = async () => {
        if (!newImage || !newTitle || !newContent) {
            alert('Please fill in all fields.');
            return;
        }

        if (!userId) {
            console.error("User not authenticated.");
            toast({
                title: "Authentication Error",
                description: "User not authenticated. Please log in again.",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('blog_posts')
                .insert([{ image: newImage, title: newTitle, content: newContent, user_id: userId }])
                .select();

            if (error) {
                console.error("Error creating blog post:", error.message);
                toast({
                    title: "Error creating blog post",
                    description: "Failed to create blog post in Supabase. " + error.message,
                    variant: "destructive",
                });
            } else {
                setNewImage('');
                setNewTitle('');
                setNewContent('');
                await saveBlogPosts();
                toast({
                    title: "Blog post created!",
                    description: "The blog post was successfully created.",
                });
            }
        } catch (error: any) {
            console.error("Unexpected error creating blog post:", error.message);
            toast({
                title: "Unexpected error",
                description: "An unexpected error occurred while creating the blog post. " + error.message,
                variant: "destructive",
            });
        }
    };

    const handleEdit = (id: string) => {
        const postToEdit = blogPosts.find(post => post.id === id);
        if (postToEdit) {
            setEditingId(id);
            setEditedImage(postToEdit.image);
            setEditedTitle(postToEdit.title);
            setEditedContent(postToEdit.content);
        }
    };

    const handleUpdate = async () => {
        if (!editedImage || !editedTitle || !editedContent) {
            alert('Please fill in all fields.');
            return;
        }

         if (!userId) {
            console.error("User not authenticated.");
            toast({
                title: "Authentication Error",
                description: "User not authenticated. Please log in again.",
                variant: "destructive",
            });
            return;
        }


        if (!editingId) {
            console.error("No editing ID set.");
            toast({
                title: "Error updating blog post",
                description: "No editing ID was set. Please try again.",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('blog_posts')
                .update({ image: editedImage, title: editedTitle, content: editedContent, user_id: userId })
                .eq('id', editingId)
                .select();

            if (error) {
                console.error("Error updating blog post:", error.message);
                toast({
                    title: "Error updating blog post",
                    description: "Failed to update blog post in Supabase. " + error.message,
                    variant: "destructive",
                });
            } else {
                setEditingId(null);
                setEditedImage('');
                setEditedTitle('');
                setEditedContent('');
                await saveBlogPosts();
                toast({
                    title: "Blog post updated!",
                    description: "The blog post was successfully updated.",
                });
            }
        } catch (error: any) {
            console.error("Unexpected error updating blog post:", error.message);
            toast({
                title: "Unexpected error",
                description: "An unexpected error occurred while updating the blog post. " + error.message,
                variant: "destructive",
            });
        }
    };


    const handleDelete = async (id: string) => {
        try {
            const { data, error } = await supabaseClient
                .from('blog_posts')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Error deleting blog post:", error.message);
                toast({
                    title: "Error deleting blog post",
                    description: "Failed to delete blog post from Supabase. " + error.message,
                    variant: "destructive",
                });
            } else {
                await saveBlogPosts();
                toast({
                    title: "Blog post deleted!",
                    description: "The blog post was successfully deleted.",
                });
            }
        } catch (error: any) {
            console.error("Unexpected error deleting blog post:", error.message);
            toast({
                title: "Unexpected error",
                description: "An unexpected error occurred while deleting the blog post. " + error.message,
                variant: "destructive",
            });
        }
    };

    const handleSuggestKeywords = async () => {
        try {
            const blogContent = `${newTitle} ${newContent}`;
            const result = await suggestKeywords({ blogContent: blogContent });
            setKeywords(result.keywords);
            toast({
                title: "Keywords suggested!",
                description: "Check the keywords section below.",
            })
        } catch (error: any) {
            console.error("Failed to suggest keywords:", error.message);
            toast({
                title: "Error suggesting keywords",
                description: "Please check the console for details. " + error.message,
                variant: "destructive",
            })
        }
    };

    

    return (
        <div className="p-6">
             <Button onClick={() => router.push('/')} variant="secondary">
                Back to Dashboard
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">
                            Image URL
                        </label>
                        <Input
                            type="text"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            className="mt-1"
                        />
                        {newImage && (
                            <img
                                src={newImage}
                                alt="Uploaded"
                                className="mt-2 w-32 h-32 object-cover rounded"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">
                            Title
                        </label>
                        <Input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">
                            Content
                        </label>
                        <Textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleCreate}>Create Post</Button>
                        <Button type="button" variant="secondary" onClick={handleSuggestKeywords}>
                            Suggest Keywords
                        </Button>
                    </div>

                    {keywords.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-foreground">
                                Suggested Keywords
                            </label>
                            <ul className="list-disc pl-5 mt-2">
                                {keywords.map((keyword, index) => (
                                    <li key={index}>{keyword}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Blog Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableCaption>A list of your recent blog posts.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Content</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogPosts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            <img src={post.image} alt={post.title} className="w-20 h-20 object-cover rounded" />
                                        </TableCell>
                                        <TableCell>{post.title}</TableCell>
                                        <TableCell>{post.content}</TableCell>
                                        <TableCell className="text-right">
                                            {editingId === post.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button onClick={handleUpdate}>Update</Button>
                                                    <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Button onClick={() => handleEdit(post.id)}>Edit</Button>
                                                    <Button variant="destructive" onClick={() => handleDelete(post.id)}>Delete</Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {blogPosts.length === 0 && <p>No blog posts created yet.</p>}
                    </CardContent>
                </Card>
            </div>

            {editingId && (
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Blog Post</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground">
                                    Image URL
                                </label>
                                <Input
                                    type="text"
                                    value={editedImage}
                                    onChange={(e) => setEditedImage(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground">
                                    Title
                                </label>
                                <Input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground">
                                    Content
                                </label>
                                <Textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BlogManagementPage;
