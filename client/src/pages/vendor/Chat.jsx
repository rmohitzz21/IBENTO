import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Send, Search, MessageSquare, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import VendorSidebar from '../../components/shared/VendorSidebar'
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

function getInitials(name) {
  return (name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

// Determine if a message was sent by the current user
function isMine(msg, userId) {
  if (msg.sender === 'vendor') return true          // optimistic local messages
  if (msg.senderId?._id) return msg.senderId._id.toString() === userId?.toString()
  if (msg.senderId) return msg.senderId.toString() === userId?.toString()
  return false
}

// Normalise a Conversation document from the server → component shape
function normalizeConversation(conv, userId) {
  const other = conv.participants?.find((p) => p._id?.toString() !== userId?.toString())
    || conv.participants?.[0]
  const unreadMap = conv.unreadCount || {}
  const myUnread = typeof unreadMap === 'object' ? (unreadMap[userId] || 0) : 0
  return {
    ...conv,
    customer: {
      _id: other?._id,
      name: other?.name || '—',
      avatar: other?.avatar || null,
    },
    lastMessage: {
      content: conv.lastMessage || '',
      createdAt: conv.lastMessageAt || conv.updatedAt,
    },
    unreadCount: myUnread,
  }
}

export default function VendorChat() {
  const { user } = useAuthStore()
  const location = useLocation()
  const {
    conversations, activeConversation, messages,
    setConversations, setActiveConversation, setMessages, addMessage, typingUsers,
  } = useChatStore()
  const { joinConversation, sendTyping } = useSocket()

  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  // newChatUser: when navigating from BookingDetail with no existing conversation
  const [newChatUser, setNewChatUser] = useState(null)
  const messagesEndRef = useRef(null)
  const autoOpenDone = useRef(false)

  const { data: convData, isLoading: convLoading } = useQuery({
    queryKey: ['vendor-conversations'],
    queryFn: () => api.get('/messages/conversations'),
  })

  // Sync conversations into store and handle auto-open from location.state
  useEffect(() => {
    if (!convData?.data?.conversations) return

    const normalized = convData.data.conversations.map((c) => normalizeConversation(c, user?.id))
    setConversations(normalized)

    if (autoOpenDone.current) return
    const targetUserId = location.state?.userId
    if (!targetUserId) return

    autoOpenDone.current = true
    const match = normalized.find((c) => c.customer?._id?.toString() === targetUserId.toString())
    if (match) {
      selectConversation(match)
    } else {
      // No existing conversation — set up a new chat draft
      setNewChatUser({
        _id: targetUserId,
        name: location.state?.customerName || 'Customer',
      })
    }
  }, [convData])

  const displayConversations = conversations.filter((c) =>
    search ? c.customer?.name?.toLowerCase().includes(search.toLowerCase()) : true
  )

  const activeMessages = activeConversation ? (messages[activeConversation._id] || []) : []
  const anyTyping = activeConversation ? Object.values(typingUsers).some(Boolean) : false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, anyTyping])

  function selectConversation(conv) {
    setNewChatUser(null)
    setActiveConversation(conv)
    joinConversation(conv._id)
    api.put(`/messages/conversations/${conv._id}/read`).catch(() => {})
    if (!messages[conv._id]) {
      api.get(`/messages/conversations/${conv._id}`)
        .then(({ data }) => setMessages(conv._id, data.messages || []))
        .catch(() => setMessages(conv._id, []))
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

  async function handleSend(e) {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return

    // Determine receiver
    const receiverId = newChatUser?._id || activeConversation?.customer?._id
    if (!receiverId) return

    // Optimistic UI
    if (activeConversation) {
      const tempMsg = {
        _id: `local-${Date.now()}`,
        content,
        sender: 'vendor',
        createdAt: new Date().toISOString(),
      }
      addMessage(activeConversation._id, tempMsg)
    }
    setInput('')
    setSending(true)

    try {
      const res = await api.post('/messages/send', { receiverId, content })
      const { conversationId, message: savedMsg } = res.data

      if (newChatUser) {
        // First message — refresh conversations and auto-select the new one
        setNewChatUser(null)
        const freshData = await api.get('/messages/conversations')
        const normalized = (freshData.data?.conversations || []).map((c) =>
          normalizeConversation(c, user?.id)
        )
        setConversations(normalized)
        const newConv = normalized.find((c) => c._id?.toString() === conversationId?.toString())
        if (newConv) {
          setMessages(newConv._id, [savedMsg])
          selectConversation(newConv)
        }
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
      if (activeConversation) sendTyping(activeConversation._id, false)
    }
  }

  const chatTarget = newChatUser || activeConversation?.customer

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-6">Messages</h1>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-black/5" style={{ height: '560px' }}>

          {/* Conversation list */}
          <div className="lg:col-span-1 border-r border-black/5 flex flex-col bg-white">
            <div className="p-4 border-b border-black/5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers…"
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-sm font-lato border border-[rgba(139,67,50,0.15)] bg-[#FFFEF5] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20 text-[#101828] placeholder:text-[#6A6A6A]"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {convLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-[#F06138]" />
                </div>
              ) : displayConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageSquare size={28} className="text-gray-300 mb-2" />
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
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-lato font-bold text-sm text-white" style={{ background: '#F06138' }}>
                          {conv.customer?.avatar
                            ? <img src={conv.customer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            : getInitials(conv.customer?.name)
                          }
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: '#F06138', color: '#fff' }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-lato text-sm truncate ${conv.unreadCount ? 'font-bold text-[#101828]' : 'font-medium text-[#101828]'}`}>
                            {conv.customer?.name}
                          </p>
                          <span className="font-lato text-[10px] text-[#6A6A6A] shrink-0 ml-1">
                            {timeAgo(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <p className="font-lato text-xs truncate mt-0.5 text-[#6A6A6A]">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div className="lg:col-span-2 flex flex-col bg-[#FFFDFC]">
            {chatTarget ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-white">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-lato font-bold text-sm text-white shrink-0" style={{ background: '#F06138' }}>
                    {getInitials(chatTarget.name)}
                  </div>
                  <div>
                    <p className="font-lato font-semibold text-[#101828] text-sm">{chatTarget.name}</p>
                    {newChatUser && (
                      <p className="font-lato text-[10px] text-[#6A6A6A]">New conversation</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {newChatUser && activeMessages.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <p className="font-lato text-xs text-[#9CA3AF]">Send a message to start the conversation</p>
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {activeMessages.map((msg) => {
                      const mine = isMine(msg, user?.id)
                      const content = msg.content
                      const time = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : ''
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
                            {content}
                            <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-[#6A6A6A]'}`}>{time}</p>
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

                {/* Input */}
                <form onSubmit={handleSend} className="flex items-center gap-3 px-5 py-4 border-t border-black/5 bg-white">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-[#FFFEF5] text-sm font-lato text-[#101828] placeholder:text-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20"
                  />
                  <motion.button
                    type="submit"
                    disabled={!input.trim() || sending}
                    whileTap={{ scale: 0.94 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
                    style={{ background: '#F06138' }}
                  >
                    {sending
                      ? <Loader2 size={16} className="text-white animate-spin" />
                      : <Send size={16} className="text-white" />
                    }
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
