import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOutIcon, PlusIcon, UserIcon, ClockIcon, CheckCircleIcon, XCircleIcon, BookIcon, BookOpenIcon, BrainIcon, HeartIcon, ActivityIcon, UtensilsIcon, CalendarIcon, BellIcon, LayoutDashboardIcon, GraduationCapIcon, LineChartIcon, FileTextIcon, ListChecksIcon, ClipboardCheckIcon, StarIcon, ShieldIcon, PieChartIcon, ThermometerIcon, StethoscopeIcon, HistoryIcon, DollarSignIcon, ShoppingCartIcon, TimerIcon, AlertCircleIcon, ArrowUpIcon, ArrowDownIcon, BotIcon } from 'lucide-react';
import Logo from '../components/Logo';
import AIAssistant from '../components/AIAssistant';
import ChatBox from '../components/ChatBox';
import { Subject } from '../lib/learningService';
import { mealService } from '../lib/mealService';
import { useAuth } from '../contexts/AuthContext';

import './StudentDashboard.css';
// Real data will be fetched from database
// ChatBox component removed - using AIAssistant component instead
const MealRequestForm = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await mealService.createMealRequest(parseFloat(amount), mealType, description);
      setSuccess(true);
      setAmount('');
      setDescription('');
      setMealType('lunch');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };
  return <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
          <UtensilsIcon size={20} className="text-amber-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Request a Meal</h3>
      </div>
      <div className="mb-4">
        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
          Meal Type
        </label>
        <select id="mealType" value={mealType} onChange={e => setMealType(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500">
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount Needed ($)
        </label>
        <input id="amount" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="10.00" />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Meal Description or Preferences
        </label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Describe what you need or any dietary preferences" />
      </div>
      <p className="text-xs text-gray-500 italic mb-4">
        Our AI will suggest balanced meal options based on your budget and
        previous meals to ensure variety and nutrition.
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Request submitted successfully!</p>
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-md hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <PlusIcon size={18} className="mr-2" />
        )}
        {isLoading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>;
};
const PastRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // For now, we'll use mock data since we don't have a fetchMealRequests method yet
        // In a real implementation, this would fetch from the backend
        const mockRequests = [{
          id: 1,
          date: '2023-06-10',
          amount: 8.5,
          description: 'Lunch at school',
          status: 'funded'
        }, {
          id: 2,
          date: '2023-06-08',
          amount: 12.0,
          description: 'Dinner after study group',
          status: 'pending'
        }, {
          id: 3,
          date: '2023-06-05',
          amount: 5.75,
          description: 'Breakfast before exam',
          status: 'declined'
        }];
        setRequests(mockRequests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);
  return <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
          <ClockIcon size={20} className="text-amber-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">My Past Requests</h3>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-3">
          {requests.map(request => <div key={request.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    ${request.amount.toFixed(2)} - {request.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <ClockIcon size={14} className="mr-1" />
                    {request.date}
                  </div>
                </div>
                <div>
                  {request.status === 'funded' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon size={12} className="mr-1" />
                      Funded
                    </span>}
                  {request.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ClockIcon size={12} className="mr-1" />
                      Pending
                    </span>}
                  {request.status === 'declined' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircleIcon size={12} className="mr-1" />
                      Declined
                    </span>}
                </div>
              </div>
            </div>)}
        </div>
      )}
    </div>;
};
const StudyResources = () => {
  const resources = [{
    id: 1,
    title: 'Math Practice Problems',
    type: 'worksheet',
    subject: 'Mathematics',
    dueDate: '2023-06-15'
  }, {
    id: 2,
    title: 'History Essay Research',
    type: 'research',
    subject: 'History',
    dueDate: '2023-06-20'
  }, {
    id: 3,
    title: 'Science Lab Report',
    type: 'report',
    subject: 'Biology',
    dueDate: '2023-06-18'
  }];
  return <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <BookOpenIcon size={20} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Study Resources</h3>
      </div>
      <div className="space-y-3">
        {resources.map(resource => <div key={resource.id} className="p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors cursor-pointer">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{resource.title}</h4>
                <p className="text-sm text-gray-600">{resource.subject}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon size={14} className="mr-1" />
                Due: {resource.dueDate}
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {resource.type}
              </span>
            </div>
          </div>)}
      </div>
      <button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
        <PlusIcon size={16} className="mr-2" />
        View All Resources
      </button>
    </div>;
};
const healthMetrics = [
  { id: '1', metric: 'Sleep', value: '7.5 hrs/day', status: 'good', trend: 'up' },
  { id: '2', metric: 'Exercise', value: '3 days/week', status: 'fair', trend: 'stable' },
  { id: '3', metric: 'Water Intake', value: '6 glasses/day', status: 'fair', trend: 'up' },
  { id: '4', metric: 'Stress Level', value: 'Moderate', status: 'fair', trend: 'down' }
];

