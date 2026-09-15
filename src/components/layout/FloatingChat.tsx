'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { MessageSquare, X, Send, PhoneCall } from 'lucide-react';

export const FloatingChat: React.FC = () => {
  const { language, isRtl } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: language === 'ar'
        ? 'مرحباً بك في Hubcloud! 👋 كيف يمكن لفريق الدعم الفني والمبيعات مساعدتك اليوم؟'
        : 'Welcome to Hubcloud! 👋 How can our sales and IT engineering team assist you today?',
      time: 'Just now'
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setInputMsg('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: language === 'ar'
            ? 'شكراً لتواصلك! يمكنك أيضاً التواصل مباشرة مع فريق المهندسين عبر الواتساب على 010 60 777 895.'
            : 'Thanks for reaching out! You can also connect with our tech team directly on WhatsApp (+20 010 60 777 895).',
          time: 'Just now'
        }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 rtl:right-auto rtl:left-4 sm:rtl:left-6 z-40">
      {/* Chat Popover Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-96 max-w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[450px] max-h-[75vh] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-hub-blue text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                HC
              </div>
              <div>
                <h4 className="font-bold text-[14px] leading-tight">HUB CLOUD IT Support</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{language === 'ar' ? 'متصل الآن - جاهزون لمساعدتك' : 'Online - Ready to help'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-[13px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-hub-blue text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[10px] opacity-70 block text-end mt-1">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action - Call / WhatsApp */}
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-900 font-semibold">
            <a
              href="https://wa.me/201060777895"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-emerald-700"
            >
              <span>💬 WhatsApp: 010 60 777 895</span>
            </a>
            <a href="tel:01060777895" className="hover:underline flex items-center gap-1 text-hub-blue">
              <PhoneCall className="w-3 h-3" />
              <span>{language === 'ar' ? 'اتصل الآن' : 'Call Now'}</span>
            </a>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب استفسارك هنا...' : 'Type your question...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-hub-blue"
            />
            <button
              type="submit"
              className="bg-hub-blue hover:bg-hub-blue-dark text-white p-2.5 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customer Support Chat"
        className="w-14 h-14 rounded-full bg-hub-blue hover:bg-hub-blue-dark text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 fill-white" />}
      </button>
    </div>
  );
};
