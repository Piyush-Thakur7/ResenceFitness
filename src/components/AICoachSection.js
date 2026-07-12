'use client';

import { useState, useRef, useEffect } from 'react';

const SUGGESTED_PROMPTS = [
  { text: 'Lower back is sore, what variations should I do?', icon: '🩹' },
  { text: 'High-protein suggestions for my diet', icon: '🥚' },
  { text: 'How do I maintain posture during heavy bench press?', icon: '🏋️' },
  { text: 'Explain the benefits of dynamic warm-ups', icon: '🔥' },
];

/**
 * AICoachSection component rendering the chatbot interface.
 * @param {Object} props - Component properties.
 * @param {Object} props.profile - User profile metadata (goals, diet, injuries).
 * @param {boolean} [props.demoMode=false] - Whether to bypass Gemini calls and use local responses.
 */
export default function AICoachSection({ profile, demoMode = false }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your **Resence AI Coach**. 

I have analyzed your fitness profile (Goal: **${profile.fitness_goal}**, Diet: **${profile.diet_preference}**, Conditioning: **${profile.conditioning_preference}**).

How can I help you optimize your training, recovery, or diet structure today? Remember: *Every Day Is Day One.*`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef(null);

  // Auto scroll to latest message inside the container to avoid page shifts
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async (text) => {
    if (!text.trim() || sending) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    if (demoMode) {
      // Simulate local coach advice
      setTimeout(() => {
        let reply = '';
        const lower = text.toLowerCase();
        if (lower.includes('back') || lower.includes('sore') || lower.includes('pain')) {
          reply = `Coach here. Since you mentioned physical limitation/soreness, focus on active recovery:\n- Replace heavy spine-loaded squats with **bodyweight air squats**.\n- Implement **bird-dogs** and **plank holds** to stabilize your core.\n- Keep movements controlled. *Discipline Equals Freedom.*`;
        } else if (lower.includes('protein') || lower.includes('diet') || lower.includes('eat')) {
          reply = `Let's optimize your **${profile.diet_preference}** fuel targets for **${profile.fitness_goal}**:\n- **Veg/Vegan**: Prioritize tempeh, tofu, lentils, double-toned milk, paneer, or soy isolates.\n- **Eggetarian**: Add egg-whites (3-5 whites daily).\n- Ensure you spread protein intake across 4 daily meals to maximize muscle protein synthesis.`;
        } else {
          reply = `Understood. To hit your target goal of **${profile.fitness_goal}**:\n- Lock in your daily routines and check off every exercise.\n- Pay close attention to your **${profile.conditioning_preference}** conditioning splits.\n- Maintain absolute form control. Let me know if you need specific exercise posture guides!`;
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        setSending(false);
      }, 1000);
      return;
    }

    try {
      const chatHistory = [...messages, userMessage];
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const res = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, messages: chatHistory }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedText += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                role: 'assistant',
                content: accumulatedText,
              };
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].content === '') {
          updated.pop();
        }
        return [
          ...updated,
          {
            role: 'assistant',
            content: `⚠️ *Plan Generation Note*: Live API chat request failed (${err.message}). Re-routing to offline assistance. Keep your core tight and your chest high!`,
          },
        ];
      });
    } finally {
      setSending(false);
    }
  };

  const handleChipClick = (promptText) => {
    handleSend(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between stripe-card p-4 gap-4">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center font-display tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2.5 animate-pulse"></span>
            Resence AI Coach
          </h1>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-light">Custom training assistant calibrated to your body metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[8px] text-zinc-450 font-bold uppercase tracking-wider">
          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">Goal: {profile.fitness_goal}</span>
          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">Diet: {profile.diet_preference}</span>
          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">Injuries: {profile.injuries || 'None'}</span>
        </div>
      </div>

      {/* Main Chat Panel Container */}
      <div className="flex-1 stripe-card flex flex-col overflow-hidden relative shadow-sm">
        {/* Messages List Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-5 overflow-y-auto space-y-4 text-sm leading-relaxed scrollbar-thin"
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl border text-xs whitespace-pre-line ${
                    isUser
                      ? 'bg-orange-500/10 border-orange-500/25 text-white rounded-br-none shadow-md shadow-orange-500/5'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-300 rounded-bl-none'
                  }`}
                >
                  {!isUser && (
                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider block mb-1">
                      Coach Response
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl rounded-bl-none text-xs text-zinc-400 flex items-center space-x-2">
                <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">Coach is analyzing</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-300"></span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompt Chips */}
        {messages.length === 1 && (
          <div className="px-5 pb-3">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Suggested topics</span>
            <div className="flex flex-row overflow-x-auto gap-2 pb-1.5 scrollbar-none no-wrap">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(prompt.text)}
                  className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-left text-[11px] flex items-center space-x-2 flex-shrink-0 cursor-pointer transition-colors"
                >
                  <span className="text-xs">{prompt.icon}</span>
                  <span className="whitespace-nowrap">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-zinc-950/60 border-t border-zinc-850">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              placeholder="Ask about workouts, diet, or posture..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              disabled={sending}
              required
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
