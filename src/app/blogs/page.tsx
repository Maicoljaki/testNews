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
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { ImageIcon } from 'lucide-react';


interface BlogPost {
    id: string;
    image: string;
    title: string;
    content: string;
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

    useEffect(() => {
        loadBlogPosts();
    }, []);

    const loadBlogPosts = () => {
        try {
            const data = localStorage.getItem('blogPosts');
            if (data) {
                setBlogPosts(JSON.parse(data));
            }
        } catch (error) {
            console.error("Failed to load blog posts:", error);
            toast({
                title: "Error loading blog posts",
                description: "Please check the console for details.",
                variant: "destructive",
            })
        }
    };

    const saveBlogPosts = (posts: BlogPost[]) => {
        try {
            localStorage.setItem('blogPosts', JSON.stringify(posts));
        } catch (error) {
            console.error("Failed to save blog posts:", error);
            toast({
                title: "Error saving blog posts",
                description: "Please check the console for details.",
                variant: "destructive",
            })
        }
    };

    const handleCreate = () => {
        if (!newImage || !newTitle || !newContent) {
            alert('Please fill in all fields.');
            return;
        }

        const newPost = {
            id: Math.random().toString(36).substring(2, 15),
            image: newImage,
            title: newTitle,
            content: newContent,
        };

        const updatedPosts = [...blogPosts, newPost];
        setBlogPosts(updatedPosts);
        saveBlogPosts(updatedPosts);

        setNewImage('');
        setNewTitle('');
        setNewContent('');
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

    const handleUpdate = () => {
        if (!editedImage || !editedTitle || !editedContent) {
            alert('Please fill in all fields.');
            return;
        }

        const updatedPosts = blogPosts.map(post => {
            if (post.id === editingId) {
                return {
                    ...post,
                    image: editedImage,
                    title: editedTitle,
                    content: editedContent,
                };
            }
            return post;
        });

        setBlogPosts(updatedPosts);
        saveBlogPosts(updatedPosts);

        setEditingId(null);
        setEditedImage('');
        setEditedTitle('');
        setEditedContent('');
    };

    const handleDelete = (id: string) => {
        const updatedPosts = blogPosts.filter(post => post.id !== id);
        setBlogPosts(updatedPosts);
        saveBlogPosts(updatedPosts);
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
        } catch (error) {
            console.error("Failed to suggest keywords:", error);
            toast({
                title: "Error suggesting keywords",
                description: "Please check the console for details.",
                variant: "destructive",
            })
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
    
        if (!file) {
            toast({
                title: "No image selected",
                description: "Please select an image to upload.",
                variant: "destructive",
            });
            return;
        }
    
        try {
            const { data, error } = await supabaseClient.storage
                .from('blog-images')
                .upload(`${newTitle}-${file.name}`, file, {
                    cacheControl: '3600',
                    upsert: false
                });
    
            if (error) {
                console.error("Supabase image upload error:", error);
                toast({
                    title: "Image upload failed",
                    description: "There was an error uploading the image. Please try again.",
                    variant: "destructive",
                });
            } else {
                const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-images/${data.path}`;
                setNewImage(imageUrl);
                toast({
                    title: "Image uploaded successfully!",
                    description: "The image has been uploaded and is ready to use.",
                });
            }
        } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            toast({
                title: "Image upload failed",
                description: "There was an error uploading the image. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-foreground">
                        Image
                    </label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
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
