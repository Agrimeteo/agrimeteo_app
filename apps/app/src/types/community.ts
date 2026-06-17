export type CommunityPostType = 'question' | 'tip' | 'experience';
export type CommunityStatus = 'published' | 'hidden';

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: CommunityStatus;
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
  status: CommunityStatus;
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

export interface CommunityPostUpdate extends Partial<CommunityPostInput> {
  status?: CommunityStatus;
}

export interface CommunityCommentInput {
  content: string;
  parent_comment_id?: string | null;
}

export interface CropOption {
  id: string;
  name: string;
  region?: string;
}
