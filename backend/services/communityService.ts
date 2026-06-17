import { supabaseServiceClient } from '../config/supabase.js';
import { createNotification } from './notificationService.js';
import type {
  CommunityComment,
  CommunityCommentInput,
  CommunityCommentRecord,
  CommunityCommentUpdate,
  CommunityLikeRecord,
  CommunityListOptions,
  CommunityPost,
  CommunityPostInput,
  CommunityPostRecord,
  CommunityPostUpdate,
  CommunityRecordStatus,
} from '../types/community.js';

type Actor = {
  id: string;
  role?: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type CropRow = {
  id: string;
  name?: string | null;
  crop_type?: string | null;
  user_id?: string | null;
};

const COMMUNITY_POST_LIMIT = 150;
const COMMUNITY_COMMENT_LIMIT = 400;

const createHttpError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

const isCommunityPostType = (value: string): value is CommunityPostRecord['type'] =>
  ['question', 'tip', 'experience'].includes(value);

const isCommunityStatus = (value: string): value is CommunityRecordStatus =>
  ['published', 'hidden'].includes(value);

const normalizeText = (value: string | null | undefined) => value?.trim() ?? '';

const assertValidPostPayload = (input: CommunityPostInput | CommunityPostUpdate, forUpdate = false) => {
  if (!forUpdate || input.title !== undefined) {
    const title = normalizeText(input.title);
    if (!forUpdate && !title) {
      throw createHttpError('A title is required for a community post.', 400);
    }
    if (title && title.length > 120) {
      throw createHttpError('The post title must stay under 120 characters.', 400);
    }
  }

  if (!forUpdate || input.content !== undefined) {
    const content = normalizeText(input.content);
    if (!forUpdate && !content) {
      throw createHttpError('A message is required for a community post.', 400);
    }
    if (content && content.length > 1500) {
      throw createHttpError('The post content must stay under 1500 characters.', 400);
    }
  }

  if (input.type !== undefined && !isCommunityPostType(input.type)) {
    throw createHttpError('Unsupported community post type.', 400);
  }

  if ('status' in input && input.status !== undefined && !isCommunityStatus(input.status)) {
    throw createHttpError('Unsupported community post status.', 400);
  }
};

const assertValidCommentPayload = (input: CommunityCommentInput | CommunityCommentUpdate, forUpdate = false) => {
  if (!forUpdate || input.content !== undefined) {
    const content = normalizeText(input.content);
    if (!forUpdate && !content) {
      throw createHttpError('A comment message is required.', 400);
    }
    if (content && content.length > 1000) {
      throw createHttpError('Comments must stay under 1000 characters.', 400);
    }
  }

  if ('status' in input && input.status !== undefined && !isCommunityStatus(input.status)) {
    throw createHttpError('Unsupported community comment status.', 400);
  }
};

const getProfileDisplayName = (profile?: ProfileRow | null) => {
  return profile?.full_name?.trim() || 'Community member';
};

const getNameFromFields = (fullName?: string | null) => {
  return fullName?.trim() || 'Community member';
};

const getCropDisplayName = (crop?: CropRow | null) => {
  return crop?.name?.trim() || crop?.crop_type?.trim() || null;
};

const getCropById = async (cropId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('crops')
    .select('*')
    .eq('id', cropId)
    .maybeSingle();

  if (error) {
    throw createHttpError(`Unable to validate the linked crop: ${error.message}`, 400);
  }

  return data;
};

const assertCropAccess = async (cropId: string, actor: Actor) => {
  const crop = await getCropById(cropId);

  if (!crop) {
    throw createHttpError('The selected crop could not be found.', 404);
  }

  if (actor.role !== 'admin' && crop.user_id !== actor.id) {
    throw createHttpError('You can only link posts to your own crops.', 403);
  }

  return crop;
};

const getPostRecord = async (postId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();

  if (error) {
    throw createHttpError(`Unable to load the community post: ${error.message}`, 400);
  }

  if (!data) {
    throw createHttpError('Community post not found.', 404);
  }

  return data;
};

const getCommentRecord = async (commentId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('community_comments')
    .select('*')
    .eq('id', commentId)
    .maybeSingle();

  if (error) {
    throw createHttpError(`Unable to load the community comment: ${error.message}`, 400);
  }

  if (!data) {
    throw createHttpError('Community comment not found.', 404);
  }

  return data;
};

const canAccessPost = (post: CommunityPostRecord, viewer: Actor) => {
  if (viewer.role === 'admin') {
    return true;
  }

  return post.status === 'published' || post.user_id === viewer.id;
};

const filterVisibleComments = (
  comments: CommunityCommentRecord[],
  viewer: Actor,
  includeHidden: boolean,
) => {
  return comments.filter((comment) => {
    if (includeHidden || viewer.role === 'admin') {
      return true;
    }

    return comment.status === 'published' || comment.user_id === viewer.id;
  });
};

const hydratePosts = async (
  posts: CommunityPostRecord[],
  viewer: Actor,
  includeHiddenComments = false,
): Promise<CommunityPost[]> => {
  if (posts.length === 0) {
    return [];
  }

  const postIds = posts.map((post) => post.id);
  const postAuthorIds = posts.map((post) => post.user_id);
  const relatedCropIds = posts
    .map((post) => post.related_crop_id)
    .filter((value): value is string => Boolean(value));

  const commentsPromise = supabaseServiceClient
    .from('community_comments')
    .select('*')
    .in('post_id', postIds)
    .order('created_at', { ascending: true })
    .limit(COMMUNITY_COMMENT_LIMIT);

  const likesPromise = supabaseServiceClient
    .from('community_likes')
    .select('*')
    .in('post_id', postIds);

  const cropsPromise = relatedCropIds.length
    ? supabaseServiceClient.from('crops').select('*').in('id', relatedCropIds)
    : Promise.resolve({ data: [] as CropRow[], error: null });

  const { data: commentsData, error: commentsError } = await commentsPromise;
  if (commentsError) {
    throw createHttpError(`Unable to load community comments: ${commentsError.message}`, 400);
  }

  const visibleComments = filterVisibleComments(
    (commentsData as CommunityCommentRecord[] | null) ?? [],
    viewer,
    includeHiddenComments,
  );
  const commentAuthorIds = visibleComments.map((comment) => comment.user_id);

  const profileIds = [...new Set([...postAuthorIds, ...commentAuthorIds])];
  const profilesPromise = profileIds.length
    ? supabaseServiceClient.from('profiles').select('id, full_name').in('id', profileIds)
    : Promise.resolve({ data: [] as ProfileRow[], error: null });

  const [{ data: likesData, error: likesError }, { data: profilesData, error: profilesError }, { data: cropsData, error: cropsError }] =
    await Promise.all([likesPromise, profilesPromise, cropsPromise]);

  if (likesError) {
    throw createHttpError(`Unable to load community likes: ${likesError.message}`, 400);
  }

  if (profilesError) {
    throw createHttpError(`Unable to load community authors: ${profilesError.message}`, 400);
  }

  if (cropsError) {
    throw createHttpError(`Unable to load linked crops: ${cropsError.message}`, 400);
  }

  const profileMap = new Map<string, ProfileRow>();
  ((profilesData as ProfileRow[] | null) ?? []).forEach((profile) => profileMap.set(profile.id, profile));

  const cropMap = new Map<string, CropRow>();
  ((cropsData as CropRow[] | null) ?? []).forEach((crop) => cropMap.set(crop.id, crop));

  const commentsByPostId = new Map<string, CommunityComment[]>();
  visibleComments.forEach((comment) => {
    const hydratedComment: CommunityComment = {
      ...comment,
      author_name: getProfileDisplayName(profileMap.get(comment.user_id)),
      author_avatar: undefined,
      is_owner: comment.user_id === viewer.id,
    };

    const currentComments = commentsByPostId.get(comment.post_id) ?? [];
    currentComments.push(hydratedComment);
    commentsByPostId.set(comment.post_id, currentComments);
  });

  const likesByPostId = new Map<string, CommunityLikeRecord[]>();
  ((likesData as CommunityLikeRecord[] | null) ?? []).forEach((like) => {
    const currentLikes = likesByPostId.get(like.post_id) ?? [];
    currentLikes.push(like);
    likesByPostId.set(like.post_id, currentLikes);
  });

  return posts.map((post) => {
    const comments = commentsByPostId.get(post.id) ?? [];
    const likes = likesByPostId.get(post.id) ?? [];

    return {
      ...post,
      related_crop_name: post.related_crop_id ? getCropDisplayName(cropMap.get(post.related_crop_id)) : null,
      author_name: getProfileDisplayName(profileMap.get(post.user_id)),
      author_avatar: undefined,
      is_owner: post.user_id === viewer.id,
      liked_by_current_user: likes.some((like) => like.user_id === viewer.id),
      like_count: likes.length,
      comment_count: comments.length,
      comments,
    };
  });
};

export const listCommunityPosts = async (viewer: Actor, options: CommunityListOptions = {}) => {
  const { search = '', type = 'all', status = 'all', limit = COMMUNITY_POST_LIMIT, includeHidden = false } = options;

  const { data, error } = await supabaseServiceClient
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw createHttpError(`Unable to load community posts: ${error.message}`, 400);
  }

  let posts = (data as CommunityPostRecord[] | null) ?? [];

  posts = posts.filter((post) => (includeHidden || viewer.role === 'admin' ? true : canAccessPost(post, viewer)));

  if (type !== 'all') {
    posts = posts.filter((post) => post.type === type);
  }

  if (status !== 'all') {
    posts = posts.filter((post) => post.status === status);
  }

  const normalizedSearch = search.trim().toLowerCase();
  if (normalizedSearch) {
    posts = posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.content.toLowerCase().includes(normalizedSearch)
      );
    });
  }

  return hydratePosts(posts, viewer, includeHidden);
};

