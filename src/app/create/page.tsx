"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BrandProfile } from '@/types/database';
import { toast } from 'sonner';

export default function CreatePage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [topic, setTopic] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'twitter', 'tiktok']);
  const [tone, setTone] = useState('Engaging');
  const [mediaUrl, setMediaUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    const { data } = await supabase.from('brand_profiles').select('id, brand_name').order('created_at', { ascending: false });
    if (data) setProfiles(data);
  }

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]);
  };

  async function generateContent() {
    if (!selectedProfile || !topic) return toast.error('Profile and Topic are required');
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          brandProfileId: selectedProfile, 
          topic, 
          rawInput, 
          platforms, 
          tone, 
          mediaUrl 
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      toast.success('Content generated and added to queue!');
      setTopic('');
      setRawInput('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">AI Content Studio</h1>
        <p className="text-zinc-400">Convert a simple topic into platform-optimized social posts.</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Post Architect
          </CardTitle>
          <CardDescription className="text-zinc-500">Configure your content and let the AI handle the tailoring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Select Brand</label>
              <select 
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
              >
                <option value="">Choose a Brand...</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.brand_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Content Tone</label>
              <select 
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="Professional">Professional</option>
                <option value="Engaging">Engaging</option>
                <option value="Humorous">Humorous</option>
                <option value="Controversial">Controversial</option>
                <option value="Inspirational">Inspirational</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Topic / Hook</label>
            <Input 
              placeholder="e.g. 5 Tips for Sustainable Living" 
              className="bg-zinc-950 border-zinc-700 text-white"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Detailed Input / Context</label>
            <Textarea 
              placeholder="Add specific points, data, or a story you want included..." 
              className="bg-zinc-950 border-zinc-700 text-white min-h-[120px]"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Target Platforms</label>
            <div className="flex flex-wrap gap-3">
              {['instagram', 'twitter', 'tiktok', 'youtube', 'facebook', 'linkedin'].map(p => (
                <div 
                  key={p} 
                  onClick={() => togglePlatform(p)}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    platforms.includes(p) 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Media URL (Optional)</label>
            <Input 
              placeholder="https://..." 
              className="bg-zinc-950 border-zinc-700 text-white"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>

          <Button 
            onClick={generateContent} 
            disabled={generating} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg"
          >
            {generating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Content...</> : <><Send className="w-5 h-5 mr-2" /> Send to Approval Queue</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
