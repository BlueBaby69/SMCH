"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, PlusCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BrandProfile } from '@/types/database';
import { toast } from 'sonner';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    const { data, error } = await supabase.from('brand_profiles').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to load profiles');
    else setProfiles(data || []);
    setLoading(false);
  }

  async function generateBrand() {
    if (!niche) return toast.error('Please enter a niche');
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-brand', {
        method: 'POST',
        body: JSON.stringify({ niche, targetAudienceDescription: audience }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      toast.success(`Generated brand: ${data.brand.brand_name}`);
      setNiche('');
      setAudience('');
      await fetchProfiles();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Niche Brand Manager</h1>
          <p className="text-zinc-400">Generate and manage AI-powered brand identities.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Niche Wizard
          </CardTitle>
          <CardDescription className="text-zinc-500">Enter a niche to generate a full brand kit (names, bios, handles).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Niche</label>
              <Input 
                placeholder="e.g. Sustainable Luxury Watches, AI Productivity Tools" 
                className="bg-zinc-950 border-zinc-700 text-white"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Target Audience</label>
              <Input 
                placeholder="e.g. Gen Z entrepreneurs, Corporate executives" 
                className="bg-zinc-950 border-zinc-700 text-white"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={generateBrand} 
            disabled={generating} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Kit...</> : <><PlusCircle className="w-4 h-4 mr-2" /> Generate Brand Assets</>}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <Card key={profile.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-white">{profile.brand_name}</CardTitle>
                  <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider">{profile.niche}</div>
                </div>
                <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-zinc-800">
                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Instagram Bio</label>
                    <div className="flex gap-2">
                      <p className="text-sm text-zinc-300 flex-1">{profile.bio_instagram || 'N/A'}</p>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyToClipboard(profile.bio_instagram || '')}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">X/Twitter Bio</label>
                    <div className="flex gap-2">
                      <p className="text-sm text-zinc-300 flex-1">{profile.bio_twitter || 'N/A'}</p>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyToClipboard(profile.bio_twitter || '')}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4 bg-zinc-900/30">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Handle Ideas</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.handle_ideas.map((h, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300 border border-zinc-700">
                          {h}
                          <button onClick={() => copyToClipboard(h)} className="hover:text-white">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Avatar Prompt</label>
                    <p className="text-xs text-zinc-400 italic line-clamp-2">{profile.avatar_prompt || 'N/A'}</p>
                    <Button size="sm" variant="link" className="h-auto p-0 text-xs text-indigo-400" onClick={() => copyToClipboard(profile.avatar_prompt || '')}>Copy Prompt</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: any, className?: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}
