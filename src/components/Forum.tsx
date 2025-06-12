import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, repliesRes] = await Promise.all([
        supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('forum_replies').select('*').order('created_at', { ascending: true })
      ]);

      setPosts(postsRes.data || []);
      setReplies(repliesRes.data || []);
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: 'Not authenticated', description: 'Please log in to post.', variant: 'destructive' });
      return;
    }

    const { data: userInfo } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    let uploadedUrl = '';
    if (image) {
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(`public/post-${Date.now()}`, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        toast({ title: '❌ Image upload failed', description: error.message, variant: 'destructive' });
        return;
      }

      const { publicUrl } = supabase.storage.from('forum-images').getPublicUrl(data.path);
      uploadedUrl = publicUrl;
      setImageUrl(publicUrl);
    }

    const { error: insertError } = await supabase.from('forum_posts').insert({
      title: newTitle,
      content: newContent,
      author_email: user.email || '',
      author_name: userInfo?.name || user.email
    });

    if (insertError) {
      toast({ title: '❌ Failed to create post', description: insertError.message, variant: 'destructive' });
      return;
    }

    setNewTitle('');
    setNewContent('');
    setImage(null);
    setImageUrl('');
    setShowNewPost(false);
    fetchData();

    if (uploadedUrl) {
      toast({ title: '✅ Image uploaded', description: `Image is available at: ${uploadedUrl}` });
    }
  };

  const addReply = async (postId: string) => {
    const content = replyContent[postId];
    if (!content?.trim()) return;

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: 'Not authenticated', description: 'Please log in to reply.', variant: 'destructive' });
      return;
    }

    const { data: userInfo } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    try {
      await supabase.from('forum_replies').insert({
        post_id: postId,
        content,
        author_email: user.email || '',
        author_name: userInfo?.name || user.email
      });

      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      fetchData();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const getPostReplies = (postId: string) => replies.filter(r => r.post_id === postId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6848c10115c1e7aea64f3606_1749599147143_6f59f594.jpg"
              alt="Phytoclinic Logo"
              className="h-12 w-auto object-contain"
            />
            <h1 className="text-4xl font-bold text-green-700">Q&A Forum</h1>
          </div>
          <Button onClick={() => setShowNewPost(!showNewPost)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Question
          </Button>
        </div>

        {showNewPost && (
          <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Question title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Describe your question in detail..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
              />
              <Input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
              {imageUrl && <img src={imageUrl} alt="Preview" className="rounded mt-2 max-w-xs" />}
              <div className="flex gap-2">
                <Button onClick={createPost} className="bg-green-600 hover:bg-green-700">
                  Post Question
                </Button>
                <Button onClick={() => setShowNewPost(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">Loading forum posts...</div>
        ) : (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No questions yet. Be the first to ask!</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => {
                const postReplies = getPostReplies(post.id);
                return (
                  <Card key={post.id} className="border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">By {post.author_name || 'Anonymous'} • {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{post.content}</p>

                      {postReplies.length > 0 && (
                        <div className="border-t pt-4 space-y-3">
                          <h4 className="font-medium text-gray-800">Answers ({postReplies.length})</h4>
                          {postReplies.map((reply) => (
                            <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-700 font-semibold text-sm">{reply.author_name || 'Anonymous'}</p>
                              <p className="text-gray-700 mt-1">{reply.content}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Textarea
                          placeholder="Write your answer..."
                          value={replyContent[post.id] || ''}
                          onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          rows={2}
                          className="flex-1"
                        />
                        <Button onClick={() => addReply(post.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
