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
              className="text-left rounded-2xl p-5 mb-8"
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
    <div className="min-h-screen" style={{ background: '#FFFDFC' }}>
      <UserNavbar />

      {/* Page header */}
      <div className="border-b border-black/5" style={{ background: '#FEFDEB' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)' }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-filson font-black text-[#101828] text-2xl">Create Your Event</h1>
              <p className="font-lato text-[#6A6A6A] text-sm">
                Tell us what you're planning — we'll help you find the perfect vendors
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-6 py-10">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* ── Step 0: Event Type ─────────────────────────────── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-filson font-black text-[#101828] text-2xl mb-2">
                What are you celebrating?
              </h2>
              <p className="font-lato text-[#6A6A6A] text-sm mb-6">
                Pick the type of event you want to plan
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {EVENT_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => set('eventType', type.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200"
                    style={form.eventType === type.id
                      ? {
                          background: '#FFF3EF',
                          border: '2px solid #F06138',
                          boxShadow: '0 0 0 3px rgba(240,97,56,0.1)',
                        }
                      : {
                          background: '#fff',
                          border: '2px solid rgba(139,67,50,0.1)',
                        }
                    }
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <span
                      className="font-lato font-semibold text-xs text-center leading-tight"
                      style={{ color: form.eventType === type.id ? '#F06138' : '#4C4C4C' }}
                    >
                      {type.label}
                    </span>
                    {form.eventType === type.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Event Details ──────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-filson font-black text-[#101828] text-2xl mb-1">
                  {EVENT_TYPES.find(e => e.id === form.eventType)?.emoji} Tell us the details
                </h2>
                <p className="font-lato text-[#6A6A6A] text-sm">
                  Help vendors understand your event
                </p>
              </div>

              {/* Event name */}
              <div>
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  placeholder={`e.g. Priya & Rahul's Wedding`}
                  value={form.eventName}
                  onChange={(e) => set('eventName', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Date + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                    <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> Event Date</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => set('date', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                    <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> City</span>
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-2">
                  <span className="inline-flex items-center gap-1.5"><Users size={13} /> Expected Guests</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {GUEST_RANGES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => set('guests', g.id)}
                      className="px-4 py-2 rounded-xl font-lato font-semibold text-sm transition-all"
                      style={form.guests === g.id
                        ? { background: '#F06138', color: '#FDFAD6', boxShadow: '0 2px 8px rgba(240,97,56,0.25)' }
                        : { background: '#fff', border: '1px solid rgba(139,67,50,0.15)', color: '#4C4C4C' }
                      }
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-2">
                  <span className="inline-flex items-center gap-1.5"><IndianRupee size={13} /> Budget Range</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => set('budget', b.id)}
                      className="px-4 py-2 rounded-xl font-lato font-semibold text-sm transition-all"
                      style={form.budget === b.id
                        ? { background: '#F06138', color: '#FDFAD6', boxShadow: '0 2px 8px rgba(240,97,56,0.25)' }
                        : { background: '#fff', border: '1px solid rgba(139,67,50,0.15)', color: '#4C4C4C' }
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
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-filson font-black text-[#101828] text-2xl mb-1">
                What services do you need?
              </h2>
              <p className="font-lato text-[#6A6A6A] text-sm mb-6">
                Select all that apply — we'll match you with the right vendors
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SERVICES.map(({ id, label, icon: Icon }) => {
                  const selected = form.services.includes(id)
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleService(id)}
                      className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200"
                      style={selected
                        ? {
                            background: '#FFF3EF',
                            border: '2px solid #F06138',
                            boxShadow: '0 0 0 3px rgba(240,97,56,0.08)',
                          }
                        : {
                            background: '#fff',
                            border: '2px solid rgba(139,67,50,0.1)',
                          }
                      }
                    >
                      <div
                        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                        style={{ background: selected ? '#F06138' : 'rgba(139,67,50,0.08)' }}
                      >
                        <Icon size={16} style={{ color: selected ? '#FDFAD6' : '#8B4332' }} />
                      </div>
                      <span
                        className="font-lato font-semibold text-sm leading-tight"
                        style={{ color: selected ? '#F06138' : '#4C4C4C' }}
                      >
                        {label}
                      </span>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto shrink-0"
                        >
                          <CheckCircle2 size={16} style={{ color: '#F06138' }} />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {form.services.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 font-lato text-xs text-center"
                  style={{ color: '#F06138' }}
                >
                  {form.services.length} service{form.services.length > 1 ? 's' : ''} selected
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Summary & Notes ───────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-filson font-black text-[#101828] text-2xl mb-1">
                Almost there!
              </h2>
              <p className="font-lato text-[#6A6A6A] text-sm mb-6">
                Review your event and add any special requirements
              </p>

              {/* Summary card */}
              <div
                className="rounded-2xl p-5 mb-5"
                style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Event', value: `${selectedType?.emoji} ${selectedType?.label}` },
                    { label: 'Name', value: form.eventName },
                    { label: 'Date', value: form.date ? new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'City', value: form.city },
                    { label: 'Guests', value: GUEST_RANGES.find(g => g.id === form.guests)?.label },
                    { label: 'Budget', value: BUDGET_RANGES.find(b => b.id === form.budget)?.label },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="font-lato text-[10px] uppercase tracking-wide text-[#6A6A6A] mb-0.5">{row.label}</p>
                      <p className="font-lato font-semibold text-[#101828] text-sm">{row.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-black/5">
                  <p className="font-lato text-[10px] uppercase tracking-wide text-[#6A6A6A] mb-2">Services needed</p>
                  <div className="flex flex-wrap gap-2">
                    {form.services.map((id) => {
                      const svc = SERVICES.find(s => s.id === id)
                      return (
                        <span
                          key={id}
                          className="px-3 py-1 rounded-full font-lato font-semibold text-xs"
                          style={{ background: '#FFF3EF', color: '#F06138', border: '1px solid rgba(240,97,56,0.2)' }}
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
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                  <span className="inline-flex items-center gap-1.5"><FileText size={13} /> Special Requirements (optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Outdoor venue preferred, vegan catering options, specific theme or color palette..."
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  className="input-field resize-none"
                  style={{ height: 'auto' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation buttons ──────────────────────────────── */}
        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-lato font-semibold text-sm transition-all hover:bg-gray-50"
              style={{ border: '1px solid rgba(139,67,50,0.2)', color: '#6A6A6A' }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={step < 3 ? next : submit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-lato font-bold text-sm transition-all"
            style={{
              background: '#F06138',
              color: '#FDFAD6',
              boxShadow: '0 4px 14px rgba(240,97,56,0.3)',
            }}
          >
            {step < 3 ? (
              <>Continue <ArrowRight size={15} /></>
            ) : (
              <><Sparkles size={15} /> Create My Event</>
            )}
          </motion.button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
