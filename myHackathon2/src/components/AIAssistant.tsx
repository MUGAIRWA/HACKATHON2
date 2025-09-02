import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, BookOpen, Heart, UtensilsCrossed, X } from 'lucide-react';
import { geminiAssistant, ChatMessage, StudentContext } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  type: 'chat' | 'quiz' | 'meal' | 'health';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, initialPrompt }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'study_help',
      label: 'Help with studying',
      icon: <BookOpen className="h-4 w-4" />,
      prompt: 'I need help studying. Can you teach me about a subject?',
      type: 'chat'
    },
    {
      id: 'generate_quiz',
      label: 'Generate a quiz',
      icon: <BookOpen className="h-4 w-4" />,
      prompt: 'Please generate a quiz for me on a subject I choose.',
      type: 'quiz'
    },
    {
      id: 'meal_plan',
      label: 'Meal planning',
      icon: <UtensilsCrossed className="h-4 w-4" />,
      prompt: 'I need help creating a meal plan within my budget.',
      type: 'meal'
    },
    {
      id: 'health_advice',
      label: 'Health advice',
      icon: <Heart className="h-4 w-4" />,
      prompt: 'I have some health concerns and need general advice.',
      type: 'health'
    }
  ];

  useEffect(() => {
    if (profile && user) {
      // Set student context for personalized responses
      const context: StudentContext = {
        studentId: user.id,
        fullName: profile.full_name,
        grade: profile.grade || undefined,
        school: profile.school || undefined
      };
      geminiAssistant.setStudentContext(context);

      // Load previous chat history for this session
      loadChatHistory();
    }
  }, [profile, user]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('student_id', user?.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const historyMessages: ChatMessage[] = data.map(item => ({
          role: item.message_type as 'user' | 'assistant',
          content: item.content,
          timestamp: new Date(item.created_at)
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveMessageToDB = async (message: ChatMessage, interactionType?: string) => {
    if (!user) return;

    try {
      await supabase.from('ai_chat_history').insert({
        student_id: user.id,
        session_id: sessionId,
        message_type: message.role,
        content: message.content,
        interaction_type: interactionType,
        metadata: {
          timestamp: message.timestamp.toISOString()
        }
      });
    } catch (error) {
      console.error('Error saving message to DB:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    setIsLoading(true);
    setInputMessage('');

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    await saveMessageToDB(userMessage);

    try {
      let response = '';
      const lowerMessage = messageToSend.toLowerCase();

      // Enhanced meal planning conversation
      if (lowerMessage.includes('meal') || lowerMessage.includes('food') ||
          lowerMessage.includes('budget') || lowerMessage.includes('diet') ||
          lowerMessage.includes('nutrition') || lowerMessage.includes('eat') ||
          lowerMessage.includes('hungry') || lowerMessage.includes('breakfast') ||
          lowerMessage.includes('lunch') || lowerMessage.includes('dinner') ||
          lowerMessage.includes('snack')) {

        // Check if this is a follow-up conversation about meals
        const hasPreviousMealContext = messages.some(msg =>
          msg.role === 'assistant' && (
            msg.content.toLowerCase().includes('meal') ||
            msg.content.toLowerCase().includes('budget') ||
            msg.content.toLowerCase().includes('nutrition')
          )
        );

        if (hasPreviousMealContext || lowerMessage.includes('plan') || lowerMessage.includes('help')) {
          // Interactive meal planning conversation
          const mealPrompt = `You are a meal planning assistant helping a student create balanced, nutritious meals within their budget. The student said: "${messageToSend}"

Previous conversation context: ${messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

Please provide helpful, conversational responses that:
1. Ask about their budget if not mentioned
2. Inquire about dietary preferences/restrictions
3. Consider nutritional balance (proteins, carbs, vegetables, fruits)
4. Suggest practical, affordable meal options
5. Calculate approximate costs
6. Offer alternatives and modifications
7. Keep the conversation going naturally

Be encouraging and make meal planning fun and educational!`;

          response = await geminiAssistant.sendMessage(mealPrompt);
        } else {
          // Initial meal planning request
          const budget = lowerMessage.match(/\$?(\d+)/)?.[1] || '50';
          response = await geminiAssistant.createMealPlan(parseInt(budget), 7);
        }
      }
      // Handle other quick action types
      else if (messageToSend === quickActions.find(a => a.type === 'quiz')?.prompt) {
        // Extract subject from message or prompt user (simplified here)
        const subject = 'Mathematics';
        response = await geminiAssistant.generateQuiz(subject);
      } else if (messageToSend === quickActions.find(a => a.type === 'health')?.prompt) {
        // Example symptoms
        const symptoms = 'headache and fever';
        response = await geminiAssistant.provideHealthAdvice(symptoms);
      } else {
        // Default chat response
        response = await geminiAssistant.sendMessage(messageToSend);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      await saveMessageToDB(assistantMessage, 'chat');

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');

      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support if the problem persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputMessage(action.prompt);
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Study Assistant</h3>
              <p className="text-sm text-gray-600">Your personal learning and health companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close AI Assistant"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Welcome to your AI Assistant!</h4>
              <p className="text-gray-600 mb-6">I'm here to help you with studying, quizzes, meal planning, and health advice.</p>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                    aria-label={action.label}
                  >
                    {action.icon}
                    <span className="text-sm font-medium text-blue-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="bg-gray-600 p-2 rounded-full flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about studying, health, or meal planning..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Your conversations are private and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;