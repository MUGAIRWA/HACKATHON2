import { supabase } from './supabase';
import { geminiAssistant } from './gemini';

export interface HealthRecord {
  id: string;
  studentId: string;
  symptoms: string;
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  duration: number; // days
  notes: string;
  aiSuggestions: string;
  professionalRecommendation: string;
  reportedAt: Date;
  lastUpdated: Date;
}

export interface HealthMetrics {
  id: string;
  metric: string;
  value: string;
  status: 'good' | 'fair' | 'poor';
  trend: 'up' | 'down' | 'stable';
}

export class HealthService {
  private studentId: string | null = null;

  setStudentId(studentId: string) {
    this.studentId = studentId;
  }

  // Health Assessment
  async assessSymptoms(symptoms: string, duration: number, additionalNotes: string = ''): Promise<{
    severity: 'mild' | 'moderate' | 'severe' | 'emergency';
    aiSuggestions: string;
    professionalRecommendation: string;
  }> {
    try {
      const prompt = `You are a health assessment AI. A student reports the following symptoms:

Symptoms: ${symptoms}
Duration: ${duration} days
Additional Notes: ${additionalNotes}

Please provide:
1. Severity assessment (mild/moderate/severe/emergency)
2. General health suggestions (NOT medical diagnosis)
3. Clear recommendation to see a healthcare professional

IMPORTANT: Emphasize that this is NOT medical advice and they should consult a doctor.
Be supportive but cautious in your recommendations.`;

      const response = await geminiAssistant.sendMessage(prompt);

      // Parse the response to extract structured information
      const severity = this.extractSeverity(response);
      const suggestions = this.extractSuggestions(response);
      const recommendation = this.extractRecommendation(response);

      return {
        severity,
        aiSuggestions: suggestions,
        professionalRecommendation: recommendation
      };
    } catch (error) {
      console.error('Error assessing symptoms:', error);
      throw new Error('Failed to assess symptoms. Please consult a healthcare professional.');
    }
  }

