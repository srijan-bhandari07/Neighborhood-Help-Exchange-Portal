import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HelpPostCard from './HelpPostCard';
import HelpPostForm from './HelpPostForm';

const TaskList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/help/my-posts');
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      const response = await axios.put(`/api/help/${postId}/status`, {
        status: newStatus
      });
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/help/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      const response = await axios.put(`/api/help/${postId}`, updatedData);
      setPosts(posts.map(post => post._id === postId ? response.data : post));
      setEditingPost(null);
      return { success: true };
    } catch (error) {
      console.error('Error updating post:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update post' 
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Help Requests</h2>
        <div className="text-sm text-gray-600">
          Total posts: {posts.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {editingPost && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
          <HelpPostForm 
            post={editingPost}
            onSubmit={handleUpdatePost}
            onCancel={() => setEditingPost(null)}
          />
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No help requests yet</div>
          <p className="text-gray-400 mt-2">
            Create your first help request to get started!
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {posts.filter(post => post.status === 'open').length}
              </div>
              <div className="text-sm text-gray-600">Open Requests</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">
                {posts.filter(post => post.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-600">
                {posts.filter(post => post.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {posts.reduce((total, post) => total + post.helpers.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Helpers</div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <HelpPostCard
                key={post._id}
                post={post}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeletePost}
                onEdit={() => setEditingPost(post)}
                showActions={true}
                isAuthor={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskList;