import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  type: 'multiple-choice' | 'short-answer';
}

interface QuizFormProps {
  questions: Question[];
  onSubmit: (score: number, total: number, remarks: string) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [remarks, setRemarks] = useState('');

  const handleChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let calculatedScore = 0;
    questions.forEach(q => {
      if (answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    const percentage = (calculatedScore / questions.length) * 100;
    let generatedRemarks = '';
    if (percentage >= 90) {
      generatedRemarks = 'Excellent work! You have a strong understanding of the material.';
    } else if (percentage >= 75) {
      generatedRemarks = 'Good job! There is room for improvement.';
    } else if (percentage >= 50) {
      generatedRemarks = 'Fair effort, but you should review the material more.';
    } else {
      generatedRemarks = 'Needs improvement. Consider revisiting the topics and practicing more.';
    }
    setRemarks(generatedRemarks);
    setSubmitted(true);
    onSubmit(calculatedScore, questions.length, generatedRemarks);
  };

  if (submitted) {
    return (
      <div className="p-4 bg-white rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Quiz Results</h2>
        <p>
          You scored {score} out of {questions.length} ({((score / questions.length) * 100).toFixed(2)}%)
        </p>
        <p className="mt-2 font-semibold">{remarks}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-md">
      {questions.map(q => (
        <div key={q.id}>
          <p className="font-semibold mb-2">{q.id}. {q.question}</p>
          {q.type === 'multiple-choice' ? (
            q.options.map(option => (
              <label key={option} className="block mb-1 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={option}
                  checked={answers[q.id] === option}
                  onChange={() => handleChange(q.id, option)}
                  required
                  className="mr-2"
                />
                {option}
              </label>
            ))
          ) : (
            <input
              type="text"
              value={answers[q.id] || ''}
              onChange={e => handleChange(q.id, e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          )}
        </div>
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Submit Quiz
      </button>
    </form>
  );
};

export default QuizForm;
