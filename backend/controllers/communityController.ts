import type { Response } from 'express';
import * as communityService from '../services/communityService.js';
import type { AuthRequest } from '../types/express.js';

const getStatusCode = (error: unknown, fallback = 400) => {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === 'number') {
      return statusCode;
    }
  }

  return fallback;
};

const getMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

const requireActor = (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ success: false, error: 'User not authenticated' });
    return null;
  }

  return {
    id: req.user.id,
    role: req.user.role,
  };
};

export const listPosts = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const posts = await communityService.listCommunityPosts(actor, {
      search: typeof req.query.search === 'string' ? req.query.search : '',
      type: typeof req.query.type === 'string' ? (req.query.type as 'question' | 'tip' | 'experience' | 'all') : 'all',
      status: typeof req.query.status === 'string' ? (req.query.status as 'published' | 'hidden' | 'all') : 'all',
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({ success: false, error: getMessage(error, 'Unable to load community posts') });
  }
};

export const getPost = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const post = await communityService.getCommunityPost(req.params.postId, actor);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({ success: false, error: getMessage(error, 'Unable to load the community post') });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const post = await communityService.createCommunityPost(actor, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(getStatusCode(error)).json({ success: false, error: getMessage(error, 'Unable to create the community post') });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const post = await communityService.updateCommunityPost(req.params.postId, actor, req.body);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(getStatusCode(error)).json({ success: false, error: getMessage(error, 'Unable to update the community post') });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const result = await communityService.deleteCommunityPost(req.params.postId, actor);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(getStatusCode(error)).json({ success: false, error: getMessage(error, 'Unable to delete the community post') });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const comment = await communityService.addCommunityComment(req.params.postId, actor, req.body);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(getStatusCode(error)).json({ success: false, error: getMessage(error, 'Unable to add the comment') });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const comment = await communityService.updateCommunityComment(req.params.commentId, actor, req.body);
    res.json({ success: true, data: comment });
  } catch (error) {
    res.status(getStatusCode(error)).json({ success: false, error: getMessage(error, 'Unable to update the comment') });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const result = await communityService.deleteCommunityComment(req.params.commentId, actor);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(getStatusCode(error)).json({ success: false, error: getMessage(error, 'Unable to delete the comment') });
  }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const result = await communityService.toggleCommunityLike(req.params.postId, actor);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(getStatusCode(error)).json({ success: false, error: getMessage(error, 'Unable to update the like') });
  }
};

export const listPostsForModeration = async (req: AuthRequest, res: Response) => {
  const actor = requireActor(req, res);
  if (!actor) return;

  try {
    const posts = await communityService.listCommunityPosts(actor, {
      search: typeof req.query.search === 'string' ? req.query.search : '',
      type: typeof req.query.type === 'string' ? (req.query.type as 'question' | 'tip' | 'experience' | 'all') : 'all',
      status: typeof req.query.status === 'string' ? (req.query.status as 'published' | 'hidden' | 'all') : 'all',
      includeHidden: true,
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({ success: false, error: getMessage(error, 'Unable to load moderation posts') });
  }
};