export const getCommunityPost = async (postId: string, viewer: Actor) => {
  const post = await getPostRecord(postId);

  if (!canAccessPost(post, viewer)) {
    throw createHttpError('You are not allowed to view this community post.', 403);
  }

  const [hydratedPost] = await hydratePosts([post], viewer, viewer.role === 'admin');
  return hydratedPost;
};

export const createCommunityPost = async (actor: Actor, input: CommunityPostInput) => {
  assertValidPostPayload(input);

  let relatedCropId = input.related_crop_id ?? null;

  if (relatedCropId) {
    const crop = await assertCropAccess(relatedCropId, actor);
    relatedCropId = crop.id;
  }

  const payload = {
    user_id: actor.id,
    related_crop_id: relatedCropId,
    type: input.type,
    title: normalizeText(input.title),
    content: normalizeText(input.content),
  };

  const { data, error } = await supabaseServiceClient
    .from('community_posts')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw createHttpError(`Unable to create the community post: ${error.message}`, 400);
  }

  const [hydratedPost] = await hydratePosts([data], actor);
  return hydratedPost;
};

export const updateCommunityPost = async (postId: string, actor: Actor, input: CommunityPostUpdate) => {
  assertValidPostPayload(input, true);

  const post = await getPostRecord(postId);
  const isOwner = post.user_id === actor.id;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw createHttpError('You are not allowed to update this community post.', 403);
  }

  let relatedCropId = input.related_crop_id ?? post.related_crop_id;

  if (relatedCropId) {
    const crop = await assertCropAccess(relatedCropId, actor);
    relatedCropId = crop.id;
  }

  const updates: Partial<CommunityPostRecord> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    updates.title = normalizeText(input.title);
  }
  if (input.content !== undefined) {
    updates.content = normalizeText(input.content);
  }
  if (input.type !== undefined) {
    updates.type = input.type;
  }
  if (input.related_crop_id !== undefined) {
    updates.related_crop_id = relatedCropId ?? null;
  }
  if (isAdmin && input.status !== undefined) {
    updates.status = input.status;
  }

  const { data, error } = await supabaseServiceClient
    .from('community_posts')
    .update(updates)
    .eq('id', postId)
    .select('*')
    .single();

  if (error) {
    throw createHttpError(`Unable to update the community post: ${error.message}`, 400);
  }

  const [hydratedPost] = await hydratePosts([data], actor, actor.role === 'admin');
  return hydratedPost;
};

