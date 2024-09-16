'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SentimentResult {
  positive: number;
  negative: number;
  neutral: number;
  overall: string;
}

const InterviewFeedbackAnalyzer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data: SentimentResult = await response.json();
      setSentiment(data);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've analyzed the sentiment of your feedback. Would you like to see the results?`
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while analyzing the sentiment. Could you please try again?'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-gray-900">Interview Feedback Analyzer</h1>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex-grow overflow-y-auto px-4 pt-5 pb-4 sm:p-6">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'text-left' : 'text-right'}`}>
                  <div className={`inline-block p-2 rounded-lg ${message.role === 'assistant' ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>
            <div className="px-4 py-3 bg-gray-50 sm:px-6">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your interview feedback..."
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Transition show={showResults} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setShowResults(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {/* <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" /> */}
            </TransitionChild>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Sentiment Analysis Results
                </Dialog.Title>
                <div className="mt-2">
                  {sentiment && (
                    <>
                      <p className="text-sm text-gray-500">Positive: {sentiment.positive.toFixed(2)}%</p>
                      <p className="text-sm text-gray-500">Negative: {sentiment.negative.toFixed(2)}%</p>
                      <p className="text-sm text-gray-500">Neutral: {sentiment.neutral.toFixed(2)}%</p>
                      <p className="mt-2 text-sm text-gray-500">
                        Overall sentiment: <strong>{sentiment.overall}</strong>
                      </p>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={() => setShowResults(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default InterviewFeedbackAnalyzer;