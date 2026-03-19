import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Send, Search, MessageSquare } from 'lucide-react'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { useChatStore } from '../../stores/chatStore'
import { useSocket } from '../../hooks/useSocket'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

const MOCK_CONVERSATIONS = [
  {
    _id: 'c1',
    customer: { name: 'Priya Sharma', avatar: null },
    lastMessage: { content: 'Can the Basic package be customized?', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    unreadCount: 1,
  },
  {
    _id: 'c2',
    customer: { name: 'Rahul Mehta', avatar: null },
    lastMessage: { content: 'Thank you for the quick response!', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    unreadCount: 0,
  },
]

const MOCK_MESSAGES = {
  c1: [
    { _id: 'm1', content: 'Hi! I wanted to ask about the wedding packages.', sender: 'customer', createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    { _id: 'm2', content: 'Hello Priya! Happy to help. We have Basic, Premium, and Luxury tiers.', sender: 'vendor', createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
    { _id: 'm3', content: 'Can the Basic package be customized?', sender: 'customer', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  ],
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function getInitials(name) {
  return (name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function VendorChat() {
  const {
    conversations, activeConversation, messages,
    setConversations, setActiveConversation, setMessages, addMessage, typingUsers,
  } = useChatStore()
  const { joinConversation, sendMessage, sendTyping } = useSocket()

  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [typingTimeout, setTypingTimeout] = useState(null)
  const messagesEndRef = useRef(null)

  const { data: convData } = useQuery({
    queryKey: ['vendor-conversations'],
    queryFn: () => api.get('/chat/conversations'),
    onSuccess: ({ data }) => setConversations(data.conversations),
  })

  const displayConversations = (convData?.data?.conversations || MOCK_CONVERSATIONS).filter((c) =>
    search ? c.customer?.name?.toLowerCase().includes(search.toLowerCase()) : true
  )

  const activeMessages = activeConversation
    ? (messages[activeConversation._id] || MOCK_MESSAGES[activeConversation._id] || [])
    : []

  const anyTyping = activeConversation ? Object.values(typingUsers).some(Boolean) : false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, anyTyping])

  function selectConversation(conv) {
    setActiveConversation(conv)
    joinConversation(conv._id)
    if (!messages[conv._id]) {
      api.get(`/chat/conversations/${conv._id}/messages`)
        .then(({ data }) => setMessages(conv._id, data.messages))
        .catch(() => setMessages(conv._id, MOCK_MESSAGES[conv._id] || []))
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    if (activeConversation) {
      sendTyping(activeConversation._id, true)
      clearTimeout(typingTimeout)
      setTypingTimeout(setTimeout(() => sendTyping(activeConversation._id, false), 1500))
    }
  }

  function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !activeConversation) return
    const msg = { _id: `local-${Date.now()}`, content: input.trim(), sender: 'vendor', createdAt: new Date().toISOString(), conversationId: activeConversation._id }
    addMessage(activeConversation._id, msg)
    sendMessage({ conversationId: activeConversation._id, content: input.trim() })
    setInput('')
    sendTyping(activeConversation._id, false)
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-6">Messages</h1>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-black/5" style={{ height: '560px' }}>

          {/* List */}
          <div className="lg:col-span-1 border-r border-black/5 flex flex-col bg-white">
            <div className="p-4 border-b border-black/5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" className="w-full pl-8 pr-3 py-2 rounded-lg text-sm font-lato border border-[rgba(139,67,50,0.15)] bg-[#FFFEF5] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20 text-[#101828] placeholder:text-[#6A6A6A]" />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {displayConversations.map((conv) => {
                const isActive = activeConversation?._id === conv._id
                return (
                  <button key={conv._id} onClick={() => selectConversation(conv)} className="w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors hover:bg-[#FFF3EF]/60 border-b border-black/3" style={isActive ? { background: '#FFF3EF' } : {}}>
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-lato font-bold text-sm text-white" style={{ background: '#F06138' }}>
                        {getInitials(conv.customer?.name)}
                      </div>
                      {conv.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: '#F06138', color: '#fff' }}>{conv.unreadCount}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-lato text-sm truncate ${conv.unreadCount ? 'font-bold text-[#101828]' : 'font-medium text-[#101828]'}`}>{conv.customer?.name}</p>
                        <span className="font-lato text-[10px] text-[#6A6A6A] shrink-0 ml-1">{timeAgo(conv.lastMessage?.createdAt)}</span>
                      </div>
                      <p className="font-lato text-xs truncate mt-0.5 text-[#6A6A6A]">{conv.lastMessage?.content}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Thread */}
          <div className="lg:col-span-2 flex flex-col bg-[#FFFDFC]">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-white">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-lato font-bold text-sm text-white" style={{ background: '#F06138' }}>
                    {getInitials(activeConversation.customer?.name)}
                  </div>
                  <p className="font-lato font-semibold text-[#101828] text-sm">{activeConversation.customer?.name}</p>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {activeMessages.map((msg) => {
                      const isMine = msg.sender === 'vendor'
                      return (
                        <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[70%] px-4 py-2.5 rounded-2xl font-lato text-sm" style={isMine ? { background: '#F06138', color: '#fff', borderBottomRightRadius: '4px' } : { background: '#FEFDEB', color: '#101828', border: '1px solid rgba(139,67,50,0.1)', borderBottomLeftRadius: '4px' }}>
                            {msg.content}
                            <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-[#6A6A6A]'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {anyTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl flex gap-1 items-center" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
                        {[0,1,2].map((i) => <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-[#8B4332]" animate={{ y: [0,-4,0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />)}
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-3 px-5 py-4 border-t border-black/5 bg-white">
                  <input value={input} onChange={handleInputChange} placeholder="Type a message…" className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-[#FFFEF5] text-sm font-lato text-[#101828] placeholder:text-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20" />
                  <motion.button type="submit" disabled={!input.trim()} whileTap={{ scale: 0.94 }} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40" style={{ background: '#F06138' }}>
                    <Send size={16} className="text-white" />
                  </motion.button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#FFF3EF' }}>
                  <MessageSquare size={28} className="text-[#F06138]" />
                </div>
                <p className="font-lato font-semibold text-[#101828] text-sm mb-1">Select a conversation</p>
                <p className="font-lato text-xs text-[#6A6A6A]">Choose a customer to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  )
}