const healthHistory = [
  { id: '1', condition: 'Common Cold', status: 'Resolved', notes: 'Rest and hydration recommended', date: '2023-05-15' },
  { id: '2', condition: 'Seasonal Allergies', status: 'Ongoing', notes: 'Mild symptoms, monitoring', date: '2023-06-01' }
];

const mealSuggestions = [
  { id: '1', meal: 'Lunch', food: 'Chicken Salad', cost: 8.5, nutritionalValue: 'High protein, balanced' },
  { id: '2', meal: 'Dinner', food: 'Vegetable Stir Fry', cost: 6.0, nutritionalValue: 'Rich in vitamins' },
  { id: '3', meal: 'Breakfast', food: 'Oatmeal with Fruits', cost: 4.5, nutritionalValue: 'Good fiber content' }
];

const mealHistory = [
  { id: '1', date: '2023-06-10', meal: 'Lunch', food: 'Chicken Salad', cost: 8.5, nutritionalValue: 'High protein, balanced' },
  { id: '2', date: '2023-06-08', meal: 'Dinner', food: 'Pasta with Vegetables', cost: 7.0, nutritionalValue: 'Carb-rich meal' }
];

const HealthTips = () => {
  const tips = [{
    id: 1,
    tip: 'Drink 8 glasses of water daily',
    icon: <ActivityIcon size={16} className="text-green-600" />
  }, {
    id: 2,
    tip: 'Get at least 8 hours of sleep',
    icon: <HeartIcon size={16} className="text-green-600" />
  }, {
    id: 3,
    tip: 'Take a 5-minute break every hour of studying',
    icon: <BrainIcon size={16} className="text-green-600" />
  }];
  return <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
          <HeartIcon size={20} className="text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Health & Wellness</h3>
      </div>
      <div className="space-y-3">
        {tips.map(tip => <div key={tip.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-green-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              {tip.icon}
            </div>
            <p className="text-gray-800">{tip.tip}</p>
          </div>)}
      </div>
      <button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition">
        <PlusIcon size={16} className="mr-2" />
        View All Health Tips
      </button>
    </div>;
};
// New components for enhanced student dashboard
interface ProgressCardProps {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable' | null;
}

const ProgressCard = ({
  title,
  value,
  color,
  icon,
  trend = null
}: ProgressCardProps) => {
  return <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-center">
            <p className="text-lg font-bold">{value}</p>
            {trend && <span className={`ml-2 text-xs font-medium flex items-center ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {trend === 'up' ? <ArrowUpIcon size={12} className="mr-1" /> : trend === 'down' ? <ArrowDownIcon size={12} className="mr-1" /> : null}
                {trend === 'up' ? '+5%' : trend === 'down' ? '-3%' : 'No change'}
              </span>}
          </div>
        </div>
      </div>
    </div>;
};
const SubjectProgress = ({ subjects, onAddNewSubject }: { subjects: Subject[], onAddNewSubject: (name: string) => void }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newSubjectName, setNewSubjectName] = React.useState('');

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewSubjectName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName.trim() !== '') {
      onAddNewSubject(newSubjectName.trim());
      setNewSubjectName('');
      setIsAdding(false);
    }
  };

  return <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <GraduationCapIcon size={20} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">My Subjects</h3>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {subjects.map((subject: Subject) => <div key={subject.id} className="relative">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                {subject.icon}
              </div>
              <span className="font-medium text-gray-800">{subject.name}</span>
              <span className="ml-auto text-sm text-gray-600">
                {subject.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full progress-bar ${subject.progress >= 80 ? 'progress-bar-green' : subject.progress >= 70 ? 'progress-bar-blue' : subject.progress >= 60 ? 'progress-bar-yellow' : 'progress-bar-red'}`} style={{
            width: `${subject.progress}%`
          }}></div>
            </div>
          </div>)}
      </div>
      {isAdding ? <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={newSubjectName}
            onChange={e => setNewSubjectName(e.target.value)}
            placeholder="Enter new subject name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Add Subject
            </button>
            <button type="button" onClick={handleCancel} className="flex-1 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition">
              Cancel
            </button>
          </div>
        </form> : <button onClick={handleAddClick} className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          <PlusIcon size={16} className="mr-2" />
          Start New Subject
        </button>}
    </div>;
};
const QuizResults = ({ quizHistory }: { quizHistory: any[] }) => {
  return <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <ClipboardCheckIcon size={20} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Recent Quiz Results
          </h3>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {quizHistory.slice(0, 3).map((quiz: any) => <div key={quiz.id} className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">
                  {quiz.subject}: {quiz.topic}
                </p>
                <p className="text-xs text-gray-500">{quiz.date}</p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quiz.score >= 80 ? 'bg-green-100 text-green-800' : quiz.score >= 70 ? 'bg-blue-100 text-blue-800' : quiz.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {quiz.score}%
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                <div className={`h-1.5 rounded-full ${quiz.score >= 80 ? 'bg-green-600' : quiz.score >= 70 ? 'bg-blue-600' : quiz.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{
              width: `${quiz.score}%`
            }}></div>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {quiz.status === 'passed' ? <CheckCircleIcon size={14} className="text-green-600" /> : <XCircleIcon size={14} className="text-red-600" />}
              </span>
            </div>
          </div>)}
      </div>
      <button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
        <ListChecksIcon size={16} className="mr-2" />
        Take a New Quiz
      </button>
    </div>;
};
const StudySection = ({ subjects, quizHistory, setIsAIAssistantOpen, onAddNewSubject, onTakeQuiz }: { subjects: Subject[], quizHistory: any[], setIsAIAssistantOpen: (open: boolean) => void, onAddNewSubject: (name: string) => void, onTakeQuiz: (topic: string) => void }) => {
  const [activeStudyTab, setActiveStudyTab] = useState('subjects');
  return <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Education Center</h1>
        <p className="text-gray-600">
          Study with AI assistance and track your progress
        </p>
      </div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveStudyTab('subjects')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeStudyTab === 'subjects' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            My Subjects
          </button>
          <button onClick={() => setActiveStudyTab('ai')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeStudyTab === 'ai' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            AI Study Assistant
          </button>
          <button onClick={() => setActiveStudyTab('quizzes')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeStudyTab === 'quizzes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Quizzes & Exams
          </button>
          <button onClick={() => setActiveStudyTab('progress')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeStudyTab === 'progress' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Progress Report
          </button>
        </nav>
      </div>
      {activeStudyTab === 'subjects' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubjectProgress subjects={subjects} onAddNewSubject={onAddNewSubject} />
          <StudyResources />
        </div>}
      {activeStudyTab === 'ai' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px] bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <BotIcon size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">AI Study Assistant</h3>
            </div>
            <div className="text-center py-8">
              <BotIcon size={48} className="text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Click the AI Assistant button in the sidebar to start chatting with your personal study companion!</p>
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open AI Assistant
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <BookIcon size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Current Topic
                </h3>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">
                  Algebra: Quadratic Equations
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  You've been studying this topic for 35 minutes
                </p>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-blue-600">65% complete</div>
                  <button onClick={() => onTakeQuiz('Algebra: Quadratic Equations')} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    Take Quiz
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700">Recently Studied:</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm flex items-center text-gray-600">
                    <ClockIcon size={14} className="mr-2" />
                    Science: Cell Biology (Yesterday)
                  </li>
                  <li className="text-sm flex items-center text-gray-600">
                    <ClockIcon size={14} className="mr-2" />
                    History: World War II (2 days ago)
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <BrainIcon size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Study Tips
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-purple-600">1</span>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Use the Pomodoro technique: 25 minutes of focused study
                    followed by a 5-minute break.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Try to teach the material to someone else or explain it out
                    loud to reinforce your understanding.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Take regular quizzes to test your knowledge and identify
                    areas that need more focus.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>}
      {activeStudyTab === 'quizzes' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuizResults quizHistory={quizHistory} />
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FileTextIcon size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Available Quizzes
              </h3>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">
                    Mathematics: Algebra
                  </h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    10 questions
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Test your understanding of algebraic expressions, equations,
                  and inequalities.
                </p>
                <button onClick={() => onTakeQuiz('Mathematics: Algebra')} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Start Quiz
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">
                    Science: Physics
                  </h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    15 questions
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Test your knowledge of basic physics concepts including
                  motion, forces, and energy.
                </p>
                <button onClick={() => onTakeQuiz('Science: Physics')} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Start Quiz
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">
                    English: Grammar
                  </h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    12 questions
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Test your understanding of grammar rules, punctuation, and
                  sentence structure.
                </p>
                <button onClick={() => onTakeQuiz('English: Grammar')} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Start Quiz
                </button>
              </div>
            </div>
            <button className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
              <PlusIcon size={16} className="mr-2" />
              Request New Quiz Topic
            </button>
          </div>
        </div>}
      {activeStudyTab === 'progress' && <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ProgressCard title="Overall GPA" value="3.7/4.0" color="border-blue-500" icon={<StarIcon size={20} className="text-blue-600" />} trend="up" />
            <ProgressCard title="Quizzes Taken" value="24" color="border-purple-500" icon={<ClipboardCheckIcon size={20} className="text-purple-600" />} trend="up" />
            <ProgressCard title="Study Hours" value="42 hrs" color="border-indigo-500" icon={<ClockIcon size={20} className="text-indigo-600" />} trend="up" />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <LineChartIcon size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Academic Progress
                </h3>
              </div>
              <div className="flex items-center">
                <select 
                  className="text-sm border border-gray-300 rounded-md py-1 px-3"
                  aria-label="Select time period"
                  title="Select time period"
                >
                  <option>This Semester</option>
                  <option>Last Semester</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Performance by Subject
                </h4>
                <div className="space-y-4">
                  {subjects.map(subject => <div key={subject.id} className="relative">
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          {subject.icon}
                        </div>
                        <span className="font-medium text-gray-800">
                          {subject.name}
                        </span>
                        <span className="ml-auto text-sm text-gray-600">
                          {subject.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${subject.progress >= 80 ? 'bg-green-600' : subject.progress >= 70 ? 'bg-blue-600' : subject.progress >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{
                    width: `${subject.progress}%`
                  }}></div>
                      </div>
                    </div>)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Recent Quiz Performance
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quizHistory.map(quiz => <tr key={quiz.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {quiz.date}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {quiz.subject}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {quiz.topic}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quiz.score >= 80 ? 'bg-green-100 text-green-800' : quiz.score >= 70 ? 'bg-blue-100 text-blue-800' : quiz.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {quiz.score}%
                            </span>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <ShieldIcon size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                AI Recommendations
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Study Focus Recommendation
                </h4>
                <p className="text-sm text-blue-700">
                  Based on your recent quiz performance, we recommend focusing
                  more on History, particularly World War II topics where your
                  scores have been lower.
                </p>
              </div>
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Progress Highlight
                </h4>
                <p className="text-sm text-green-700">
                  Your Mathematics scores have improved by 15% over the past
                  month. Great job with your consistent practice!
                </p>
              </div>
              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">
                  Learning Strategy Suggestion
                </h4>
                <p className="text-sm text-purple-700">
                  Try using more practice quizzes for English grammar. Students
                  who take practice quizzes regularly score 20% higher on exams.
                </p>
              </div>
            </div>
          </div>
        </div>}
    </>;
};
const HealthSection = ({ setIsAIAssistantOpen }: { setIsAIAssistantOpen: (open: boolean) => void }) => {
  const [activeHealthTab, setActiveHealthTab] = useState('overview');
  return <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Health & Wellness</h1>
        <p className="text-gray-600">
          Track your health status and get personalized advice
        </p>
      </div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveHealthTab('overview')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeHealthTab === 'overview' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Overview
          </button>
          <button onClick={() => setActiveHealthTab('consultation')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeHealthTab === 'consultation' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            AI Consultation
          </button>
          <button onClick={() => setActiveHealthTab('history')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeHealthTab === 'history' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Health History
          </button>
        </nav>
      </div>
      {activeHealthTab === 'overview' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ProgressCard title="Overall Health" value="Good" color="border-green-500" icon={<HeartIcon size={20} className="text-green-600" />} trend="up" />
              <ProgressCard title="Wellness Score" value="82/100" color="border-green-500" icon={<ActivityIcon size={20} className="text-green-600" />} trend="up" />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <LineChartIcon size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Health Metrics
                </h3>
              </div>
              <div className="space-y-4">
                {healthMetrics.map(metric => <div key={metric.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${metric.status === 'good' ? 'bg-green-100' : metric.status === 'fair' ? 'bg-yellow-100' : 'bg-red-100'} flex items-center justify-center mr-3`}>
                        {metric.metric === 'Sleep' ? <ClockIcon size={16} className={metric.status === 'good' ? 'text-green-600' : metric.status === 'fair' ? 'text-yellow-600' : 'text-red-600'} /> : metric.metric === 'Exercise' ? <ActivityIcon size={16} className={metric.status === 'good' ? 'text-green-600' : metric.status === 'fair' ? 'text-yellow-600' : 'text-red-600'} /> : metric.metric === 'Water Intake' ? <HeartIcon size={16} className={metric.status === 'good' ? 'text-green-600' : metric.status === 'fair' ? 'text-yellow-600' : 'text-red-600'} /> : <BrainIcon size={16} className={metric.status === 'good' ? 'text-green-600' : metric.status === 'fair' ? 'text-yellow-600' : 'text-red-600'} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {metric.metric}
                        </p>
                        <p className="text-sm text-gray-500">{metric.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'} mr-2`}>
                        {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${metric.status === 'good' ? 'bg-green-100 text-green-800' : metric.status === 'fair' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {metric.status}
                      </span>
                    </div>
                  </div>)}
              </div>
              <button className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition">
                <PlusIcon size={16} className="mr-2" />
                Update Health Metrics
              </button>
            </div>
          </div>
          <HealthTips />
        </div>}
      {activeHealthTab === 'consultation' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px]">
            <ChatBox context="health" onOpenAIAssistant={() => setIsAIAssistantOpen(true)} />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <StethoscopeIcon size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Health Assessment
                </h3>
              </div>
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <h4 className="font-medium text-green-800">
                  AI Health Analysis
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Based on your recent symptoms and health data, our AI suggests
                  you may be experiencing mild seasonal allergies.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckCircleIcon size={12} className="text-green-600" />
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Consider over-the-counter antihistamines
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckCircleIcon size={12} className="text-green-600" />
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Keep windows closed during high pollen count days
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckCircleIcon size={12} className="text-green-600" />
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Stay hydrated and get adequate rest
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 border border-yellow-300 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircleIcon size={16} className="text-yellow-700 mr-2" />
                  <p className="text-sm text-yellow-700 font-medium">
                    Important Note
                  </p>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  This is not a medical diagnosis. If symptoms persist or
                  worsen, please consult a healthcare professional.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <HeartIcon size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Wellness Tips
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-green-600">1</span>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Aim for 7-9 hours of sleep per night to improve focus and
                    immune function.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-green-600">2</span>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Take short breaks during study sessions to reduce eye strain
                    and mental fatigue.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-green-600">3</span>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Stay hydrated by carrying a water bottle with you throughout
                    the day.
                  </p>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                type="button"
              >
                Open AI Health Consultant
              </button>
            </div>
          </div>
        </div>}
      {activeHealthTab === 'history' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <HistoryIcon size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Health History
                </h3>
              </div>
              <button className="text-sm text-green-600 hover:text-green-700">
                Export Report
              </button>
            </div>
            <div className="space-y-4">
              {healthHistory.map(item => <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {item.condition}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Resolved' ? 'bg-green-100 text-green-800' : item.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.notes}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarIcon size={12} className="mr-1" />
                    {item.date}
                  </div>
                </div>)}
            </div>
            <button className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition">
              <PlusIcon size={16} className="mr-2" />
              Record New Health Event
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <ThermometerIcon size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Health Trends
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Sleep Pattern (Last 7 Days)
                </h4>
                <div className="flex items-center justify-between space-x-2">
                  {[7.5, 8, 6.5, 7, 8.5, 7, 7.5].map((hours, idx) => <div key={idx} className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                      </div>
                      <div className={`w-8 ${hours >= 8 ? 'bg-green-500' : hours >= 7 ? 'bg-green-400' : hours >= 6 ? 'bg-yellow-400' : 'bg-red-400'} rounded-t-sm bar-chart-bar`} style={{
                  height: `${hours * 6}px`
                }}></div>
                      <div className="text-xs text-gray-500 mt-1">{hours}h</div>
                    </div>)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Stress Levels (Last 30 Days)
                </h4>
                <div className="h-24 bg-gray-50 rounded-lg p-2 flex items-end">
                  <div className="relative w-full h-full">
                                    <div className="absolute left-0 right-0 border-t border-gray-300 text-xs text-gray-500 chart-line-high">
                  <span className="bg-gray-50 px-1">High</span>
                </div>
                <div className="absolute left-0 right-0 border-t border-gray-300 text-xs text-gray-500 chart-line-medium">
                  <span className="bg-gray-50 px-1">Medium</span>
                </div>
                <div className="absolute left-0 right-0 border-t border-gray-300 text-xs text-gray-500 chart-line-low">
                  <span className="bg-gray-50 px-1">Low</span>
                </div>
                    {/* Simplified stress level line */}
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,70 C10,60 20,80 30,50 C40,30 50,40 60,20 C70,30 80,60 90,50 L90,100 L0,100 Z" fill="rgba(74, 222, 128, 0.2)" />
                      <path d="M0,70 C10,60 20,80 30,50 C40,30 50,40 60,20 C70,30 80,60 90,50" fill="none" stroke="#4ade80" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Health Insight
                </h4>
                <p className="text-sm text-green-700">
                  Your sleep quality has improved by 15% this month. Continue
                  maintaining your regular sleep schedule for optimal cognitive
                  function and immune support.
                </p>
              </div>
            </div>
          </div>
        </div>}
    </>;
};
const MealSection = ({ setIsAIAssistantOpen }: { setIsAIAssistantOpen: (open: boolean) => void }) => {
  const [activeMealTab, setActiveMealTab] = useState('request');

  const handleRequestMeal = async (meal: any) => {
    try {
      await mealService.createMealRequest(meal.cost, meal.meal.toLowerCase(), `${meal.food} - ${meal.nutritionalValue}`);
      alert('Meal request submitted successfully!');
    } catch (error) {
      alert('Failed to submit meal request. Please try again.');
    }
  };
  return <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meal Assistance</h1>
        <p className="text-gray-600">
          Request meal funding and get balanced diet recommendations
        </p>
      </div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveMealTab('request')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeMealTab === 'request' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Request Meal
          </button>
          <button onClick={() => setActiveMealTab('planner')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeMealTab === 'planner' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            AI Meal Planner
          </button>
          <button onClick={() => setActiveMealTab('history')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeMealTab === 'history' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Meal History
          </button>
          <button onClick={() => setActiveMealTab('budget')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeMealTab === 'budget' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Budget Tracker
          </button>
        </nav>
      </div>
      {activeMealTab === 'request' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <MealRequestForm />
            <PastRequests />
          </div>
          <div className="h-[500px] flex flex-col justify-center items-center border border-gray-300 rounded-md bg-gray-50">
            <div className="text-center w-full">
              <ChatBox context="meal" />
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="mt-4 w-full bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                type="button"
              >
                Open Meal Chart Assistant
              </button>
            </div>
          </div>
        </div>}
      {activeMealTab === 'planner' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px] flex flex-col justify-center items-center border border-gray-300 rounded-md bg-gray-50">
            <div className="text-center w-full">
              <ChatBox context="meal" />
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="mt-4 w-full bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                type="button"
              >
                Open Meal Chart Assistant
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <UtensilsIcon size={20} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Suggested Meals
                </h3>
              </div>
              <div className="space-y-4">
                {mealSuggestions.map(meal => <div key={meal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-amber-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-1">
                          {meal.meal}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {meal.food}
                        </h4>
                      </div>
                      <span className="font-medium text-amber-600">
                        ${meal.cost.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {meal.nutritionalValue}
                    </p>
                    <button
                      onClick={() => handleRequestMeal(meal)}
                      className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700"
                    >
                      Request This Meal
                    </button>
                  </div>)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <HeartIcon size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Nutritional Balance
                </h3>
              </div>
              <div className="flex justify-between mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-500">25%</span>
                  </div>
                  <span className="mt-2 text-xs text-gray-500">Protein</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-600">
                      45%
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-gray-500">Carbs</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">
                      30%
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-gray-500">Fats</span>
                </div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  Your current meal plan is well-balanced. Consider adding more
                  vegetables to increase your vitamin and mineral intake.
                </p>
              </div>
            </div>
          </div>
        </div>}
      {activeMealTab === 'history' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <ClockIcon size={20} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Meals
                </h3>
              </div>
              <select 
                className="text-sm border border-gray-300 rounded-md py-1 px-3"
                aria-label="Select time range"
                title="Select time range"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="space-y-4">
              {mealHistory.map(meal => <div key={meal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-1">
                        {meal.meal}
                      </span>
                      <h4 className="font-medium text-gray-900">{meal.food}</h4>
                    </div>
                    <span className="font-medium text-amber-600">
                      ${meal.cost.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {meal.nutritionalValue}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarIcon size={12} className="mr-1" />
                    {meal.date}
                  </div>
                </div>)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <PieChartIcon size={20} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Meal Analytics
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Meal Type Distribution
                </h4>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-8 border-amber-400 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-600">
                        30%
                      </span>
                    </div>
                    <span className="mt-2 text-xs text-gray-500">
                      Breakfast
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-8 border-amber-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-600">
                        45%
                      </span>
                    </div>
                    <span className="mt-2 text-xs text-gray-500">Lunch</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-8 border-amber-800 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-600">
                        25%
                      </span>
                    </div>
                    <span className="mt-2 text-xs text-gray-500">Dinner</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Food Category Frequency
                </h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Protein (Meat, Fish, Eggs)</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full progress-bar" style={{
                    width: '65%'
                  }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Grains & Starches</span>
                      <span>80%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-600 h-2 rounded-full progress-bar" style={{
                    width: '80%'
                  }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Vegetables</span>
                      <span>40%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-600 h-2 rounded-full progress-bar" style={{
                    width: '40%'
                  }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Fruits</span>
                      <span>25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full progress-bar" style={{
                    width: '25%'
                  }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Dairy</span>
                      <span>35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full progress-bar" style={{
                    width: '35%'
                  }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">
                  AI Recommendation
                </h4>
                <p className="text-sm text-amber-700">
                  Consider incorporating more fruits and vegetables into your
                  meals. They provide essential vitamins and minerals while
                  keeping your diet balanced.
                </p>
              </div>
            </div>
          </div>
        </div>}
      {activeMealTab === 'budget' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <DollarSignIcon size={20} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Budget Overview
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <DollarSignIcon size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-xl font-bold text-gray-900">$78.50</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <ArrowDownIcon size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Received</p>
                    <p className="text-xl font-bold text-gray-900">$100.00</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <ArrowUpIcon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="text-xl font-bold text-gray-900">$21.50</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Weekly Spending
              </h4>
              <div className="flex items-center justify-between space-x-2">
                {[4.5, 7.25, 0, 5.0, 0, 4.75, 0].map((amount, idx) => <div key={idx} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                    </div>
                    {amount > 0 ? <div className="bg-amber-500 rounded-t-sm w-8 bar-chart-bar" style={{
                height: `${amount * 4}px`
              }}></div> : <div className="bar-chart-empty rounded-t-sm w-8 h-4"></div>}
                    <div className="text-xs text-gray-500 mt-1">
                      ${amount.toFixed(2)}
                    </div>
                  </div>)}
              </div>
            </div>
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2">
                Budget Recommendation
              </h4>
              <p className="text-sm text-amber-700">
                Based on your spending patterns and available balance, you can
                budget approximately $5-7 per meal for the next two weeks.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <ShoppingCartIcon size={20} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Meal Planning
              </h3>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Budget-Friendly Meal Plan
              </h4>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 text-amber-600 mr-2" />
                      <span className="font-medium text-gray-900">
                        Breakfast
                      </span>
                    </div>
                    <span className="text-sm text-amber-600 font-medium">
                      ~$3.50/day
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Oatmeal with banana and peanut butter, or eggs with toast
                  </p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <UtensilsIcon size={16} className="text-amber-600 mr-2" />
                      <span className="font-medium text-gray-900">Lunch</span>
                    </div>
                    <span className="text-sm text-amber-600 font-medium">
                      ~$5.00/day
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Sandwich with protein and vegetables, or rice bowl with
                    beans and vegetables
                  </p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <UtensilsIcon size={16} className="text-amber-600 mr-2" />
                      <span className="font-medium text-gray-900">Dinner</span>
                    </div>
                    <span className="text-sm text-amber-600 font-medium">
                      ~$6.00/day
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Pasta with sauce and vegetables, or chicken with rice and
                    vegetables
                  </p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 text-amber-600 mr-2" />
                      <span className="font-medium text-gray-900">Snacks</span>
                    </div>
                    <span className="text-sm text-amber-600 font-medium">
                      ~$2.00/day
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Fruit, yogurt, or granola bars
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total Daily Budget
                </p>
                <p className="text-lg font-bold text-amber-600">$16.50/day</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Weekly Budget
                </p>
                <p className="text-lg font-bold text-amber-600">$115.50/week</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Available For
                </p>
                <p className="text-lg font-bold text-green-600">4.8 days</p>
              </div>
            </div>
            <button className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition">
              <TimerIcon size={16} className="mr-2" />
              Create Weekly Meal Plan
            </button>
          </div>
        </div>}
    </>;
};
const DashboardSummary = ({ setIsAIAssistantOpen, user }: { setIsAIAssistantOpen: (open: boolean) => void, user: any }) => {
  return <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-gray-600">Here's your daily overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ProgressCard title="Education Progress" value="72%" color="border-blue-500" icon={<BookOpenIcon size={20} className="text-blue-600" />} trend="up" />
        <ProgressCard title="Health Status" value="Good" color="border-green-500" icon={<HeartIcon size={20} className="text-green-600" />} trend="up" />
        <ProgressCard title="Meal Balance" value="$78.50" color="border-amber-500" icon={<UtensilsIcon size={20} className="text-amber-600" />} trend="stable" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px] flex flex-col justify-center items-center border border-gray-300 rounded-md bg-gray-50">
          <div className="text-center w-full">
            <ChatBox context="general" onOpenAIAssistant={() => setIsAIAssistantOpen(true)} />
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              type="button"
            >
              Open General AI Assistant
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <BookIcon size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Study Tasks</p>
                  <p className="text-lg font-bold">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <HeartIcon size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Health Goals</p>
                  <p className="text-lg font-bold">2/3</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-amber-500">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <UtensilsIcon size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Meal Requests</p>
                  <p className="text-lg font-bold">1 pending</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <BellIcon size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Today's Activities
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center p-3 border border-blue-200 rounded-md bg-blue-50">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <BookIcon size={16} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Math Quiz Due
                  </p>
                  <p className="text-xs text-blue-700">
                    Algebra: Quadratic Equations
                  </p>
                </div>
                <div className="text-xs text-blue-800 font-medium">3:00 PM</div>
              </div>
              <div className="flex items-center p-3 border border-green-200 rounded-md bg-green-50">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <HeartIcon size={16} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Exercise Reminder
                  </p>
                  <p className="text-xs text-green-700">
                    30 minutes of physical activity
                  </p>
                </div>
                <div className="text-xs text-green-800 font-medium">
                  5:00 PM
                </div>
              </div>
              <div className="flex items-center p-3 border border-amber-200 rounded-md bg-amber-50">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <UtensilsIcon size={16} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Meal Plan
                  </p>
                  <p className="text-xs text-amber-700">
                    Dinner: Pasta with vegetables
                  </p>
                </div>
                <div className="text-xs text-amber-800 font-medium">
                  6:30 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>;
};
const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [quizTopic, setQuizTopic] = useState<string | null>(null);

  // Real data state - will be populated when services are ready
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', progress: 65, icon: '📐' },
    { id: '2', name: 'Science', progress: 78, icon: '🔬' },
    { id: '3', name: 'History', progress: 42, icon: '📚' },
    { id: '4', name: 'English', progress: 89, icon: '📝' },
    { id: '5', name: 'Geography', progress: 56, icon: '🌍' }
  ]);
  const [quizHistory] = useState<any[]>([
    { id: '1', subject: 'Mathematics', topic: 'Algebra Basics', score: 85, date: '2023-06-08', status: 'passed' },
    { id: '2', subject: 'Science', topic: 'Cell Biology', score: 92, date: '2023-06-05', status: 'passed' },
    { id: '3', subject: 'History', topic: 'World War II', score: 68, date: '2023-06-01', status: 'passed' }
  ]);

  // Set student ID in mealService when user is available
  useEffect(() => {
    // Assuming user ID is available from auth context or props
    const userId = '22222222-2222-2222-2222-222222222222'; // Example student ID from database-setup.sql
    mealService.setStudentId(userId);
  }, []);

  const handleAddNewSubject = (name: string) => {
    // Generate a new id (simple increment based on current length)
    const newId = (subjects.length + 1).toString();
    // Default icon for new subjects
    const defaultIcon = '📘';
    // Add new subject with 0 progress initially
    const newSubject: Subject = {
      id: newId,
      name,
      progress: 0,
      icon: defaultIcon
    };
    setSubjects(prevSubjects => [...prevSubjects, newSubject]);
    // Optionally, you can add logic here to link this new subject to AI tracking
  };

  const handleTakeQuizClick = (topic: string) => {
    setQuizTopic(topic);
    setIsAIAssistantOpen(true);
  };

  return <div className="min-h-screen bg-gray-50 flex">
    {/* Sidebar */}
    <div className="hidden md:flex md:flex-col md:w-64 bg-white shadow-md">
      <div className="p-4 border-b border-gray-200">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <LayoutDashboardIcon size={18} className={`mr-3 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`} />
            Dashboard
          </button>
          <button onClick={() => setActiveTab('study')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'study' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <BookIcon size={18} className={`mr-3 ${activeTab === 'study' ? 'text-blue-600' : 'text-gray-500'}`} />
            Education
          </button>
          <button onClick={() => setActiveTab('health')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'health' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <HeartIcon size={18} className={`mr-3 ${activeTab === 'health' ? 'text-green-600' : 'text-gray-500'}`} />
            Health
          </button>
          <button onClick={() => setActiveTab('meals')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'meals' ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <UtensilsIcon size={18} className={`mr-3 ${activeTab === 'meals' ? 'text-amber-600' : 'text-gray-500'}`} />
            Meals
          </button>
          <button onClick={() => setIsAIAssistantOpen(true)} className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <BotIcon size={18} className="mr-3 text-blue-600" />
            AI Assistant
          </button>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon size={18} className="text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.full_name || 'Student'}</p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
        </div>
        <Link to="/" className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
          <LogOutIcon size={16} className="mr-2" />
          Sign out
        </Link>
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
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 mr-2"
              aria-label="Notifications"
              title="Notifications"
            >
              <BellIcon size={20} />
            </button>
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 mr-2 transition-colors"
              aria-label="Open AI Assistant"
              title="AI Study Assistant"
            >
              <BotIcon size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        {/* Mobile Nav Tabs */}
        <div className="flex border-t border-gray-200">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2 text-center text-xs font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            <LayoutDashboardIcon size={16} className="mx-auto mb-1" />
            Dashboard
          </button>
          <button onClick={() => setActiveTab('study')} className={`flex-1 py-2 text-center text-xs font-medium ${activeTab === 'study' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            <BookIcon size={16} className="mx-auto mb-1" />
            Study
          </button>
          <button onClick={() => setActiveTab('health')} className={`flex-1 py-2 text-center text-xs font-medium ${activeTab === 'health' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>
            <HeartIcon size={16} className="mx-auto mb-1" />
            Health
          </button>
          <button onClick={() => setActiveTab('meals')} className={`flex-1 py-2 text-center text-xs font-medium ${activeTab === 'meals' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`}>
            <UtensilsIcon size={16} className="mx-auto mb-1" />
            Meals
          </button>
        </div>
      </header>
      {/* Page Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        {activeTab === 'dashboard' && <DashboardSummary setIsAIAssistantOpen={setIsAIAssistantOpen} user={user} />}
      {activeTab === 'study' && <StudySection subjects={subjects} quizHistory={quizHistory} setIsAIAssistantOpen={setIsAIAssistantOpen} onAddNewSubject={handleAddNewSubject} onTakeQuiz={handleTakeQuizClick} />}
        {activeTab === 'health' && <HealthSection setIsAIAssistantOpen={setIsAIAssistantOpen} />}
        {activeTab === 'meals' && <MealSection setIsAIAssistantOpen={setIsAIAssistantOpen} />}
      </main>
    </div>

    {/* AI Assistant Modal */}
    <AIAssistant
      isOpen={isAIAssistantOpen}
      onClose={() => {
        setIsAIAssistantOpen(false);
        setQuizTopic(null);
      }}
      initialPrompt={quizTopic ? `Please generate a quiz for me on the topic: ${quizTopic}` : undefined}
    />
  </div>;
};
export default StudentDashboard;