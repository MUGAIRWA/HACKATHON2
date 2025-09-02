import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, School, GraduationCap, Shield, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loginAsAdmin, isAdminCredentials } from '../lib/adminAuth';
import { getProfile } from '../lib/supabase';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'student',
    school: '',
    grade: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signOut } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if this is admin login
      if (isLogin && isAdminCredentials(formData.email, formData.password)) {
        const result = await loginAsAdmin();
        if (result.success) {
          navigate('/admin-dashboard');
        }
        return;
      }

      if (isLogin) {
        // Login
        const { data, error } = await signIn(formData.email, formData.password);
        if (data && !error && data.user) {
          // Validate selected role against stored profile role
          const { data: profile, error: profileError } = await getProfile(data.user.id);
          if (profileError || !profile) {
            toast.error('Unable to fetch user profile');
            return;
          }

          if (profile.role !== formData.role) {
            // Safety: prevent cross-role login
            await signOut();
            toast.error(`This account is registered as ${profile.role}. Please select the correct role.`);
            return;
          }

          // Navigate based on role
          if (profile.role === 'admin') navigate('/admin-dashboard');
          else if (profile.role === 'donor') navigate('/donor-dashboard');
          else navigate('/student-dashboard');
        }
      } else {
        // Sign up
        const userData = {
          full_name: formData.fullName,
          role: formData.role,
          school: formData.school,
          grade: formData.grade
        };
        
        const { data, error } = await signUp(formData.email, formData.password, userData);
        if (data && !error) {
          toast.success('Account created! Please check your email to verify.');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickLogin = async () => {
    setLoading(true);
    const result = await loginAsAdmin();
    if (result.success) {
      navigate('/admin-dashboard');
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            {isLogin ? 'Welcome Back' : 'Join Smart Hub'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Role Selection - for both login and signup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isLogin ? 'Sign in as' : 'I am a...'}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                aria-label={isLogin ? 'Select role for sign in' : 'Select role for sign up'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="donor">Donor/Parent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Registration Fields */}
            {!isLogin && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Student-specific fields */}
                {formData.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School
                      </label>
                      <div className="relative">
                        <School className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your school name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="grade"
                          value={formData.grade}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 10th Grade"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            {/* Admin Quick Login */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleAdminQuickLogin}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200 font-medium text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Login (admin123)</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Quick admin access for demonstration
              </p>
            </div>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Help Students</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Secure Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}