export const deleteCommunityPost = async (postId: string, actor: Actor) => {
  const post = await getPostRecord(postId);
  const isOwner = post.user_id === actor.id;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw createHttpError('You are not allowed to delete this community post.', 403);
  }

  const { error } = await supabaseServiceClient
    .from('community_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    throw createHttpError(`Unable to delete the community post: ${error.message}`, 400);
  }

  return { deleted: true };
};

export const addCommunityComment = async (postId: string, actor: Actor, input: CommunityCommentInput) => {
  assertValidCommentPayload(input);

  const post = await getPostRecord(postId);
  if (!canAccessPost(post, actor)) {
    throw createHttpError('You are not allowed to comment on this post.', 403);
  }

  let parentComment: CommunityCommentRecord | null = null;
  if (input.parent_comment_id) {
    const resolvedParentComment = await getCommentRecord(input.parent_comment_id);
    if (resolvedParentComment.post_id !== post.id) {
      throw createHttpError('Replies must stay in the same discussion thread.', 400);
    }
    parentComment = resolvedParentComment;
  }

  const { data, error } = await supabaseServiceClient
    .from('community_comments')
    .insert({
      post_id: post.id,
      user_id: actor.id,
      parent_comment_id: input.parent_comment_id ?? null,
      content: normalizeText(input.content),
    })
    .select('*')
    .single();

  if (error) {
    throw createHttpError(`Unable to publish the comment: ${error.message}`, 400);
  }

  const [hydratedPost] = await hydratePosts([post], actor);
  const hydratedComment = hydratedPost.comments.find((comment) => comment.id === data.id);

  const authorName = hydratedComment
    ? getNameFromFields(hydratedComment.author_name)
    : 'Community member';

  if (post.user_id !== actor.id) {
    await createNotification({
      user_id: post.user_id,
      title: 'New comment on your community post',
      message: `${authorName} commented on "${post.title}".`,
      type: 'info',
      data: {
        module: 'community',
        postId: post.id,
        commentId: data.id,
      },
    }).catch(() => undefined);
  }

  if (parentComment?.user_id && parentComment.user_id !== actor.id && parentComment.user_id !== post.user_id) {
    await createNotification({
      user_id: parentComment.user_id,
      title: 'New reply to your comment',
      message: `${authorName} replied to you in "${post.title}".`,
      type: 'info',
      data: {
        module: 'community',
        postId: post.id,
        commentId: data.id,
        parentCommentId: parentComment.id,
      },
    }).catch(() => undefined);
  }

  return hydratedComment ?? {
    ...data,
    author_name: authorName,
    author_avatar: undefined,
    is_owner: true,
  };
};

