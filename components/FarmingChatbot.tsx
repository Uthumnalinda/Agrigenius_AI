import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Icon } from './Icon';

const ChatMessageContent: React.FC<{ text: string }> = ({ text }) => {
    const parseInline = (line: string) => {
      return line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    return (
        <>
            {text.split('\n').map((line, index) => (
                <p key={index} className="min-h-[1em]">
                  {parseInline(line)}
                </p>
            ))}
        </>
    );
};


const FarmingChatbot: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(geminiService.createChatSession());
    setHistory([{
        role: 'model',
        parts: [{ text: "Hello! I'm AgriGenius. Ask me anything about farming, from crop cycles to soil health." }]
    }])
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || !chat || isLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
    setHistory(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessageStream({ message: userInput });
      let modelResponse = '';
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of response) {
        modelResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].parts[0].text = modelResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting. Please try again later." }] }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, chat, isLoading]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 pb-20">
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}>
            {msg.role === 'model' && <Icon name="leaf" className="w-8 h-8 text-lime-600 bg-lime-100 p-1.5 rounded-full flex-shrink-0 self-start" />}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-lime-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
               <ChatMessageContent text={msg.parts[0].text} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <Icon name="leaf" className="w-8 h-8 text-lime-600 bg-lime-100 p-1.5 rounded-full flex-shrink-0 self-start" />
             <div className="max-w-lg px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-lime-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-lime-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-lime-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-2 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about crops, soil, pests..."
              className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-500 pl-5 pr-12"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="absolute right-1.5 bg-lime-600 text-white rounded-full hover:bg-lime-700 disabled:bg-gray-400 transition-colors w-9 h-9 flex items-center justify-center"
            >
              <Icon name="send" className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FarmingChatbot;