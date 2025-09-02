import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, User, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AIInteraction {
  id: string;
  studentId: string;
  studentName: string;
  interactionType: string;
  content: string;
  reviewStatus: 'pending' | 'approved' | 'flagged';
  createdAt: Date;
  flaggedContent?: string;
}

const AdminAIOversight: React.FC = () => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged'>('pending');

  useEffect(() => {
    loadInteractions();
  }, [filter]);

  const loadInteractions = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('ai_chat_history')
        .select(`
          id,
          student_id,
          message_type,
          content,
          interaction_type,
          created_at,
          profiles:student_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply filter
      if (filter === 'pending') {
        // For now, show recent interactions - in production you'd have a review_status field
        query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedInteractions: AIInteraction[] = data?.map(item => ({
        id: item.id,
        studentId: item.student_id,
        studentName: (item.profiles as any)?.full_name || 'Unknown Student',
        interactionType: item.interaction_type || 'chat',
        content: item.content,
        reviewStatus: 'pending', // Default status
        createdAt: new Date(item.created_at)
      })) || [];

      setInteractions(formattedInteractions);
    } catch (error) {
      console.error('Error loading AI interactions:', error);
      toast.error('Failed to load AI interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (interactionId: string, action: 'approve' | 'flag', notes?: string) => {
    try {
      // In a real implementation, you'd update the ai_admin_oversight table
      const reviewData = {
        admin_id: user?.id,
        interaction_id: interactionId,
        review_status: action === 'approve' ? 'approved' : 'flagged',
        admin_notes: notes || '',
        reviewed_at: new Date().toISOString()
      };

      // For now, just show success message
      toast.success(`Interaction ${action === 'approve' ? 'approved' : 'flagged'} successfully`);

      // Reload interactions
      loadInteractions();
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'flagged': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'flagged': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Oversight Dashboard</h2>
            <p className="text-gray-600">Monitor and review AI assistant interactions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter AI interactions"
          >
            <option value="all">All Interactions</option>
            <option value="pending">Pending Review</option>
            <option value="flagged">Flagged Content</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Interactions</p>
              <p className="text-2xl font-bold text-blue-900">{interactions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900">
                {interactions.filter(i => i.reviewStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-900">
                {interactions.filter(i => i.reviewStatus === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-red-600 font-medium">Flagged</p>
              <p className="text-2xl font-bold text-red-900">
                {interactions.filter(i => i.reviewStatus === 'flagged').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactions List */}
      <div className="space-y-4">
        {interactions.map((interaction) => (
          <div key={interaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">{interaction.studentName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {interaction.createdAt.toLocaleDateString()} {interaction.createdAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interaction.reviewStatus)}`}>
                {getStatusIcon(interaction.reviewStatus)}
                <span className="capitalize">{interaction.reviewStatus}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                {interaction.interactionType}
              </span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm">
                {interaction.content.length > 200
                  ? `${interaction.content.substring(0, 200)}...`
                  : interaction.content
                }
              </p>
            </div>

            {interaction.reviewStatus === 'pending' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReviewAction(interaction.id, 'approve')}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleReviewAction(interaction.id, 'flag')}
                  className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Flag
                </button>
                <button
                  onClick={() => {/* Open detailed view */}}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
              </div>
            )}
          </div>
        ))}

        {interactions.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI interactions found</h3>
            <p className="text-gray-600">AI interactions will appear here once students start using the assistant.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAIOversight;