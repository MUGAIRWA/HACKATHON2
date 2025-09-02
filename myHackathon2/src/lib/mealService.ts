import { supabase } from './supabase';
import { geminiAssistant } from './gemini';

export interface MealPlan {
  id: string;
  studentId: string;
  budget: number;
  duration: number; // days
  totalCost: number;
  meals: Meal[];
  nutritionalSummary: NutritionalInfo;
  createdAt: Date;
  expiresAt: Date;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: string[];
  cost: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  instructions: string;
  day: number;
}

export interface NutritionalInfo {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  averageCostPerDay: number;
  budgetUtilization: number;
}

export interface MealHistory {
  id: string;
  date: Date;
  meal: string;
  food: string;
  cost: number;
  nutritionalValue: string;
}

export class MealService {
  private studentId: string | null = null;

  setStudentId(studentId: string) {
    this.studentId = studentId;
  }

  // Generate Meal Plan
  async generateMealPlan(budget: number, duration: number = 7, preferences: string = ''): Promise<MealPlan> {
    try {
      const prompt = `Create a ${duration}-day meal plan for a student with a $${budget} weekly budget.

Requirements:
- Total cost should not exceed $${budget}
- Include breakfast, lunch, dinner, and 1-2 snacks per day
- Focus on nutritious, balanced meals
- Use affordable ingredients
- Consider food variety and cultural preferences
- Include simple recipes with basic instructions
- Provide nutritional information (calories, protein, carbs, fat)

Preferences: ${preferences || 'No specific preferences'}

Format your response as JSON:
{
  "meals": [
    {
      "day": 1,
      "type": "breakfast",
      "name": "Oatmeal with Fruit",
      "ingredients": ["oats", "banana", "milk"],
      "cost": 2.50,
      "calories": 350,
      "protein": 12,
      "carbs": 60,
      "fat": 8,
      "instructions": "Cook oats with milk, add sliced banana"
    }
  ],
  "nutritionalSummary": {
    "totalCalories": 2100,
    "totalProtein": 85,
    "totalCarbs": 280,
    "totalFat": 65,
    "averageCostPerDay": 15.50,
    "budgetUtilization": 85
  }
}`;

      const response = await geminiAssistant.sendMessage(prompt);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid meal plan format received');

      const planData = JSON.parse(jsonMatch[0]);

      const mealPlan: MealPlan = {
        id: `mealplan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId: this.studentId || '',
        budget,
        duration,
        totalCost: planData.nutritionalSummary.averageCostPerDay * duration,
        meals: planData.meals.map((meal: any, index: number) => ({
          id: `meal_${index}`,
          type: meal.type,
          name: meal.name,
          ingredients: meal.ingredients,
          cost: meal.cost,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          instructions: meal.instructions,
          day: meal.day
        })),
        nutritionalSummary: planData.nutritionalSummary,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000))
      };

      // Save to database
      await this.saveMealPlan(mealPlan);

      return mealPlan;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan. Please try again.');
    }
  }

  // Save Meal Plan to Database
  async saveMealPlan(mealPlan: MealPlan): Promise<void> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          student_id: this.studentId,
          budget_amount: mealPlan.budget,
          duration_days: mealPlan.duration,
          total_estimated_cost: mealPlan.totalCost,
          meal_plan_data: {
            meals: mealPlan.meals,
            nutritionalSummary: mealPlan.nutritionalSummary
          },
          nutritional_summary: mealPlan.nutritionalSummary,
          created_at: mealPlan.createdAt.toISOString(),
          expires_at: mealPlan.expiresAt.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  }

  // Get Current Meal Plan
  async getCurrentMealPlan(): Promise<MealPlan | null> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('student_id', this.studentId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        studentId: data.student_id,
        budget: data.budget_amount,
        duration: data.duration_days,
        totalCost: data.total_estimated_cost,
        meals: data.meal_plan_data.meals,
        nutritionalSummary: data.nutritional_summary,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at)
      };
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      return null;
    }
  }

  // Quick Meal Suggestions
  async getQuickMealSuggestions(budget: number, mealType: string): Promise<Meal[]> {
    try {
      const prompt = `Suggest 3 ${mealType} options for a student with a $${budget} daily budget.

For each meal include:
- Name
- Key ingredients
- Estimated cost
- Basic nutritional info
- Simple preparation instructions

Focus on healthy, affordable options.`;

      const response = await geminiAssistant.sendMessage(prompt);

      // Parse suggestions from response
      const suggestions = this.parseMealSuggestions(response, mealType);
      return suggestions;
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      return [];
    }
  }

  private parseMealSuggestions(response: string, mealType: string): Meal[] {
    // Simple parsing - in production, you'd want more robust parsing
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    const suggestions: Meal[] = [];

    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i];
      if (line.length > 10) { // Basic filter for actual meal suggestions
        suggestions.push({
          id: `quick_${i}`,
          type: mealType as any,
          name: line.split(':')[0]?.trim() || `Meal Option ${i + 1}`,
          ingredients: ['Basic ingredients'],
          cost: 5.00, // Default cost
          calories: 400,
          protein: 15,
          carbs: 50,
          fat: 10,
          instructions: 'Simple preparation instructions',
          day: 1
        });
      }
    }

    return suggestions;
  }

  // Budget Analysis
  async analyzeBudgetSpending(): Promise<{
    totalSpent: number;
    totalBudget: number;
    remainingBudget: number;
    averageDailySpending: number;
    recommendations: string[];
  }> {
    if (!this.studentId) throw new Error('Student ID not set');

    try {
      // In a real implementation, this would analyze actual spending data
      // For now, return mock analysis
      const analysis = {
        totalSpent: 45.50,
        totalBudget: 100.00,
        remainingBudget: 54.50,
        averageDailySpending: 6.50,
        recommendations: [
          'Consider meal prepping to reduce daily costs',
          'Look for sales on staple ingredients',
          'Try store brands instead of name brands'
        ]
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing budget:', error);
      throw error;
    }
  }

  // Nutritional Education
  async getNutritionalTips(): Promise<string[]> {
    try {
      const prompt = `Provide 5 practical nutritional tips for students on a budget.

Focus on:
- Maximizing nutrition from affordable foods
- Balanced meal planning
- Healthy eating habits
- Portion control
- Making the most of limited resources

Make them actionable and realistic.`;

      const response = await geminiAssistant.sendMessage(prompt);

      return response.split('\n')
        .filter(line => line.trim().length > 0)
        .filter(line => /^\d+\.|\•|-/.test(line.trim()))
        .map(line => line.replace(/^\d+\.|\•|-/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting nutritional tips:', error);
      return [
        'Include a variety of colorful vegetables in your meals',
        'Choose whole grains over refined grains when possible',
        'Include protein in every meal to stay full longer',
        'Stay hydrated with water instead of sugary drinks',
        'Plan meals ahead to make healthier choices'
      ];
    }
  }

  // Grocery List Generation
  async generateGroceryList(mealPlan: MealPlan): Promise<{ [category: string]: string[] }> {
    try {
      const allIngredients = mealPlan.meals.flatMap(meal => meal.ingredients);

      const prompt = `Organize these ingredients into grocery categories:

Ingredients: ${allIngredients.join(', ')}

Categories should include:
- Produce (fruits and vegetables)
- Dairy
- Proteins (meat, fish, eggs, beans)
- Grains (rice, bread, pasta)
- Pantry staples (oil, spices, canned goods)
- Other

Format as a shopping list with categories.`;

      const response = await geminiAssistant.sendMessage(prompt);

      // Parse into categories
      return this.parseGroceryList(response);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      return {
        'Produce': ['Fruits and vegetables'],
        'Proteins': ['Meat, fish, eggs, beans'],
        'Dairy': ['Milk, cheese, yogurt'],
        'Grains': ['Bread, rice, pasta'],
        'Pantry': ['Oil, spices, canned goods']
      };
    }
  }

  private parseGroceryList(response: string): { [category: string]: string[] } {
    const categories: { [key: string]: string[] } = {};
    const lines = response.split('\n');

    let currentCategory = '';

    for (const line of lines) {
      if (line.includes(':') && !line.includes(',')) {
        // This is a category header
        currentCategory = line.split(':')[0].trim();
        categories[currentCategory] = [];
      } else if (currentCategory && line.trim()) {
        // This is an item in the current category
        categories[currentCategory].push(line.trim().replace(/^[-•*]\s*/, ''));
      }
    }

    return categories;
  }

  // Create a new meal request
  async createMealRequest(amount: number, mealType: string, description: string): Promise<void> {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User must be authenticated to create meal requests');
    }

    // Use the authenticated user's ID instead of the stored studentId
    const studentId = user.id;

    // Validate and capitalize mealType to match database enum
    const allowedMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();

    if (!allowedMealTypes.includes(capitalizedMealType)) {
      throw new Error(`Invalid mealType: ${mealType}. Allowed values are ${allowedMealTypes.join(', ')}`);
    }

    try {
      // Use the exact same format as the sample data in database-setup.sql
      const requestedFor = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow as Date object

      const { error } = await supabase
        .from('meal_requests')
        .insert({
          student_id: studentId,
          title: `${capitalizedMealType} Request`,
          description: description,
          amount: amount,
          meal_type: capitalizedMealType,
          requested_for: requestedFor,
          status: 'pending'
        });

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw new Error(`Failed to create meal request: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating meal request:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mealService = new MealService();
