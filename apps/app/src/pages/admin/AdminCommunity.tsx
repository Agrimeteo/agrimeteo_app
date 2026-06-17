import React, { useEffect, useMemo, useState } from 'react';
import { EyeOff, Pencil, Shield, Trash2 } from 'lucide-react';
import {
  deleteModerationPost,
  fetchModerationPosts,
  moderateCommunityPost,
  subscribeToCommunityFeed,
} from '../../services/community';
import type { CommunityPost, CommunityPostType, CommunityStatus } from '../../types/community';

const AdminCommunity: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommunityPostType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CommunityStatus | 'all'>('all');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    status: 'published' as CommunityStatus,
  });

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const moderationPosts = await fetchModerationPosts({
          search,
          type: typeFilter,
          status: statusFilter,
        });
        setPosts(moderationPosts);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.error || 'Unable to load moderation posts.');
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const unsubscribe = subscribeToCommunityFeed(() => {
      void fetchModerationPosts({ search, type: typeFilter, status: statusFilter })
        .then(setPosts)
        .catch(() => undefined);
    });

    return unsubscribe;
  }, [search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      published: posts.filter((post) => post.status === 'published').length,
      hidden: posts.filter((post) => post.status === 'hidden').length,
      questions: posts.filter((post) => post.type === 'question').length,
    };
  }, [posts]);

  const openEditor = (post: CommunityPost) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title,
      content: post.content,
      status: post.status,
    });
  };

  const refreshPosts = async () => {
    const moderationPosts = await fetchModerationPosts({
      search,
      type: typeFilter,
      status: statusFilter,
    });
    setPosts(moderationPosts);
  };

  const saveModerationChanges = async () => {
    if (!selectedPost) {
      return;
    }

    try {
      setSaving(true);
      await moderateCommunityPost(selectedPost.id, editForm);
      await refreshPosts();
      setSelectedPost(null);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Unable to save moderation changes.');
    } finally {
      setSaving(false);
    }
  };

  const quickToggleStatus = async (post: CommunityPost) => {
    try {
      await moderateCommunityPost(post.id, {
        status: post.status === 'published' ? 'hidden' : 'published',
      });
      await refreshPosts();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Unable to change the moderation status.');
    }
  };

  const removePost = async (postId: string) => {
    try {
      await deleteModerationPost(postId);
      await refreshPosts();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Unable to delete this post.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-500">Published posts</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.published}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-500">Hidden posts</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.hidden}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-500">Questions needing guidance</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.questions}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search a title, author or text..."
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#13515e]"
          />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as CommunityPostType | 'all')}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#13515e]"
          >
            <option value="all">All types</option>
            <option value="question">Questions</option>
            <option value="tip">Tips</option>
            <option value="experience">Experiences</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as CommunityStatus | 'all')}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#13515e]"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
          Loading community moderation queue...
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#13515e]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#13515e]">
                      {post.type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-slate-900">{post.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {post.author_name} · {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                  <Shield size={18} />
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">{post.content}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                <span>{post.like_count} likes</span>
                <span>{post.comment_count} comments</span>
                {post.related_crop_name && <span>Crop: {post.related_crop_name}</span>}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openEditor(post)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#13515e] hover:text-[#13515e]"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => void quickToggleStatus(post)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#13515e] hover:text-[#13515e]"
                >
                  <EyeOff size={14} />
                  {post.status === 'published' ? 'Hide' : 'Publish'}
                </button>
                <button
                  onClick={() => void removePost(post.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          No community posts match the current moderation filter.
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Moderate community post</h3>
                <p className="text-sm text-slate-500">Edit the copy or change its visibility for the app.</p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                value={editForm.title}
                onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#13515e]"
              />
              <textarea
                value={editForm.content}
                onChange={(event) => setEditForm((current) => ({ ...current, content: event.target.value }))}
                rows={6}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#13515e]"
              />
              <select
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    status: event.target.value as CommunityStatus,
                  }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#13515e]"
              >
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <button
              onClick={() => void saveModerationChanges()}
              disabled={saving}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#13515e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#13515e]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Shield size={16} />
              {saving ? 'Saving...' : 'Save moderation changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommunity;
