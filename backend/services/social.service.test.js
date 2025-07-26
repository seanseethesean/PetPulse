import * as SocialService from '../services/social.service.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';

jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    arrayUnion: jest.fn((x) => x),
    arrayRemove: jest.fn((x) => x),
    increment: jest.fn((x) => x),
  };
});

describe('SocialService', () => {
  const postId = 'post123';
  const userId = 'user123';
  const targetUserId = 'user456';

  beforeEach(() => {
    jest.clearAllMocks();
    collection.mockReturnValue({});
    doc.mockReturnValue({});
  });

  it('getForumPosts returns all posts', async () => {
    getDocs.mockResolvedValue({
      docs: [{ id: '1', data: () => ({ title: 'Post' }) }]
    });

    const result = await SocialService.getForumPosts();
    expect(getDocs).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', title: 'Post' }]);
  });

  it('createForumPost creates a post with metadata', async () => {
    addDoc.mockResolvedValue({ id: 'new123' });
    const result = await SocialService.createForumPost({ title: 'Hello' });

    expect(addDoc).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: 'new123',
      title: 'Hello',
      likes: 0,
      likedBy: expect.any(Array),
      createdAt: expect.any(String)
    });
  });

  it('deleteForumPost deletes a post by ID', async () => {
    await SocialService.deleteForumPost(postId);
    expect(deleteDoc).toHaveBeenCalled();
  });

  it('likeForumPost increments like count', async () => {
    getDoc.mockResolvedValue({ exists: () => true });
    await SocialService.likeForumPost(postId, userId, true);
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      likes: 1,
      likedBy: userId
    });
  });

  it('likeForumPost decrements like count', async () => {
    getDoc.mockResolvedValue({ exists: () => true });
    await SocialService.likeForumPost(postId, userId, false);
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      likes: -1,
      likedBy: userId
    });
  });

  it('likeForumPost throws if post not found', async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    await expect(SocialService.likeForumPost(postId, userId, true))
      .rejects.toThrow('Post not found');
  });

  it('addForumComment sets a comment and returns ID', async () => {
    const mockRef = { id: 'cmt999' };
    doc.mockReturnValue(mockRef);
    await expect(SocialService.addForumComment(postId, { msg: 'Hi' }))
      .resolves.toBe('cmt999');
    expect(setDoc).toHaveBeenCalledWith(mockRef, { msg: 'Hi' });
  });

  it('getCommentsForPost returns comments', async () => {
    getDocs.mockResolvedValue({
      docs: [{ id: 'c1', data: () => ({ msg: 'hi' }) }]
    });

    const result = await SocialService.getCommentsForPost(postId);
    expect(result).toEqual([{ id: 'c1', msg: 'hi' }]);
  });

  it('searchUsersByEmail returns matches except excluded user', async () => {
    getDocs.mockResolvedValue({
      docs: [
        { id: 'uid1', data: () => ({ displayName: 'Zoe' }) },
        { id: 'user456', data: () => ({ displayName: 'Anna' }) }
      ]
    });

    const result = await SocialService.searchUsersByEmail('A', 'user456');
    expect(result).toEqual([{ id: 'uid1', displayName: 'Zoe' }]);
  });

  it('searchUsersByEmail throws on error', async () => {
    getDocs.mockRejectedValue(new Error('fail'));
    await expect(SocialService.searchUsersByEmail('abc')).rejects.toThrow('Search failed');
  });

  it('followUser updates following and followers', async () => {
    await SocialService.followUser(userId, targetUserId);
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });

  it('unfollowUser removes from following and followers', async () => {
    await SocialService.unfollowUser(userId, targetUserId);
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });
});