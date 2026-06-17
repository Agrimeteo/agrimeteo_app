import api from './api';
import { supabase } from './supabase';
import type {
  CommunityComment,
  CommunityCommentInput,
  CommunityPost,
  CommunityPostInput,
  CommunityPostType,
  CommunityPostUpdate,
  CommunityStatus,
} from '../types/community';

interface FeedFilters {
  search?: string;
  type?: CommunityPostType | 'all';
  status?: CommunityStatus | 'all';
}

export const fetchCommunityPosts = async (filters: FeedFilters = {}) => {
  const { data } = await api.get('/community', {
    params: {
      search: filters.search || undefined,
      type: filters.type && filters.type !== 'all' ? filters.type : undefined,
      status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    },
  });

  return (data.data ?? []) as CommunityPost[];
};

export const fetchModerationPosts = async (filters: FeedFilters = {}) => {
  const { data } = await api.get('/community/admin/posts', {
    params: {
      search: filters.search || undefined,
      type: filters.type && filters.type !== 'all' ? filters.type : undefined,
      status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    },
  });

  return (data.data ?? []) as CommunityPost[];
};

export const createCommunityPost = async (input: CommunityPostInput) => {
  const { data } = await api.post('/community', input);
  return data.data as CommunityPost;
};

export const updateCommunityPost = async (postId: string, input: CommunityPostUpdate) => {
  const { data } = await api.patch(`/community/${postId}`, input);
  return data.data as CommunityPost;
};

export const moderateCommunityPost = async (postId: string, input: CommunityPostUpdate) => {
  const { data } = await api.patch(`/community/admin/posts/${postId}`, input);
  return data.data as CommunityPost;
};

export const deleteCommunityPost = async (postId: string) => {
  await api.delete(`/community/${postId}`);
};

export const deleteModerationPost = async (postId: string) => {
  await api.delete(`/community/admin/posts/${postId}`);
};

export const addCommunityComment = async (postId: string, input: CommunityCommentInput) => {
  const { data } = await api.post(`/community/${postId}/comments`, input);
  return data.data as CommunityComment;
};

export const toggleCommunityLike = async (postId: string) => {
  const { data } = await api.post(`/community/${postId}/likes`);
  return data.data as { liked: boolean; post: CommunityPost };
};

// Realtime keeps the community feed feeling alive without forcing users
// to manually refresh the crop companion app every time someone reacts.
export const subscribeToCommunityFeed = (onChange: () => void) => {
  const channel = supabase
    .channel('community-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_likes' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};
