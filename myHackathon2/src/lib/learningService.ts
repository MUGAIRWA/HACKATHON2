import { supabase } from './supabase';
import { geminiAssistant } from './gemini';
import { useAuth } from '../contexts/AuthContext';

export interface Subject {
  id: string;
  name: string;
  progress: number;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  totalQuestions: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: Date;
}

export interface LearningProgress {
  subject: string;
  topic: string;
  proficiencyLevel: number;
  completedLessons: number;
  totalQuizzes: number;
  averageScore: number;
  lastActivity: Date;
}

export class LearningService {
  private studentId: string | null = null;

  setStudentId(studentId: string) {
    this.studentId = studentId;
  }

  // Subject Management
  async getStudentSubjects(): Promise<Subject[]> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      const { data, error } = await supabase
        .from('student_learning_progress')
        .select('subject, proficiency_level, completed_lessons')
        .eq('student_id', this.studentId);

      if (error) throw error;

      // Group by subject and calculate progress
      const subjectMap = new Map<string, { total: number, completed: number }>();

      data?.forEach(item => {
        const current = subjectMap.get(item.subject) || { total: 0, completed: 0 };
        subjectMap.set(item.subject, {
          total: current.total + 1,
          completed: current.completed + (item.proficiency_level >= 70 ? 1 : 0)
        });
      });

      const subjects: Subject[] = [];
      subjectMap.forEach((progress, subjectName) => {
        const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
        subjects.push({
          id: subjectName.toLowerCase().replace(/\s+/g, '_'),
          name: subjectName,
          progress: Math.round(progressPercentage),
          icon: this.getSubjectIcon(subjectName)
        });
      });

      return subjects;
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      return [];
    }
  }

  private getSubjectIcon(subject: string): string {
    const icons: { [key: string]: string } = {
      'Mathematics': '📐',
      'Science': '🔬',
      'History': '📚',
      'English': '📝',
      'Geography': '🌍',
      'Physics': '⚛️',
      'Chemistry': '🧪',
      'Biology': '🧬'
    };
    return icons[subject] || '📖';
  }

  // Quiz Generation
  async generateQuiz(subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<Quiz> {
    try {
      const prompt = `Generate a ${difficulty} level quiz for ${subject} on the topic "${topic}".

Requirements:
- Create exactly 5 multiple choice questions
- Each question should have 4 options (A, B, C, D)
- Provide the correct answer index (0-3)
- Include a brief explanation for each correct answer
- Make questions appropriate for high school level
- Ensure questions test understanding, not just memorization

Format your response as JSON:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;

      const response = await geminiAssistant.sendMessage(prompt);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid quiz format received');

      const quizData = JSON.parse(jsonMatch[0]);

      const quiz: Quiz = {
        id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        subject,
        topic,
        difficulty,
        questions: quizData.questions.map((q: any, index: number) => ({
          id: `q_${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        totalQuestions: quizData.questions.length
      };

      return quiz;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz. Please try again.');
    }
  }

  // Quiz Management
  async saveQuizResult(quizResult: Omit<QuizResult, 'id' | 'completedAt'>): Promise<void> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .insert({
          student_id: this.studentId,
          subject: quizResult.quizId.split('_')[1] || 'Unknown',
          topic: 'Generated Quiz',
          difficulty: 'medium',
          total_questions: quizResult.totalQuestions,
          correct_answers: quizResult.correctAnswers,
          score: (quizResult.correctAnswers / quizResult.totalQuestions) * 100,
          time_taken_minutes: Math.round(quizResult.timeTaken / 60),
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update learning progress
      await this.updateLearningProgress(quizResult.quizId.split('_')[1] || 'Unknown', 'Quiz Topic', quizResult.score);

    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  }

  // Learning Progress
  async updateLearningProgress(subject: string, topic: string, score: number): Promise<void> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      // Check if progress record exists
      const { data: existing } = await supabase
        .from('student_learning_progress')
        .select('*')
        .eq('student_id', this.studentId)
        .eq('subject', subject)
        .eq('topic', topic)
        .single();

      if (existing) {
        // Update existing record
        const newAverageScore = ((existing.average_quiz_score * existing.total_quizzes) + score) / (existing.total_quizzes + 1);
        const newProficiency = Math.min(100, existing.proficiency_level + (score >= 70 ? 5 : 2));

        await supabase
          .from('student_learning_progress')
          .update({
            proficiency_level: newProficiency,
            total_quizzes: existing.total_quizzes + 1,
            average_quiz_score: newAverageScore,
            last_activity: new Date().toISOString()
          })
          .eq('student_id', this.studentId)
          .eq('subject', subject)
          .eq('topic', topic);
      } else {
        // Create new record
        await supabase
          .from('student_learning_progress')
          .insert({
            student_id: this.studentId,
            subject,
            topic,
            proficiency_level: score >= 70 ? 30 : 15,
            completed_lessons: 0,
            total_quizzes: 1,
            average_quiz_score: score,
            last_activity: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  }

  // Get Quiz History
  async getQuizHistory(): Promise<any[]> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('student_id', this.studentId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map(quiz => ({
        id: quiz.id,
        subject: quiz.subject,
        topic: quiz.topic,
        score: quiz.score,
        date: new Date(quiz.completed_at).toLocaleDateString(),
        status: quiz.score >= 70 ? 'passed' : 'failed'
      })) || [];
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      return [];
    }
  }

  // Teacher Functionality - Lesson Delivery
  async deliverLesson(subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    try {
      const prompt = `You are an expert teacher delivering a lesson on ${subject} - ${topic}.

Please provide:
1. A clear learning objective
2. Key concepts explained simply
3. 2-3 examples with step-by-step solutions
4. Practice questions for the student
5. Summary of main takeaways

Make this engaging and appropriate for ${difficulty} level understanding.
Keep the lesson comprehensive but not overwhelming.`;

      return await geminiAssistant.sendMessage(prompt);
    } catch (error) {
      console.error('Error delivering lesson:', error);
      throw new Error('Failed to deliver lesson. Please try again.');
    }
  }

  // Q&A Functionality
  async answerQuestion(subject: string, question: string): Promise<string> {
    try {
      const prompt = `You are a knowledgeable tutor specializing in ${subject}.

A student asks: "${question}"

Please provide:
1. A clear, step-by-step answer
2. Additional context or related concepts
3. If applicable, suggest similar problems to practice
4. Encourage the student to think about the solution

Keep your response helpful, encouraging, and educational.`;

      return await geminiAssistant.sendMessage(prompt);
    } catch (error) {
      console.error('Error answering question:', error);
      throw new Error('Failed to answer question. Please try again.');
    }
  }
}

// Export singleton instance
export const learningService = new LearningService();