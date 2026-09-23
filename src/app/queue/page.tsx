"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Trash2, Send, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/database';
import { toast } from 'sonner';

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load queue');
    else setPosts(data || []);
    setLoading(false);
  }

  async function publishPost(id: string) {
    setPublishingId(id);
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        body: JSON.stringify({ postId: id }),
      });
      if (!res.ok) throw new Error('Publishing failed');
      toast.success('Post published successfully!');
      await fetchPosts();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPublishingId(null);
    }
  }

  async function deletePost(id: string) {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else {
      toast.success('Post removed from queue');
      await fetchPosts();
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Approval Queue</h1>
          <p className="text-zinc-400">Review and approve AI-generated content before it goes live.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300 border border-zinc-700">
          <Clock className="w-3 h-3" />
          {posts.length} posts awaiting review
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="bg-zinc-900 border-zinc-800 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-white text-lg truncate max-w-[200px]">{post.topic}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500" 
                  onClick={() => deletePost(post.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {Object.keys(post.formatted_content).map(platform => (
                  <span key={platform} className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400 border border-zinc-700 uppercase">
                    {platform}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {post.media_urls.length > 0 && (
                <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden relative group">
                  <img src={post.media_urls[0]} alt="Post media" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-3">
                {Object.entries(post.formatted_content).map(([platform, content]: [string, any]) => (
                  <div key={platform} className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">{platform}</p>
                    <p className="text-sm text-zinc-300 line-clamp-3">{content.caption || content.tweet || content.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <Button 
                onClick={() => publishPost(post.id)} 
                disabled={publishingId === post.id}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                {publishingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publish Now
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="inline-flex p-4 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-500">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium text-white">Queue is empty</h3>
            <p className="text-zinc-400">All caught up! Go to the Studio to generate more content.</p>
          </div>
          <Button variant="outline" className="bg-transparent text-zinc-300 border-zinc-700" onClick={() => window.location.href='/create'}>
            Create Content
          </Button>
        </div>
      )}
    </div>
  );
}
