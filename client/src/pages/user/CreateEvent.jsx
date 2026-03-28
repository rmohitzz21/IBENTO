import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  FileText,
  Sparkles,
  Camera,
  Video,
  Flower2,
  UtensilsCrossed,
  Music2,
  HandHeart,
  Brush,
  Car,
  Building2,
  Mail,
  Compass,
} from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'

/* ── Data ──────────────────────────────────────────────────────── */

const EVENT_TYPES = [
  { id: 'wedding',     label: 'Wedding',       emoji: '💒' },
  { id: 'birthday',    label: 'Birthday',      emoji: '🎂' },
  { id: 'corporate',   label: 'Corporate',     emoji: '🏢' },
  { id: 'engagement',  label: 'Engagement',    emoji: '💍' },
  { id: 'anniversary', label: 'Anniversary',   emoji: '🥂' },
  { id: 'graduation',  label: 'Graduation',    emoji: '🎓' },
  { id: 'babyshower',  label: 'Baby Shower',   emoji: '🍼' },
  { id: 'concert',     label: 'Concert/Show',  emoji: '🎤' },
  { id: 'festival',    label: 'Festival',      emoji: '🎊' },
  { id: 'other',       label: 'Other',         emoji: '✨' },
]

const CITIES = [
  'Ahmedabad', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune',
  'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Surat',
  'Lucknow', 'Nagpur',
]

const SERVICES = [
  { id: 'photography',  label: 'Photography',     icon: Camera },
  { id: 'videography',  label: 'Videography',     icon: Video },
  { id: 'decoration',   label: 'Decoration',      icon: Flower2 },
  { id: 'catering',     label: 'Catering',        icon: UtensilsCrossed },
  { id: 'music',        label: 'Music / DJ',      icon: Music2 },
  { id: 'mehendi',      label: 'Mehendi',         icon: HandHeart },
  { id: 'makeup',       label: 'Makeup & Beauty', icon: Brush },
  { id: 'transport',    label: 'Transportation',  icon: Car },
  { id: 'venue',        label: 'Venue',           icon: Building2 },
  { id: 'invitation',   label: 'Invitations',     icon: Mail },
]

const BUDGET_RANGES = [
  { id: 'under50k',    label: 'Under ₹50,000' },
  { id: '50k-1l',      label: '₹50K – ₹1 Lakh' },
  { id: '1l-3l',       label: '₹1L – ₹3 Lakh' },
  { id: '3l-5l',       label: '₹3L – ₹5 Lakh' },
  { id: '5l-10l',      label: '₹5L – ₹10 Lakh' },
  { id: 'above10l',    label: 'Above ₹10 Lakh' },
]

const GUEST_RANGES = [
  { id: 'under50',   label: 'Under 50' },
  { id: '50-100',    label: '50 – 100' },
  { id: '100-300',   label: '100 – 300' },
  { id: '300-500',   label: '300 – 500' },
  { id: '500plus',   label: '500+' },
]

const STEPS = ['Event Type', 'Details', 'Services', 'Summary']

const INITIAL = {
  eventType: '',
  eventName: '',
  date: '',
  city: '',
  guests: '',
  budget: '',
  services: [],
  notes: '',
}

