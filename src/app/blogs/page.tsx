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

interface BlogPost {
    id: string;
    image: string;
    title: string;
    description: string;
}

const BlogManagementPage = () => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [newImage, setNewImage] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState('');
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const { toast } = useToast()

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
        if (!newImage || !newTitle || !newDescription) {
            alert('Please fill in all fields.');
            return;
        }

        const newPost = {
            id: Math.random().toString(36).substring(2, 15),
            image: newImage,
            title: newTitle,
            description: newDescription,
        };

        const updatedPosts = [...blogPosts, newPost];
        setBlogPosts(updatedPosts);
        saveBlogPosts(updatedPosts);

        setNewImage('');
        setNewTitle('');
        setNewDescription('');
    };

    const handleEdit = (id: string) => {
        const postToEdit = blogPosts.find(post => post.id === id);
        if (postToEdit) {
            setEditingId(id);
            setEditedImage(postToEdit.image);
            setEditedTitle(postToEdit.title);
            setEditedDescription(postToEdit.description);
        }
    };

    const handleUpdate = () => {
        if (!editedImage || !editedTitle || !editedDescription) {
            alert('Please fill in all fields.');
            return;
        }

        const updatedPosts = blogPosts.map(post => {
            if (post.id === editingId) {
                return {
                    ...post,
                    image: editedImage,
                    title: editedTitle,
                    description: editedDescription,
                };
            }
            return post;
        });

        setBlogPosts(updatedPosts);
        saveBlogPosts(updatedPosts);

        setEditingId(null);
        setEditedImage('');
        setEditedTitle('');
        setEditedDescription('');
    };

    const handleDelete = (id: string) => {
        const updatedPosts = blogPosts.filter(post => post.id !== id);
        setBlogPosts(updatedPosts);
        saveBlogPosts(updatedPosts);
    };

    const handleSuggestKeywords = async () => {
        try {
            const blogContent = `${newTitle} ${newDescription}`;
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

    return (
        <div className="p-6">
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
                            Description
                        </label>
                        <Textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
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
                                    <TableHead>Description</TableHead>
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
                                        <TableCell>{post.description}</TableCell>
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
                                    Description
                                </label>
                                <Textarea
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
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
