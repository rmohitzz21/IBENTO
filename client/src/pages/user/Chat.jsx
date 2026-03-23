import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Send, Search, MessageSquare } from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import { useChatStore } from '../../stores/chatStore'
import { useSocket } from '../../hooks/useSocket'
import { useAuthStore } from '../../stores/authStore'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// Normalise a raw conversation from the server.
// In user chat the "other" participant is the vendor.
function normalizeConversation(conv, userId) {
  const other = conv.participants?.find((p) => {
    const pid = p._id?.toString()
    return pid && pid !== userId?.toString()
  }) || conv.participants?.[0]

  const unreadMap = conv.unreadCount || {}
  const myUnread = typeof unreadMap === 'object' ? (unreadMap[userId] || 0) : 0

  return {
    ...conv,
    vendor: {
      _id: other?._id,
      businessName: other?.businessName || other?.name || '—',
      avatar: other?.avatar || null,
    },
    lastMessage: {
      content: conv.lastMessage || '',
      createdAt: conv.lastMessageAt || conv.updatedAt,
    },
    unreadCount: myUnread,
  }
}

// Determine if a message was sent by the current user
function isMine(msg, userId) {
  if (msg.sender === 'user') return true
  if (msg.senderId?._id) return msg.senderId._id.toString() === userId?.toString()
  if (typeof msg.senderId === 'string') return msg.senderId === userId?.toString()
  return false
}

export default function Chat() {
  const location = useLocation()
  const locationState = location.state || {}

  const { user } = useAuthStore()
  const {
    conversations, activeConversation, messages,
    setConversations, setActiveConversation, setMessages, addMessage, typingUsers,
  } = useChatStore()
  const { joinConversation, sendTyping } = useSocket()

  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const messagesEndRef = useRef(null)

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations'),
  })

  // Load & normalise conversations, auto-select when coming from VendorProfile
  useEffect(() => {
    const raw = convData?.data?.conversations || []
    const normalised = raw.map((c) => normalizeConversation(c, user?.id))
    if (normalised.length) {
      setConversations(normalised)

      // Auto-open a specific vendor conversation from navigation state
      if (locationState.userId && !activeConversation) {
        const match = normalised.find((c) => c.vendor?._id?.toString() === locationState.userId?.toString())
        if (match) selectConversation(match)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convData])

  const displayConversations = (conversations || []).filter((c) =>
    search ? c.vendor?.businessName?.toLowerCase().includes(search.toLowerCase()) : true
  )

  const activeMessages = activeConversation
    ? (messages[activeConversation._id] || [])
    : []

  const anyTyping = activeConversation
    ? Object.values(typingUsers).some(Boolean)
    : false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, anyTyping])

  function selectConversation(conv) {
    setActiveConversation(conv)
    joinConversation(conv._id)
    if (!messages[conv._id]) {
      api.get(`/messages/conversations/${conv._id}`)
        .then(({ data }) => setMessages(conv._id, data.messages || []))
        .catch(() => setMessages(conv._id, []))
    }
    // Mark as read
    api.put(`/messages/conversations/${conv._id}/read`).catch(() => {})
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    if (activeConversation) {
      sendTyping(activeConversation._id, true)
      clearTimeout(typingTimeout)
      setTypingTimeout(setTimeout(() => sendTyping(activeConversation._id, false), 1500))
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !activeConversation || sending) return

    const text = input.trim()
    setInput('')
    setSending(true)

    // Optimistic message
    const optimistic = {
      _id: `local-${Date.now()}`,
      content: text,
      sender: 'user',
      senderId: { _id: user?.id },
      createdAt: new Date().toISOString(),
    }
    addMessage(activeConversation._id, optimistic)

    try {
      const receiverId = activeConversation.vendor?._id
      await api.post('/messages/send', { receiverId, content: text })
    } catch {
      // message already shown optimistically; ignore send failure silently
    } finally {
      setSending(false)
      sendTyping(activeConversation._id, false)
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC] flex flex-col">
      <UserNavbar />

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-8">
        <h1 className="font-filson font-black text-[#101828] text-3xl mb-6">Messages</h1>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-black/5"
          style={{ height: '600px' }}
        >
          {/* Conversation list */}
          <div className="lg:col-span-1 border-r border-black/5 flex flex-col" style={{ background: '#FFFEF5' }}>
            <div className="p-4 border-b border-black/5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors…"
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-sm font-lato border border-[rgba(139,67,50,0.15)] bg-white focus:outline-none focus:ring-2 focus:ring-[#F06138]/20 text-[#101828] placeholder:text-[#6A6A6A]"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {displayConversations.length === 0 ? (
                <div className="py-16 text-center">
                  <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="font-lato text-xs text-[#6A6A6A]">No conversations yet</p>
                </div>
              ) : (
                displayConversations.map((conv) => {
                  const isActive = activeConversation?._id === conv._id
                  return (
                    <button
                      key={conv._id}
                      onClick={() => selectConversation(conv)}
                      className="w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors hover:bg-[#FFF3EF]/60 border-b border-black/3"
                      style={isActive ? { background: '#FFF3EF' } : {}}
                    >
                      <div className="relative shrink-0">
                        {conv.vendor?.avatar ? (
                          <img src={conv.vendor.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#F06138] text-white text-sm font-bold flex items-center justify-center">
                            {conv.vendor?.businessName?.charAt(0) || '?'}
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: '#F06138', color: '#fff' }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-lato text-sm truncate ${conv.unreadCount ? 'font-bold text-[#101828]' : 'font-medium text-[#101828]'}`}>
                            {conv.vendor?.businessName}
                          </p>
                          <span className="font-lato text-[10px] text-[#6A6A6A] shrink-0 ml-1">
                            {timeAgo(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <p className={`font-lato text-xs truncate mt-0.5 ${conv.unreadCount ? 'text-[#364153]' : 'text-[#6A6A6A]'}`}>
                          {conv.lastMessage?.content}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-2 flex flex-col" style={{ background: '#FFFDFC' }}>
            {activeConversation ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5" style={{ background: '#FFFEF5' }}>
                  {activeConversation.vendor?.avatar ? (
                    <img src={activeConversation.vendor.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#F06138] text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {activeConversation.vendor?.businessName?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-lato font-semibold text-[#101828] text-sm">{activeConversation.vendor?.businessName}</p>
                    <p className="font-lato text-xs text-[#016630]">Vendor</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {activeMessages.map((msg) => {
                      const mine = isMine(msg, user?.id)
                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className="max-w-[70%] px-4 py-2.5 rounded-2xl font-lato text-sm"
                            style={mine
                              ? { background: '#F06138', color: '#fff', borderBottomRightRadius: '4px' }
                              : { background: '#FEFDEB', color: '#101828', border: '1px solid rgba(139,67,50,0.1)', borderBottomLeftRadius: '4px' }
                            }
                          >
                            {msg.content}
                            <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-[#6A6A6A]'}`}>
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
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#8B4332]"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <form onSubmit={handleSend} className="flex items-center gap-3 px-5 py-4 border-t border-black/5" style={{ background: '#FFFEF5' }}>
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-white text-sm font-lato text-[#101828] placeholder:text-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20"
                  />
                  <motion.button
                    type="submit"
                    disabled={!input.trim() || sending}
                    whileTap={{ scale: 0.94 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
                    style={{ background: '#F06138' }}
                  >
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
                <p className="font-lato text-xs text-[#6A6A6A]">Choose a vendor from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