/* ── Helpers ───────────────────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((label, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={active ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-lato transition-all"
                style={{
                  background: done ? '#22C55E' : active ? '#F06138' : 'rgba(139,67,50,0.1)',
                  color: done || active ? '#fff' : '#6A6A6A',
                }}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </motion.div>
              <span
                className="text-[10px] font-lato font-medium hidden sm:block"
                style={{ color: active ? '#F06138' : '#6A6A6A' }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-10 sm:w-16 h-0.5 mb-4 transition-all duration-300"
                style={{ background: done ? '#22C55E' : 'rgba(139,67,50,0.15)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
export default function CreateEvent() {
  const navigate = useNavigate()
  const [step, setStep]   = useState(0)
  const [form, setForm]   = useState(INITIAL)
  const [done, setDone]   = useState(false)

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function toggleService(id) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(id)
        ? f.services.filter((s) => s !== id)
        : [...f.services, id],
    }))
  }

  function next() {
    // Basic validation per step
    if (step === 0 && !form.eventType) {
      toast.error('Please select an event type')
      return
    }
    if (step === 1) {
      if (!form.eventName.trim()) { toast.error('Please enter an event name'); return }
      if (!form.date)              { toast.error('Please pick a date'); return }
      if (!form.city)              { toast.error('Please select a city'); return }
      if (!form.guests)            { toast.error('Please select guest count'); return }
      if (!form.budget)            { toast.error('Please select a budget range'); return }
    }
    if (step === 2 && form.services.length === 0) {
      toast.error('Select at least one service')
      return
    }
    setStep((s) => s + 1)
  }

  function submit() {
    setDone(true)
    toast.success('Event request submitted!')
  }

  const selectedType = EVENT_TYPES.find((e) => e.id === form.eventType)

  /* ── Success screen ─────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen" style={{ background: '#FFFDFC' }}>
        <UserNavbar />
        <div className="max-w-[560px] mx-auto px-6 py-24 text-center">
          {/* Animated success icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(240,97,56,0.15)' }}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFF3EF, #FEFDEB)', border: '2px solid rgba(240,97,56,0.25)' }}
            >
              <span className="text-4xl">{selectedType?.emoji || '🎉'}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-filson font-black text-[#101828] mb-3" style={{ fontSize: 32 }}>
              Your event is ready!
            </h1>
            <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed mb-2">
              We've created your <span className="font-semibold text-[#101828]">{form.eventName}</span> event plan.
              Now browse matching vendors in <span className="font-semibold text-[#101828]">{form.city}</span> who can make it extraordinary.
            </p>

            {/* Summary pill */}
            <div
              className="inline-flex flex-wrap items-center justify-center gap-2 my-6 px-5 py-3 rounded-2xl"
              style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}
            >
              <span className="font-lato text-sm font-semibold text-[#101828]">{selectedType?.emoji} {selectedType?.label}</span>
              <span className="text-[#C4B5A0]">·</span>
              <span className="font-lato text-sm text-[#6A6A6A]">{form.city}</span>
              <span className="text-[#C4B5A0]">·</span>
              <span className="font-lato text-sm text-[#6A6A6A]">{GUEST_RANGES.find(g => g.id === form.guests)?.label} guests</span>
              <span className="text-[#C4B5A0]">·</span>
              <span className="font-lato text-sm text-[#6A6A6A]">{form.services.length} services</span>
            </div>

            {/* Next steps */}
            <div
              className="text-left rounded-2xl p-5 mb-6"
              style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <p className="font-lato font-bold text-[#101828] text-sm mb-4">What happens next?</p>
              {[
                { n: '1', text: 'Browse verified vendors in your city', sub: 'Filter by the services you need' },
                { n: '2', text: 'View portfolios & compare quotes', sub: 'Check ratings, reviews, and pricing' },
                { n: '3', text: 'Book directly with confidence', sub: 'Secure bookings with iBento protection' },
              ].map((item) => (
                <div key={item.n} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold font-lato"
                    style={{ background: '#F06138', color: '#FDFAD6' }}
                  >
                    {item.n}
                  </div>
                  <div>
                    <p className="font-lato font-semibold text-[#101828] text-sm">{item.text}</p>
                    <p className="font-lato text-[#6A6A6A] text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Share & Collaborate */}
            <div
              className="text-left rounded-2xl p-5 mb-8 border"
              style={{ background: '#FAFAFA', borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-lato font-bold text-[#101828] text-sm">Collaborate & Share</p>
                  <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">Invite co-hosts or share the plan with family.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5">
                  <span className="text-xl">🤝</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-white border border-black/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-[#9CA3AF] font-medium font-lato truncate">ibento.com/plan/{Math.random().toString(36).substring(2, 10)}</span>
                </div>
                <button 
                  onClick={() => toast.success('Link copied to clipboard!')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold font-lato transition-colors"
                  style={{ background: '#E2E8F0', color: '#334155' }}
                >
                  Copy Link
                </button>
              </div>

              <button 
                onClick={() => toast.success('Co-host invitation active!')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold font-lato border border-dashed transition-colors"
                style={{ borderColor: '#CBD5E1', color: '#64748B', background: '#fff' }}
              >
                + Invite Collaborators
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/explore?city=${form.city}&services=${form.services.join(',')}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-lato font-bold text-sm transition-all hover:opacity-90"
                style={{ background: '#F06138', color: '#FDFAD6', boxShadow: '0 4px 14px rgba(240,97,56,0.3)' }}
              >
                <Compass size={15} /> Browse Matching Vendors
              </Link>
              <button
                onClick={() => { setDone(false); setStep(0); setForm(INITIAL) }}
                className="flex-1 py-3 rounded-xl font-lato font-semibold text-sm transition-all hover:bg-gray-50"
                style={{ border: '1px solid rgba(139,67,50,0.2)', color: '#6A6A6A' }}
              >
                Plan Another Event
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFDFC]">
      {/* ── LEFT PANE (Image & Branding, visible on md+) ────── */}
      <div className="hidden md:flex flex-col relative w-[40%] lg:w-[35%] text-white p-10 lg:p-14 justify-between bg-[#1a0a00]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2069" 
            className="w-full h-full object-cover transition-transform duration-[20s] hover:scale-105" 
            alt="Event Planner" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>
        
        {/* Top left corner - Back to Home */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-16">
            <ArrowLeft size={16} /> 
            <span className="font-lato text-sm font-semibold uppercase tracking-wider">Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-6 text-xs font-bold font-lato" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Sparkles size={12} className="text-[#F06138]" /> Premium Planning
            </div>
            <h1 className="font-filson font-black text-4xl lg:text-5xl leading-[1.1] mb-5 drop-shadow-md">
              Design your<br/><span className="text-[#F06138]">perfect</span> event.
            </h1>
            <p className="font-lato text-white/80 text-lg max-w-sm drop-shadow-sm">
              Answer a few quick questions and we'll instantly organize your vision and match you with top-rated vendors.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-8 mt-12 w-full">
           <div className="font-lato font-bold text-sm tracking-wider uppercase text-white/50">
             Step {step < 4 ? step + 1 : 4} of 4
           </div>
           {/* Dots indicator */}
           <div className="flex items-center gap-2">
             {STEPS.map((_, i) => (
               <div 
                 key={i} 
                 className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#F06138]' : i < step ? 'w-2 bg-white' : 'w-2 bg-white/20'}`}
               />
             ))}
           </div>
        </div>
      </div>

      {/* ── RIGHT PANE (Form) ────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative h-screen overflow-y-auto overflow-x-hidden bg-[#FFFDFC]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-5 border-b border-black/5 bg-white sticky top-0 z-50 shadow-sm">
           <Link to="/" className="inline-flex items-center gap-1.5 text-[#101828]">
             <ArrowLeft size={16} /> <span className="font-lato font-bold text-sm">Cancel</span>
           </Link>
           <div className="text-xs font-lato font-bold text-[#F06138] bg-[#FFF3EF] px-3 py-1.5 rounded-full">Step {step < 4 ? step + 1 : 4} of 4</div>
        </div>
        
        <div className="flex-1 flex flex-col p-6 sm:p-12 lg:p-20 justify-center min-h-max pb-32">
          <div className="w-full max-w-[580px] mx-auto">
            
            <AnimatePresence mode="wait">
              {/* ── Step 0: Event Type ─────────────────────────────── */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, position: 'absolute' }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="w-full"
                >
                  <h2 className="font-filson font-black text-[#101828] text-3xl sm:text-4xl mb-3">
                    What are you celebrating? <span className="text-[#F06138]">*</span>
                  </h2>
                  <p className="font-lato text-[#6A6A6A] text-base mb-8">
                    Choose the type of event to help us tailor our recommendations.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {EVENT_TYPES.map((type) => (
                      <motion.button
                        key={type.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { set('eventType', type.id); setTimeout(next, 300) }}
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl transition-all duration-300 relative overflow-hidden group"
                        style={form.eventType === type.id
                          ? {
                              background: '#FFF3EF',
                              border: '2px solid #F06138',
                              boxShadow: '0 8px 24px rgba(240,97,56,0.15)',
                            }
                          : {
                              background: '#fff',
                              border: '2px solid rgba(139,67,50,0.1)',
                            }
                        }
                      >
                        <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{type.emoji}</span>
                        <span
                          className="font-lato font-bold text-sm text-center leading-tight"
                          style={{ color: form.eventType === type.id ? '#F06138' : '#101828' }}
                        >
                          {type.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Event Details ──────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, position: 'absolute' }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="space-y-8 w-full"
                >
                  <div>
                    <h2 className="font-filson font-black text-[#101828] text-3xl sm:text-4xl mb-3">
                      Let's set the stage <span className="text-[#F06138]">*</span>
                    </h2>
                    <p className="font-lato text-[#6A6A6A] text-base">
                      Give us the essential details of your {(EVENT_TYPES.find(e => e.id === form.eventType)?.label || 'event').toLowerCase()}.
                    </p>
                  </div>

                  {/* Event name */}
                  <div>
                    <label className="block font-lato font-bold text-lg text-[#101828] mb-3">
                      Event Name
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. The Perfect Wedding`}
                      value={form.eventName}
                      onChange={(e) => set('eventName', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black/10 text-2xl font-lato font-medium text-[#101828] placeholder-black/20 focus:border-[#F06138] focus:outline-none transition-colors py-2 pb-4"
                    />
                  </div>

                  {/* Date + City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="block font-lato font-bold text-sm text-[#6A6A6A] uppercase tracking-wider mb-2">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => set('date', e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-black/10 bg-white shadow-sm font-lato text-[#101828] focus:border-[#F06138] focus:ring-1 focus:ring-[#F06138] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-lato font-bold text-sm text-[#6A6A6A] uppercase tracking-wider mb-2">
                        City
                      </label>
                      <select
                        value={form.city}
                        onChange={(e) => set('city', e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-black/10 bg-white shadow-sm font-lato text-[#101828] focus:border-[#F06138] focus:ring-1 focus:ring-[#F06138] outline-none transition-all appearance-none"
                      >
                        <option value="">Select location</option>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block font-lato font-bold text-sm text-[#6A6A6A] uppercase tracking-wider mb-3">
                      Expected Guest Count
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {GUEST_RANGES.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => set('guests', g.id)}
                          className="px-5 py-3 rounded-xl font-lato font-bold text-sm transition-all hover:-translate-y-0.5"
                          style={form.guests === g.id
                            ? { background: '#101828', color: '#fff', boxShadow: '0 8px 20px rgba(16,24,40,0.2)' }
                            : { background: '#fff', border: '1px solid rgba(0,0,0,0.1)', color: '#4C4C4C' }
                          }
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block font-lato font-bold text-sm text-[#6A6A6A] uppercase tracking-wider mb-3">
                      Overall Budget Range
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {BUDGET_RANGES.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => set('budget', b.id)}
                          className="px-5 py-3 rounded-xl font-lato font-bold text-sm transition-all hover:-translate-y-0.5"
                          style={form.budget === b.id
                            ? { background: '#101828', color: '#fff', boxShadow: '0 8px 20px rgba(16,24,40,0.2)' }
                            : { background: '#fff', border: '1px solid rgba(0,0,0,0.1)', color: '#4C4C4C' }
                          }
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Services Needed ───────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, position: 'absolute' }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="w-full"
                >
                  <h2 className="font-filson font-black text-[#101828] text-3xl sm:text-4xl mb-3">
                    What services do you need? <span className="text-[#F06138]">*</span>
                  </h2>
                  <p className="font-lato text-[#6A6A6A] text-base mb-8">
                    Select everything you need. We'll find experts for each exact requirement.
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {SERVICES.map(({ id, label, icon: Icon }) => {
                      const selected = form.services.includes(id)
                      return (
                        <motion.button
                          key={id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleService(id)}
                          className="flex flex-col items-center justify-center p-5 rounded-3xl text-center transition-all duration-200 group relative overflow-hidden"
                          style={selected
                            ? {
                                background: '#FFF3EF',
                                border: '2px solid #F06138',
                                boxShadow: '0 4px 12px rgba(240,97,56,0.15)',
                              }
                            : {
                                background: '#fff',
                                border: '1px solid rgba(139,67,50,0.15)',
                              }
                          }
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${selected ? 'bg-[#F06138]' : 'bg-[#FEFDEB] group-hover:bg-[#FFF3EF]'}`}
                          >
                            <Icon size={22} style={{ color: selected ? '#FFF' : '#8B4332' }} />
                          </div>
                          <span
                            className="font-lato font-bold text-sm"
                            style={{ color: selected ? '#F06138' : '#101828' }}
                          >
                            {label}
                          </span>
                          {selected && (
                            <div className="absolute top-3 right-3 text-[#F06138]">
                              <CheckCircle2 size={16} className="fill-[#FFF3EF]" />
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Summary & Notes ───────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, position: 'absolute' }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="w-full"
                >
                  <h2 className="font-filson font-black text-[#101828] text-3xl sm:text-4xl mb-3">
                    Almost there! 🎉
                  </h2>
                  <p className="font-lato text-[#6A6A6A] text-base mb-8">
                    Review your master plan and add any special requirements.
                  </p>

                  {/* Summary card */}
                  <div
                    className="rounded-3xl p-8 mb-8"
                    style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 12px 32px rgba(139,67,50,0.05)' }}
                  >
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl border border-black/5 shadow-sm">
                        {selectedType?.emoji}
                      </div>
                      <div>
                        <h3 className="font-filson font-bold text-[#101828] text-xl">{form.eventName}</h3>
                        <p className="font-lato text-[#F06138] font-bold text-sm tracking-wide">{selectedType?.label} in {form.city}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
                      {[
                        { label: 'Date', value: form.date ? new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                        { label: 'Guests', value: GUEST_RANGES.find(g => g.id === form.guests)?.label },
                        { label: 'Budget', value: BUDGET_RANGES.find(b => b.id === form.budget)?.label },
                      ].map((row) => (
                        <div key={row.label}>
                          <p className="font-lato text-xs uppercase tracking-wider text-[#6A6A6A] font-bold mb-1">{row.label}</p>
                          <p className="font-lato font-bold text-[#101828] text-base">{row.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-black/5">
                      <p className="font-lato text-xs uppercase tracking-wider text-[#6A6A6A] font-bold mb-3">Required Services ({form.services.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {form.services.map((id) => {
                          const svc = SERVICES.find(s => s.id === id)
                          return (
                            <span
                              key={id}
                              className="px-4 py-2 rounded-xl font-lato font-bold text-xs"
                              style={{ background: '#FFFDFC', color: '#101828', border: '1px solid rgba(0,0,0,0.05)' }}
                            >
                              {svc?.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-lato font-bold text-sm text-[#6A6A6A] uppercase tracking-wider mb-2">
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. Needs wheelchair accessibility, completely vegan catering required, looking for a rustic theme..."
                      value={form.notes}
                      onChange={(e) => set('notes', e.target.value)}
                      className="w-full p-5 rounded-2xl border border-black/10 bg-white shadow-sm font-lato text-[#101828] focus:border-[#F06138] focus:ring-2 focus:ring-[#F06138]/20 outline-none transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>

        {/* ── Navigation Footer ──────────────────────────────── */}
        <div className="sticky bottom-0 left-0 right-0 p-6 sm:px-12 bg-white/90 backdrop-blur-xl border-t border-black/5 z-[60]">
          <div className="w-full max-w-[580px] mx-auto flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="group flex items-center gap-2 px-6 py-4 rounded-xl font-lato font-bold text-sm transition-all hover:bg-gray-50 text-[#101828] border border-black/10"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back
              </button>
            ) : (
              <div /> // Empty div for spacing if no back button
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={step < 3 ? next : submit}
              className="group flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-lato font-bold text-sm sm:text-base transition-all bg-[#F06138] text-[#FDFAD6] shadow-[0_8px_24px_rgba(240,97,56,0.3)] hover:shadow-[0_12px_32px_rgba(240,97,56,0.4)] hover:-translate-y-0.5"
            >
              {step < 3 ? (
                <>Next Step <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
              ) : (
                <><Sparkles size={16} /> Finalize Plan</>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
