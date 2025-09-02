import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Eye, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, MealRequest, Donation, Profile } from '../lib/supabase';
import { logSupabaseError, testSupabaseQuery } from '../lib/debugHelper';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalRequests: number;
  totalDonations: number;
  pendingRequests: number;
  totalAmount: number;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRequests: 0,
    totalDonations: 0,
    pendingRequests: 0,
    totalAmount: 0
  });
  const [mealRequests, setMealRequests] = useState<MealRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    loadDashboardData();
    const cleanup = setupRealTimeSubscriptions();
    
    return cleanup;
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [usersResult, requestsResult, donationsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('meal_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('donations').select('*').order('created_at', { ascending: false })
      ]);

      // Load related profile data separately
      const studentIds = [...new Set(requestsResult.data?.map(r => r.student_id) || [])];
      const donorIds = [...new Set(donationsResult.data?.map(d => d.donor_id) || [])];
      const mealRequestIds = [...new Set(donationsResult.data?.map(d => d.meal_request_id) || [])];

      const [studentsResult, donorsResult, mealRequestsForDonationsResult] = await Promise.all([
        studentIds.length > 0 ? supabase.from('profiles').select('*').in('id', studentIds) : { data: [] },
        donorIds.length > 0 ? supabase.from('profiles').select('*').in('id', donorIds) : { data: [] },
        mealRequestIds.length > 0 ? supabase.from('meal_requests').select('*').in('id', mealRequestIds) : { data: [] }
      ]);

      if (usersResult.error) throw usersResult.error;
      if (requestsResult.error) throw requestsResult.error;
      if (donationsResult.error) throw donationsResult.error;

      // Combine the data
      const requestsWithStudents = requestsResult.data?.map(request => ({
        ...request,
        student: studentsResult.data?.find(s => s.id === request.student_id)
      })) || [];

      const donationsWithDetails = donationsResult.data?.map(donation => ({
        ...donation,
        donor: donorsResult.data?.find(d => d.id === donation.donor_id),
        meal_request: mealRequestsForDonationsResult.data?.find(mr => mr.id === donation.meal_request_id)
      })) || [];

      // Add student info to meal requests in donations
      donationsWithDetails.forEach(donation => {
        if (donation.meal_request) {
          donation.meal_request.student = studentsResult.data?.find(s => s.id === donation.meal_request.student_id);
        }
      });

      setUsers(usersResult.data || []);
      setMealRequests(requestsWithStudents);
      setDonations(donationsWithDetails);

      // Calculate stats
      const totalAmount = donationsWithDetails
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + Number(d.amount), 0);

      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalRequests: requestsWithStudents.length,
        totalDonations: donationsWithDetails.length,
        pendingRequests: requestsWithStudents.filter((r: any) => r.status === 'pending').length,
        totalAmount
      });

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to meal requests changes
    const requestsSubscription = supabase
      .channel('admin_meal_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meal_requests' },
        () => loadDashboardData()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin meal requests subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Admin meal requests subscription error');
        }
      });

    // Subscribe to donations changes
    const donationsSubscription = supabase
      .channel('admin_donations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        () => loadDashboardData()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin donations subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Admin donations subscription error');
        }
      });

    return () => {
      requestsSubscription.unsubscribe();
      donationsSubscription.unsubscribe();
    };
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const updates = {
        status: action === 'approve' ? 'approved' : 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('meal_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Request ${action}d successfully`);
      
      // Create notification for student
      const request = mealRequests.find(r => r.id === requestId);
      if (request) {
        await supabase.from('notifications').insert({
          user_id: request.student_id,
          title: `Request ${action}d`,
          message: `Your meal request "${request.title}" has been ${action}d by admin.`,
          type: 'request_update'
        });
      }

    } catch (error: any) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button
                onClick={() => loadDashboardData()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={async () => {
                  console.log('=== DEBUGGING MEAL REQUESTS QUERY ===');
                  const result = await testSupabaseQuery({
                    table: 'meal_requests',
                    select: '*',
                    filters: {}
                  });
                  console.log('Debug result:', result);
                  if (result.success) {
                    toast.success(`Found ${result.data?.length || 0} meal requests`);
                  } else {
                    toast.error(`Query failed: ${result.error?.message}`);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Debug Requests
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'requests', name: 'Meal Requests', icon: FileText },
                { id: 'donations', name: 'Donations', icon: DollarSign },
                { id: 'users', name: 'Users', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Platform Overview</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Requests */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Requests</h4>
                    <div className="space-y-2">
                      {mealRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium">{request.title}</p>
                            <p className="text-xs text-gray-500">{request.student?.full_name}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Donations */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Donations</h4>
                    <div className="space-y-2">
                      {donations.slice(0, 5).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium">{formatCurrency(Number(donation.amount))}</p>
                            <p className="text-xs text-gray-500">{donation.donor?.full_name}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Meal Requests Management</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Request
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mealRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.student?.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.student?.school} - {request.student?.grade}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.title}</div>
                              <div className="text-sm text-gray-500">{request.description}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {request.meal_type} • {formatDate(request.requested_for)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(Number(request.amount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'completed' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleRequestAction(request.id, 'approve')}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRequestAction(request.id, 'reject')}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </button>
                              </div>
                            )}
                            {request.status !== 'pending' && (
                              <span className="text-gray-400">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Donations Management</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Donor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Request
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {donations.map((donation) => (
                        <tr key={donation.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {donation.donor?.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {donation.donor?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(Number(donation.amount))}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {donation.meal_request?.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              For: {donation.meal_request?.student?.full_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(donation.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Users Management</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          School/Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => {
                        const userRequests = mealRequests.filter(r => r.student_id === user.id);
                        const userDonations = donations.filter(d => d.donor_id === user.id);
                        
                        return (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'donor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.school && user.grade ? `${user.school} - ${user.grade}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.role === 'student' && `${userRequests.length} requests`}
                              {user.role === 'donor' && `${userDonations.length} donations`}
                              {user.role === 'admin' && 'Admin user'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}