import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Pencil,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import {
  addCommunityComment,
  createCommunityPost,
  deleteCommunityPost,
  fetchCommunityPosts,
  subscribeToCommunityFeed,
  toggleCommunityLike,
  updateCommunityPost,
} from '../../services/community';
import { useAuth } from '../../context/AuthContext';
import type { CommunityComment, CommunityPost, CommunityPostType, CropOption } from '../../types/community';

const postTypeLabels: Record<CommunityPostType, string> = {
  question: 'Question',
  tip: 'Tip',
  experience: 'Experience',
};

const typeAccentClasses: Record<CommunityPostType, string> = {
  question: 'bg-sky-100 text-sky-700',
  tip: 'bg-emerald-100 text-emerald-700',
  experience: 'bg-amber-100 text-amber-700',
};

const Community: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [crops, setCrops] = useState<CropOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommunityPostType | 'all'>('all');
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyTarget, setReplyTarget] = useState<{ postId: string; commentId: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    type: 'question' as CommunityPostType,
    related_crop_id: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [postsData, cropsResponse] = await Promise.all([
          fetchCommunityPosts({ search, type: typeFilter }),
          api.get('/crops'),
        ]);

        setPosts(postsData);
        setCrops((cropsResponse.data?.data ?? []) as CropOption[]);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.error || 'Unable to load the community feed.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [search, typeFilter]);

  useEffect(() => {
    const unsubscribe = subscribeToCommunityFeed(() => {
      void fetchCommunityPosts({ search, type: typeFilter })
        .then(setPosts)
        .catch(() => undefined);
    });

    return unsubscribe;
  }, [search, typeFilter]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    );
  }, [posts]);

  const resetComposer = () => {
    setEditingPostId(null);
    setFormState({
      title: '',
      content: '',
      type: 'question',
      related_crop_id: '',
    });
  };

  const handleSubmitPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        title: formState.title,
        content: formState.content,
        type: formState.type,
        related_crop_id: formState.related_crop_id || null,
      };

      if (editingPostId) {
        await updateCommunityPost(editingPostId, payload);
        setSuccessMessage('Your post has been updated.');
      } else {
        await createCommunityPost(payload);
        setSuccessMessage('Your community post is now live.');
      }

      resetComposer();
      const nextPosts = await fetchCommunityPosts({ search, type: typeFilter });
      setPosts(nextPosts);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Unable to save the post right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setErrorMessage('');
      await deleteCommunityPost(postId);
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Unable to delete this post.');
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const result = await toggleCommunityLike(postId);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === postId ? result.post : post)),
      );
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Unable to update the like.');
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const content = commentDrafts[postId]?.trim();
    if (!content) {
      return;
    }

    try {
      setErrorMessage('');
      await addCommunityComment(postId, {
        content,
        parent_comment_id: replyTarget?.postId === postId ? replyTarget.commentId : null,
      });

      setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: '' }));
      setReplyTarget(null);
      const nextPosts = await fetchCommunityPosts({ search, type: typeFilter });
      setPosts(nextPosts);
      setExpandedPosts((current) => ({ ...current, [postId]: true }));
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Unable to publish your comment.');
    }
  };

  const startEditingPost = (post: CommunityPost) => {
    setEditingPostId(post.id);
    setFormState({
      title: post.title,
      content: post.content,
      type: post.type,
      related_crop_id: post.related_crop_id || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderComments = (post: CommunityPost, parentCommentId: string | null = null, depth = 0) => {
    const comments = post.comments.filter((comment) => comment.parent_comment_id === parentCommentId);

    if (comments.length === 0) {
      return null;
    }

    return (
      <div className={`space-y-3 ${depth > 0 ? 'ml-4 border-l border-slate-200 pl-4' : ''}`}>
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{comment.author_name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setReplyTarget({ postId: post.id, commentId: comment.id });
                  setExpandedPosts((current) => ({ ...current, [post.id]: true }));
                }}
                className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Reply
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{comment.content}</p>
            {renderComments(post, comment.id, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary via-[#1c6776] to-[#2f8f73] px-5 py-6 text-white shadow-xl shadow-primary/15">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Community</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight">Grow together with the AgroSmart network</h1>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Ask questions, share field lessons, or post practical tips linked to one of your crops.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <Users size={24} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitPost} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingPostId ? 'Edit your post' : 'Share with the community'}
            </h2>
            <p className="text-sm text-slate-500">
              This composer is already wired for the crop module through the optional linked crop field.
            </p>
          </div>
          {editingPostId && (
            <button
              type="button"
              onClick={resetComposer}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <input
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
              placeholder="Post title"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
            <select
              value={formState.type}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  type: event.target.value as CommunityPostType,
                }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="question">Question</option>
              <option value="tip">Tip</option>
              <option value="experience">Experience</option>
            </select>
          </div>

          <textarea
            value={formState.content}
            onChange={(event) => setFormState((current) => ({ ...current, content: event.target.value }))}
            placeholder="What would you like to share with other growers?"
            rows={5}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
          />

          <select
            value={formState.related_crop_id}
            onChange={(event) => setFormState((current) => ({ ...current, related_crop_id: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Link to a crop (optional)</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Send size={16} />
          {submitting ? 'Saving...' : editingPostId ? 'Update post' : 'Publish post'}
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles, questions, tips..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as CommunityPostType | 'all')}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="all">All posts</option>
          <option value="question">Questions</option>
          <option value="tip">Tips</option>
          <option value="experience">Experiences</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
          Loading community feed...
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          No posts match this filter yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => {
            const isExpanded = expandedPosts[post.id] ?? false;

            return (
              <article key={post.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${typeAccentClasses[post.type]}`}>
                        {postTypeLabels[post.type]}
                      </span>
                      {post.related_crop_name && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          Linked crop: {post.related_crop_name}
                        </span>
                      )}
                      {post.status === 'hidden' && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                          Hidden
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">{post.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {post.author_name} · {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>

                  {post.is_owner && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => startEditingPost(post)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-primary hover:text-primary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => void handleDeletePost(post.id)}
                        className="rounded-xl border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-700">{post.content}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => void handleToggleLike(post.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      post.liked_by_current_user
                        ? 'bg-red-50 text-red-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Heart size={16} className={post.liked_by_current_user ? 'fill-current' : ''} />
                    {post.like_count}
                  </button>
                  <button
                    onClick={() =>
                      setExpandedPosts((current) => ({ ...current, [post.id]: !isExpanded }))
                    }
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    <MessageCircle size={16} />
                    {post.comment_count}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                    {replyTarget?.postId === post.id && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <ShieldAlert size={14} />
                        Reply mode enabled
                      </div>
                    )}

                    <div className="space-y-3">
                      {renderComments(post)}
                      {post.comments.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                          No comments yet. Be the first to reply.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <textarea
                        value={commentDrafts[post.id] ?? ''}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({
                            ...current,
                            [post.id]: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder={
                          replyTarget?.postId === post.id
                            ? 'Write your reply...'
                            : 'Add a helpful comment...'
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                      />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                          {replyTarget?.postId === post.id
                            ? 'Your reply will notify the original commenter.'
                            : 'New comments create notifications for the post owner.'}
                        </p>
                        <div className="flex items-center gap-2">
                          {replyTarget?.postId === post.id && (
                            <button
                              onClick={() => setReplyTarget(null)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                            >
                              Cancel reply
                            </button>
                          )}
                          <button
                            onClick={() => void handleCommentSubmit(post.id)}
                            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Community;
