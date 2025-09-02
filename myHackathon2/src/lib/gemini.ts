import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface StudentContext {
  studentId: string;
  fullName: string;
  grade?: string;
  school?: string;
  learningHistory?: string[];
  healthHistory?: string[];
}

export class GeminiAIAssistant {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  private chatHistory: ChatMessage[] = [];
  private studentContext: StudentContext | null = null;

  setStudentContext(context: StudentContext) {
    this.studentContext = context;
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      this.chatHistory.push(userMessage);

      // Create context-aware prompt
      const contextPrompt = this.buildContextPrompt(message);

      // Generate response with timeout and retry logic
      const result = await Promise.race([
        this.model.generateContent(contextPrompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        )
      ]) as any;

      const response = result.response;
      const text = response.text();

      // Validate response
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI service');
      }

      // Check for inappropriate content (basic filtering)
      if (this.containsInappropriateContent(text)) {
        throw new Error('Response contains inappropriate content');
      }

      // Add assistant response to history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };
      this.chatHistory.push(assistantMessage);

      return text;
    } catch (error: any) {
      console.error('Error communicating with Gemini AI:', error);

      // Provide contextual fallback responses
      return this.getFallbackResponse(message, error);
    }
  }

  private containsInappropriateContent(text: string): boolean {
    // Basic content filtering - in production, use more sophisticated filtering
    const inappropriateWords = ['inappropriate', 'offensive', 'harmful'];
    const lowerText = text.toLowerCase();

    return inappropriateWords.some(word => lowerText.includes(word));
  }

  private getFallbackResponse(message: string, error: any): string {
    const lowerMessage = message.toLowerCase();

    // Health-related fallbacks
    if (lowerMessage.includes('health') || lowerMessage.includes('sick') ||
        lowerMessage.includes('pain') || lowerMessage.includes('headache') ||
        lowerMessage.includes('fever')) {
      return "I'm experiencing technical difficulties right now. For health concerns, please consult a healthcare professional or contact your school's health services immediately. If this is an emergency, call emergency services (911 or local emergency number) right away.";
    }

    // Study-related fallbacks
    if (lowerMessage.includes('study') || lowerMessage.includes('learn') ||
        lowerMessage.includes('quiz') || lowerMessage.includes('math') ||
        lowerMessage.includes('science') || lowerMessage.includes('homework') ||
        lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      return "I'm having trouble connecting right now. Please try again in a moment, or you can ask your teacher for help with your studies. You can also use online learning resources or study groups for additional support.";
    }

    // Meal-related fallbacks
    if (lowerMessage.includes('meal') || lowerMessage.includes('food') ||
        lowerMessage.includes('eat') || lowerMessage.includes('budget') ||
        lowerMessage.includes('hungry') || lowerMessage.includes('nutrition')) {
      return "I'm temporarily unavailable for meal planning. For immediate needs, consider balanced meals with proteins, vegetables, and whole grains. Check with your school's cafeteria or local food bank for current offerings and support.";
    }

    // General fallback
    return "I'm experiencing some technical difficulties and can't respond right now. Please try again in a few moments. If you need immediate help with health concerns, contact a medical professional. For academic help, reach out to your teacher or school administration.";
  }

  private buildContextPrompt(userMessage: string): string {
    let prompt = `You are an AI assistant for a student meal donation platform. You help students with:

1. EDUCATION: Teaching subjects, answering questions, generating quizzes and exams
2. HEALTH: Providing health advice, diagnosis suggestions, monitoring health
3. MEAL PLANNING: Creating budget-friendly meal plans based on student budgets

`;

    if (this.studentContext) {
      prompt += `STUDENT CONTEXT:
- Name: ${this.studentContext.fullName}
- Grade: ${this.studentContext.grade || 'Not specified'}
- School: ${this.studentContext.school || 'Not specified'}

`;
    }

    prompt += `IMPORTANT GUIDELINES:
- Be encouraging and supportive
- For health issues: Always recommend seeing a doctor for serious concerns
- For education: Adapt to student's grade level
- For meal planning: Focus on nutritious, affordable options
- Keep responses clear and age-appropriate
- If asked about sensitive topics, direct to appropriate professionals

USER MESSAGE: ${userMessage}

Please provide a helpful, accurate response:`;

    return prompt;
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearHistory() {
    this.chatHistory = [];
  }

  // Specialized methods for different functionalities
  async generateQuiz(subject: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    const prompt = `Generate a ${difficulty} level quiz for ${subject} suitable for a ${this.studentContext?.grade || 'high school'} student.

Include:
- 5 multiple choice questions
- 3 short answer questions
- Answer key at the end

Format the quiz professionally and make it educational.`;

    return this.sendMessage(prompt);
  }

  async createMealPlan(budget: number, duration: number = 7): Promise<string> {
    const prompt = `Create a ${duration}-day meal plan for a student with a budget of $${budget}.

Consider:
- Nutritious and balanced meals
- Cost-effective ingredients
- Easy to prepare
- Cultural variety if possible
- Total cost breakdown

Make it practical and healthy.`;

    return this.sendMessage(prompt);
  }

  async provideHealthAdvice(symptoms: string): Promise<string> {
    const prompt = `A student is experiencing: ${symptoms}

Provide general health advice, but IMPORTANT:
- This is NOT medical diagnosis
- Recommend seeing a healthcare professional
- Suggest general wellness tips
- Ask about severity and duration
- Be supportive but cautious

Keep response helpful but not diagnostic.`;

    return this.sendMessage(prompt);
  }
}

// Export singleton instance
export const geminiAssistant = new GeminiAIAssistant();