  private extractSeverity(response: string): 'mild' | 'moderate' | 'severe' | 'emergency' {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('emergency') || lowerResponse.includes('immediate')) return 'emergency';
    if (lowerResponse.includes('severe')) return 'severe';
    if (lowerResponse.includes('moderate')) return 'moderate';
    return 'mild';
  }

  private extractSuggestions(response: string): string {
    // Extract general suggestions from the AI response
    const suggestions = response.split('\n')
      .filter(line => line.includes('suggestion') || line.includes('recommend') || line.includes('try'))
      .join('\n');

    return suggestions || 'Please consult a healthcare professional for personalized advice.';
  }

  private extractRecommendation(response: string): string {
    return 'IMPORTANT: This is not medical advice. Please consult a qualified healthcare professional for proper diagnosis and treatment. If symptoms are severe or worsening, seek immediate medical attention.';
  }

  // Save Health Record
  async saveHealthRecord(record: Omit<HealthRecord, 'id' | 'reportedAt' | 'lastUpdated'>): Promise<void> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      const { error } = await supabase
        .from('health_monitoring')
        .insert({
          student_id: this.studentId,
          symptoms: record.symptoms,
          severity: record.severity,
          duration_days: record.duration,
          additional_notes: record.notes,
          ai_suggestions: record.aiSuggestions,
          professional_recommendation: record.professionalRecommendation,
          reported_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving health record:', error);
      throw error;
    }
  }

  // Get Health History
  async getHealthHistory(): Promise<HealthRecord[]> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      const { data, error } = await supabase
        .from('health_monitoring')
        .select('*')
        .eq('student_id', this.studentId)
        .order('reported_at', { ascending: false });

      if (error) throw error;

      return data?.map(record => ({
        id: record.id,
        studentId: record.student_id,
        symptoms: record.symptoms,
        severity: record.severity,
        duration: record.duration_days,
        notes: record.additional_notes,
        aiSuggestions: record.ai_suggestions,
        professionalRecommendation: record.professional_recommendation,
        reportedAt: new Date(record.reported_at),
        lastUpdated: new Date(record.last_updated)
      })) || [];
    } catch (error) {
      console.error('Error fetching health history:', error);
      return [];
    }
  }

  // Get Health Metrics (mock data for now - would come from wearables/health apps)
  async getHealthMetrics(): Promise<HealthMetrics[]> {
    // In a real implementation, this would fetch from health tracking devices/APIs
    return [
      {
        id: '1',
        metric: 'Sleep',
        value: '7.5 hrs/day',
        status: 'good',
        trend: 'up'
      },
      {
        id: '2',
        metric: 'Exercise',
        value: '3 days/week',
        status: 'fair',
        trend: 'stable'
      },
      {
        id: '3',
        metric: 'Water Intake',
        value: '6 glasses/day',
        status: 'fair',
        trend: 'up'
      },
      {
        id: '4',
        metric: 'Stress Level',
        value: 'Moderate',
        status: 'fair',
        trend: 'down'
      }
    ];
  }

  // Health Tips and Education
  async getHealthTips(category?: string): Promise<string[]> {
    try {
      const categoryPrompt = category ? ` for ${category}` : '';
      const prompt = `Provide 5 practical health tips${categoryPrompt} for students.

Focus on:
- Mental health and stress management
- Physical wellness
- Nutrition
- Sleep hygiene
- Study-life balance

Make them actionable and realistic for student life.`;

      const response = await geminiAssistant.sendMessage(prompt);

      // Parse tips from response
      return response.split('\n')
        .filter(line => line.trim().length > 0)
        .filter(line => /^\d+\.|\•|-/.test(line.trim()))
        .map(line => line.replace(/^\d+\.|\•|-/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting health tips:', error);
      return [
        'Drink at least 8 glasses of water daily',
        'Get 7-9 hours of sleep each night',
        'Take short breaks during study sessions',
        'Eat balanced meals with fruits and vegetables',
        'Practice deep breathing for stress relief'
      ];
    }
  }

  // Emergency Assessment
  async assessEmergency(symptoms: string): Promise<{
    isEmergency: boolean;
    urgency: string;
    action: string;
  }> {
    try {
      const prompt = `EMERGENCY ASSESSMENT: Student reports: "${symptoms}"

Determine if this requires immediate medical attention.

Respond with:
1. Is this an emergency? (yes/no)
2. Urgency level (immediate/urgent/routine)
3. Recommended action

Be conservative - when in doubt, recommend seeking medical help.`;

      const response = await geminiAssistant.sendMessage(prompt);

      const isEmergency = response.toLowerCase().includes('yes') || response.toLowerCase().includes('emergency');
      const urgency = response.toLowerCase().includes('immediate') ? 'immediate' :
                     response.toLowerCase().includes('urgent') ? 'urgent' : 'routine';

      return {
        isEmergency,
        urgency,
        action: isEmergency ?
          'CALL EMERGENCY SERVICES (911 or local emergency number) IMMEDIATELY' :
          'Contact a healthcare provider as soon as possible'
      };
    } catch (error) {
      console.error('Error assessing emergency:', error);
      return {
        isEmergency: true, // Default to emergency when assessment fails
        urgency: 'immediate',
        action: 'CALL EMERGENCY SERVICES IMMEDIATELY'
      };
    }
  }

  // Wellness Check-in
  async wellnessCheckIn(mood: string, energy: string, sleep: string, stress: string): Promise<string> {
    try {
      const prompt = `Wellness Check-in Analysis:

Student reports:
- Mood: ${mood}
- Energy level: ${energy}
- Sleep quality: ${sleep}
- Stress level: ${stress}

Provide:
1. Brief assessment of their current wellness state
2. 2-3 specific, actionable suggestions
3. Encouragement and positive reinforcement
4. Reminder to seek professional help if needed

Keep response supportive and practical.`;

      return await geminiAssistant.sendMessage(prompt);
    } catch (error) {
      console.error('Error with wellness check-in:', error);
      return 'Thank you for checking in. Remember to prioritize self-care and reach out to counselors or healthcare providers when needed.';
    }
  }
}

// Export singleton instance
export const healthService = new HealthService();