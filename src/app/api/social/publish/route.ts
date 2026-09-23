import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  let postId;
  try {
    const body = await req.json();
    postId = body.postId;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*, brand_profiles(*)')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const brandProfile = post.brand_profiles;
    const formattedContent = post.formatted_content;

    const primaryCaption = formattedContent.instagram?.caption || 
                           formattedContent.twitter?.tweet || 
                           formattedContent.tiktok?.caption || 
                           'Check out our latest post!';

    const platforms = Object.keys(formattedContent).filter(p => 
      ['instagram', 'twitter', 'youtube', 'tiktok', 'facebook', 'linkedin'].includes(p)
    );

    const response = await fetch('https://api.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`
      },
      body: JSON.stringify({
        post: primaryCaption,
        platforms: platforms,
        mediaUrls: post.media_urls,
        profileKey: brandProfile?.ayrshare_profile_key,
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Ayrshare API error');
    }

    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        ayrshare_post_id: result.id,
      })
      .eq('id', postId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, ayrshareId: result.id });

  } catch (error: any) {
    console.error('Publish Error:', error);
    
    if (postId) {
      await supabaseAdmin
        .from('posts')
        .update({ 
          status: 'failed', 
          error_message: error.message 
        })
        .eq('id', postId);
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
