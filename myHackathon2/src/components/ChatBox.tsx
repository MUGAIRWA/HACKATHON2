import React from 'react';

interface ChatBoxProps {
  context?: string;
  onOpenAIAssistant?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ context, onOpenAIAssistant }) => {
  return (
    <div className="h-full flex flex-col justify-center items-center bg-gray-100 rounded-lg border border-gray-200 p-4">
      <div className="text-gray-500 text-center">
        <p>
          {context === 'health' ? 'Health Chat Assistant' : context === 'meal' ? 'Meal Chat Assistant' : 'General Chat Assistant'}
        </p>
        <p className="text-xs mt-2">ChatBox component placeholder</p>
        {context === 'health' && onOpenAIAssistant && (
          <button
            onClick={onOpenAIAssistant}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            type="button"
          >
            Open AI Health Consultant
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBox;

