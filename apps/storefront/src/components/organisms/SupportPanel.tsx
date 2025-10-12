import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { askSupport } from '../../assistant/engine'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import { useNavigate } from 'react-router-dom'

type Message = {
  id: string
  from: 'user' | 'bot'
  text: string
  qid?: string
}

export default function SupportPanel() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: input.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const r = await askSupport(userMsg.text)
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: 'bot',
        text:
          r?.answer ||
          'I can only help with store policies or order status. Please rephrase your question.',
        qid: r?.qid || undefined,
      }
      setMessages((m) => [...m, botMsg])
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 2).toString(),
          from: 'bot',
          text: 'Sorry, something went wrong while contacting support.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = messages.length === 0 && !loading

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-indigo-600 text-white flex items-center justify-between px-6 py-4 shadow-md">
        <h1 className="text-lg font-semibold tracking-tight">Support Chat</h1>
        <Button
          onClick={() => nav(-1)}
          className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-3 py-1 font-medium text-sm shadow-sm"
        >
          ← Back
        </Button>
      </header>

      {/* Chat Section */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-5 bg-transparent">
        {isEmpty && (
          <div className="text-center mt-20 text-gray-500 text-sm">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-base">Start a conversation with Support AI</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.from === 'user' ? 'justify-end' : 'justify-start'
            } transition-all`}
          >
            <div className={`max-w-[80%] ${m.from === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.from === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              {m.qid && (
                <div className="text-xs text-gray-400 mt-1 px-1 font-mono">
                  {/* [{m.qid}] */}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.3s]" />
              </div>
              <span className="text-sm text-gray-500">Typing...</span>
            </div>
          </div>
        )}
      </main>

      {/* Input Box */}
      <footer
       
      >
        <div className="mx-auto max-w-3xl bg-white border border-gray-200 shadow-md rounded-full flex items-center gap-3 px-4 py-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-none shadow-none focus:ring-0 text-sm"
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <Button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