export const updateCommunityComment = async (commentId: string, actor: Actor, input: CommunityCommentUpdate) => {
  assertValidCommentPayload(input, true);

  const comment = await getCommentRecord(commentId);
  const isOwner = comment.user_id === actor.id;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw createHttpError('You are not allowed to update this comment.', 403);
  }

  const updates: Partial<CommunityCommentRecord> = {
    updated_at: new Date().toISOString(),
  };

  if (input.content !== undefined) {
    updates.content = normalizeText(input.content);
  }

  if (isAdmin && input.status !== undefined) {
    updates.status = input.status;
  }

  const { data, error } = await supabaseServiceClient
    .from('community_comments')
    .update(updates)
    .eq('id', commentId)
    .select('*')
    .single();

  if (error) {
    throw createHttpError(`Unable to update the comment: ${error.message}`, 400);
  }

  const [hydratedPost] = await hydratePosts([{ ...(await getPostRecord(data.post_id)) }], actor, actor.role === 'admin');
  const hydratedComment = hydratedPost.comments.find((currentComment) => currentComment.id === data.id);

  if (!hydratedComment) {
    throw createHttpError('The updated comment could not be loaded.', 500);
  }

  return hydratedComment;
};

export const deleteCommunityComment = async (commentId: string, actor: Actor) => {
  const comment = await getCommentRecord(commentId);
  const isOwner = comment.user_id === actor.id;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw createHttpError('You are not allowed to delete this comment.', 403);
  }

  const { error } = await supabaseServiceClient
    .from('community_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    throw createHttpError(`Unable to delete the comment: ${error.message}`, 400);
  }

  return { deleted: true };
};

export const toggleCommunityLike = async (postId: string, actor: Actor) => {
  const post = await getPostRecord(postId);
  if (!canAccessPost(post, actor)) {
    throw createHttpError('You are not allowed to interact with this post.', 403);
  }

  const { data: existingLike, error: existingLikeError } = await supabaseServiceClient
    .from('community_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', actor.id)
    .maybeSingle();

  if (existingLikeError) {
    throw createHttpError(`Unable to load the like state: ${existingLikeError.message}`, 400);
  }

  if (existingLike) {
    const { error } = await supabaseServiceClient
      .from('community_likes')
      .delete()
      .eq('id', existingLike.id);

    if (error) {
      throw createHttpError(`Unable to remove the like: ${error.message}`, 400);
    }

    const [hydratedPost] = await hydratePosts([post], actor);
    return {
      liked: false,
      post: hydratedPost,
    };
  }

  const { error } = await supabaseServiceClient
    .from('community_likes')
    .insert({
      post_id: postId,
      user_id: actor.id,
    });

  if (error) {
    throw createHttpError(`Unable to save the like: ${error.message}`, 400);
  }

  const [hydratedPost] = await hydratePosts([post], actor);
  return {
    liked: true,
    post: hydratedPost,
  };
};
