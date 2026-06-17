export type CommunityPostType = 'question' | 'tip' | 'experience';
export type CommunityRecordStatus = 'published' | 'hidden';

export interface CommunityPostRecord {
  id: string;
  user_id: string;
  related_crop_id: string | null;
  type: CommunityPostType;
  title: string;
  content: string;
  status: CommunityRecordStatus;
  created_at: string;
  updated_at: string;
}

export interface CommunityCommentRecord {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: CommunityRecordStatus;
  created_at: string;
  updated_at: string;
}

export interface CommunityLikeRecord {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: CommunityRecordStatus;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
  is_owner: boolean;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  related_crop_id: string | null;
  related_crop_name: string | null;
  type: CommunityPostType;
  title: string;
  content: string;
  status: CommunityRecordStatus;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
  is_owner: boolean;
  liked_by_current_user: boolean;
  like_count: number;
  comment_count: number;
  comments: CommunityComment[];
}

export interface CommunityPostInput {
  title: string;
  content: string;
  type: CommunityPostType;
  related_crop_id?: string | null;
}

export interface CommunityPostUpdate {
  title?: string;
  content?: string;
  type?: CommunityPostType;
  related_crop_id?: string | null;
  status?: CommunityRecordStatus;
}

export interface CommunityCommentInput {
  content: string;
  parent_comment_id?: string | null;
}

export interface CommunityCommentUpdate {
  content?: string;
  status?: CommunityRecordStatus;
}

export interface CommunityListOptions {
  search?: string;
  type?: CommunityPostType | 'all';
  status?: CommunityRecordStatus | 'all';
  limit?: number;
  includeHidden?: boolean;
}
