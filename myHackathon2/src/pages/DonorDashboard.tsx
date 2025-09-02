import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOutIcon, UserIcon, HeartIcon, ClockIcon, CheckCircleIcon, HistoryIcon, SearchIcon, LayoutDashboardIcon, UsersIcon, CreditCardIcon, BellIcon, TrendingUpIcon, AlertCircleIcon, LogOut, RefreshCwIcon } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { supabase, MealRequest, Donation, getDonorBalance } from '../lib/supabase';
import { initializePayment, generatePaymentReference } from '../lib/paystack';
import { logSupabaseError, testSupabaseQuery } from '../lib/debugHelper';
import toast from 'react-hot-toast';
const MealRequestCard = ({
  request,
  onFund
}: {
  request: MealRequest;
  onFund: (id: string) => void;
}) => {
  return <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-gray-900 text-lg">
              {request.student?.full_name || 'Unknown Student'}
            </h3>
            {request.student?.school && <p className="text-xs text-gray-500">
                {request.student.grade} • {request.student.school}
              </p>}
          </div>
          <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-0.5 rounded">
            ${Number(request.amount).toFixed(2)}
          </span>
        </div>
        <p className="text-gray-600 mb-3">{request.description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <ClockIcon size={14} className="mr-1" />
          Requested on {new Date(request.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="px-4 pb-4">
        <button onClick={() => onFund(request.id)} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-md hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center font-medium">
          <HeartIcon size={18} className="mr-2" />
          Fund this request
        </button>
      </div>
    </div>;
};
const DonationHistory = ({ donations }: { donations: Donation[] }) => {
  return <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <HeartIcon size={20} className="text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Your Donation History
          </h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-green-600">
            Total: $26.25
          </span>
          <p className="text-xs text-gray-500">3 students helped</p>
        </div>
      </div>
      <div className="space-y-4">
        {donations.map(donation => <div key={donation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">
                  {donation.meal_request?.student?.full_name || 'Unknown Student'}
                </p>
                <p className="text-xs text-gray-500">
                  {donation.meal_request?.student?.grade} • {donation.meal_request?.student?.school}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {donation.meal_request?.title || 'Meal Request'}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <ClockIcon size={14} className="mr-1" />
                  {new Date(donation.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon size={14} className="mr-1.5" />$
                  {Number(donation.amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>)}
      </div>
      <div className="mt-6 text-center">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          <HistoryIcon size={16} className="mr-2 text-gray-500" />
          View All Donations
        </button>
      </div>
    </div>;
};
const ImpactSummary = ({ donations, balance, onAddFunds }: { donations: Donation[], balance: number, onAddFunds: () => void }) => {
  const totalDonated = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const studentsHelped = new Set(donations.map(d => d.meal_request?.student_id)).size;

  return <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <h3 className="text-lg font-medium text-white">Your Impact</h3>
        <p className="text-green-100 text-sm">
          Thank you for making a difference
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <HeartIcon size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donated</p>
                <p className="text-xl font-bold text-gray-900">${totalDonated.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <UsersIcon size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Students Helped</p>
                <p className="text-xl font-bold text-gray-900">{studentsHelped}</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <TrendingUpIcon size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Impact Score</p>
                <p className="text-xl font-bold text-gray-900">{Math.round((totalDonated / 100) * 100)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Your current balance: <strong>${balance.toFixed(2)}</strong>
          </p>
          <button onClick={onAddFunds} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <CreditCardIcon size={16} className="mr-2" />
            Add Funds to Your Account
          </button>
        </div>
      </div>
    </div>;
};
const DonorDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [mealRequests, setMealRequests] = useState<MealRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (profile?.role === 'donor') {
      loadDashboardData();
      loadDonorBalance();
      const cleanup = setupRealTimeSubscriptions();
      return cleanup;
    }
  }, [profile]);

  const loadDonorBalance = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await getDonorBalance(user.id);
      if (error) {
        console.error('Failed to load donor balance:', error);
        return;
      }
      setBalance(data || 0);
    } catch (error) {
      console.error('Error loading donor balance:', error);
    }
  };

  const handleAddFunds = async () => {
    if (!user?.email || !user?.id) {
      toast.error('User not authenticated');
      return;
    }
    try {
      const amountToAdd = 5000; // Example: 5000 kobo = 50 NGN, you can make this dynamic or prompt user
      const paymentData = {
        email: user.email,
        amount: amountToAdd,
        reference: generatePaymentReference(),
        callback_url: window.location.origin + '/donor-dashboard',
        metadata: {
          donor_id: user.id,
          payment_type: 'add_funds' as const
        }
      };
      await initializePayment(paymentData);
      toast.success('Add funds payment initiated! Please complete the transaction.');
    } catch (error: any) {
      console.error('Error initiating add funds payment:', error);
      toast.error('Failed to initiate add funds payment');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load meal requests and donations
      const [requestsResult, donationsResult] = await Promise.all([
        supabase.from('meal_requests').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('donations').select('*').eq('donor_id', user?.id).order('created_at', { ascending: false })
      ]);

      // Load related profile data separately
      const studentIds = [...new Set(requestsResult.data?.map(r => r.student_id) || [])];
      const mealRequestIds = [...new Set(donationsResult.data?.map(d => d.meal_request_id) || [])];
      const donorIds = [...new Set(donationsResult.data?.map(d => d.donor_id) || [])];

      const [studentsResult, mealRequestsForDonationsResult, donorsResult] = await Promise.all([
        studentIds.length > 0 ? supabase.from('profiles').select('*').in('id', studentIds) : { data: [] },
        mealRequestIds.length > 0 ? supabase.from('meal_requests').select('*').in('id', mealRequestIds) : { data: [] },
        donorIds.length > 0 ? supabase.from('profiles').select('*').in('id', donorIds) : { data: [] }
      ]);

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

      if (requestsResult.error) throw requestsResult.error;
      if (donationsResult.error) throw donationsResult.error;

      setMealRequests(requestsWithStudents);
      setDonations(donationsWithDetails);
    } catch (error: any) {
      logSupabaseError(error, 'DonorDashboard.loadDashboardData');
      toast.error('Failed to load dashboard data');

      // Optionally test the problematic queries for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('=== DEBUGGING DASHBOARD QUERIES ===');
        await testSupabaseQuery({
          table: 'meal_requests',
          select: '*',
          filters: { 'eq.status': 'approved' }
        });
        await testSupabaseQuery({
          table: 'donations',
          select: '*',
          filters: { 'eq.donor_id': user?.id || 'test-id' }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to meal requests changes (when admin approves requests)
    const requestsSubscription = supabase
      .channel('donor_meal_requests')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'meal_requests' },
        () => loadDashboardData()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Donor meal requests subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Donor meal requests subscription error');
        }
      });

    // Subscribe to donations changes
    const donationsSubscription = supabase
      .channel('donor_donations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        () => loadDashboardData()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Donor donations subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Donor donations subscription error');
        }
      });

    return () => {
      requestsSubscription.unsubscribe();
      donationsSubscription.unsubscribe();
    };
  };

  const filteredRequests = mealRequests.filter(request => 
    request.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    request.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    request.student?.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFund = async (id: string) => {
    try {
      const mealRequest = mealRequests.find(r => r.id === id);
      if (!mealRequest || !user?.email) {
        toast.error('Unable to process payment');
        return;
      }

      const paymentData = {
        email: user.email,
        amount: Math.round(Number(mealRequest.amount) * 100), // Convert to kobo
        reference: generatePaymentReference(),
        callback_url: window.location.origin + '/donor-dashboard',
        metadata: {
          meal_request_id: id,
          donor_id: user.id,
          student_name: mealRequest.student?.full_name || 'Student',
          payment_type: 'meal_funding' as const
        }
      };

      await initializePayment(paymentData);
      toast.success('Payment initiated! Please complete the transaction.');
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    }
  };
  if (profile?.role !== 'donor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You need donor privileges to access this page.</p>
      </div>
    </div>
  );


  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'dashboard' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <LayoutDashboardIcon size={18} className={`mr-3 ${activeTab === 'dashboard' ? 'text-green-600' : 'text-gray-500'}`} />
              Dashboard
            </button>
            <button onClick={() => setActiveTab('requests')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'requests' ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <AlertCircleIcon size={18} className={`mr-3 ${activeTab === 'requests' ? 'text-amber-600' : 'text-gray-500'}`} />
              Meal Requests
            </button>
            <button onClick={() => setActiveTab('history')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'history' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <HistoryIcon size={18} className={`mr-3 ${activeTab === 'history' ? 'text-green-600' : 'text-gray-500'}`} />
              Donation History
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <UserIcon size={18} className="text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{profile?.full_name || 'Donor'}</p>
              <p className="text-xs text-gray-500">{profile?.role === 'donor' ? 'Parent/Donor' : 'Donor'}</p>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <LogOutIcon size={16} className="mr-2" />
            Sign out
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm md:hidden">
          <div className="px-4 py-4 flex justify-between items-center">
            <Logo />
            <div className="flex items-center">
              <button
                onClick={() => loadDashboardData()}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 mr-2"
                aria-label="Refresh"
                title="Refresh data"
              >
                <RefreshCwIcon size={20} />
              </button>
              <button
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 mr-2"
                aria-label="Notifications"
                title="Notifications"
              >
                <BellIcon size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <UserIcon size={18} className="text-green-600" />
              </div>
            </div>
          </div>
          {/* Mobile Nav Tabs */}
          <div className="flex border-t border-gray-200">
            <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2 text-center text-xs font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>
              <LayoutDashboardIcon size={16} className="mx-auto mb-1" />
              Dashboard
            </button>
            <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2 text-center text-xs font-medium ${activeTab === 'requests' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`}>
              <AlertCircleIcon size={16} className="mx-auto mb-1" />
              Requests
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 text-center text-xs font-medium ${activeTab === 'history' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>
              <HistoryIcon size={16} className="mx-auto mb-1" />
              History
            </button>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {activeTab === 'dashboard' && <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {profile?.full_name || 'Donor'}!
                </h1>
                <p className="text-gray-600">
                  Thank you for supporting students in need
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImpactSummary donations={donations} balance={balance} onAddFunds={handleAddFunds} />
                <div>
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <AlertCircleIcon size={20} className="text-amber-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Urgent Meal Requests
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {mealRequests.slice(0, 2).map(request => <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.student?.full_name || 'Unknown Student'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {request.student?.grade} • {request.student?.school}
                              </p>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                              ${Number(request.amount).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {request.description}
                          </p>
                          <button onClick={() => handleFund(request.id)} className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center">
                            <HeartIcon size={14} className="mr-1" />
                            Fund this request
                          </button>
                        </div>)}
                    </div>
                    <button onClick={() => setActiveTab('requests')} className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-amber-600 text-amber-600 rounded-md hover:bg-amber-50 transition">
                      View All Requests
                    </button>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <UsersIcon size={20} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Students You've Helped
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(id => <div key={id} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <UserIcon size={16} className="text-gray-600" />
                          </div>)}
                      </div>
                      <div className="ml-4 text-sm text-gray-600">
                        <p className="font-medium">3 students</p>
                        <p className="text-xs">Helped this month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>}
          {activeTab === 'requests' && <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Meal Requests
                </h1>
                <p className="text-gray-600">
                  Help students focus on learning by funding their meals
                </p>
              </div>
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={18} className="text-gray-400" />
                </div>
                <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500" placeholder="Search by student name, school, or meal description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              {/* Meal Requests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map(request => <MealRequestCard key={request.id} request={request} onFund={handleFund} />)}
                {filteredRequests.length === 0 && <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <SearchIcon size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No results found
                    </h3>
                    <p className="text-gray-500">
                      No meal requests match your search criteria.
                    </p>
                  </div>}
              </div>
            </>}
          {activeTab === 'history' && <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Donation History
                </h1>
                <p className="text-gray-600">
                  Review your past contributions and their impact
                </p>
              </div>
              <DonationHistory donations={donations} />
            </>}
        </main>
      </div>
    </div>;
};
export default DonorDashboard;