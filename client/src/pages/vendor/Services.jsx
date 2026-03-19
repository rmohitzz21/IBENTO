import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, IndianRupee, X, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

const serviceSchema = z.object({
  name: z.string().min(3, 'Service name required'),
  description: z.string().min(10, 'Add a short description'),
  price: z.coerce.number().min(500, 'Minimum price is ₹500'),
  duration: z.string().min(1, 'Duration required'),
})

const MOCK_SERVICES = [
  { _id: 's1', name: 'Basic Wedding Package',   description: 'Stage, floral entrance, table centrepieces for up to 100 guests.', price: 45000, duration: '1 day' },
  { _id: 's2', name: 'Premium Decoration',       description: 'Full venue décor, photo booth, fairy lights, custom backdrop.', price: 85000, duration: '2 days' },
  { _id: 's3', name: 'Engagement Ceremony',      description: 'Intimate setup for up to 50 guests with floral ring ceremony arch.', price: 25000, duration: '6 hours' },
]

function ServiceModal({ service, onClose, onSaved }) {
  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? { name: service.name, description: service.description, price: service.price, duration: service.duration } : {},
  })

  const mutation = useMutation({
    mutationFn: (data) => service
      ? api.put(`/vendors/services/${service._id}`, data)
      : api.post('/vendors/services', data),
    onSuccess: () => { toast.success(service ? 'Service updated!' : 'Service added!'); onSaved() },
    onError: () => toast.error('Could not save service.'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl p-6 shadow-xl"
        style={{ background: '#FEFDEB' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-filson font-black text-[#101828] text-lg">{service ? 'Edit Service' : 'Add Service'}</h2>
          <button onClick={onClose} className="text-[#6A6A6A] hover:text-[#101828]"><X size={20} /></button>
        </div>

        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Service Name</label>
            <input type="text" className="input-field" {...form.register('name')} />
            {form.formState.errors.name && <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Description</label>
            <textarea rows={3} className="input-field resize-none" {...form.register('description')} />
            {form.formState.errors.description && <p className="mt-1 text-xs text-red-500">{form.formState.errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Price (₹)</label>
              <input type="number" min={500} className="input-field" {...form.register('price')} />
              {form.formState.errors.price && <p className="mt-1 text-xs text-red-500">{form.formState.errors.price.message}</p>}
            </div>
            <div>
              <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Duration</label>
              <input type="text" placeholder="e.g. 1 day, 6 hours" className="input-field" {...form.register('duration')} />
              {form.formState.errors.duration && <p className="mt-1 text-xs text-red-500">{form.formState.errors.duration.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: '#F06138', color: '#FDFAD6' }}>
              {mutation.isPending ? 'Saving…' : 'Save Service'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function VendorServices() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'add' | service object

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-services'],
    queryFn: () => api.get('/vendors/services'),
  })
  const services = data?.data?.services || MOCK_SERVICES

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/vendors/services/${id}`),
    onSuccess: () => { toast.success('Service deleted.'); qc.invalidateQueries(['vendor-services']) },
    onError: () => toast.error('Could not delete service.'),
  })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-filson font-black text-[#101828] text-2xl">My Services</h1>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: '#F06138', color: '#FDFAD6' }}
          >
            <Plus size={16} /> Add Service
          </motion.button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-black/5">
            <Wrench size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No services yet</p>
            <p className="font-lato text-xs text-[#6A6A6A] mb-5">Add your first service to start receiving bookings</p>
            <button onClick={() => setModal('add')} className="px-6 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90" style={{ background: '#F06138', color: '#FDFAD6' }}>
              Add Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {services.map((svc, i) => (
                <motion.div
                  key={svc._id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-2xl bg-white border border-black/5 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-lato font-bold text-[#101828] text-sm leading-tight flex-1 pr-2">{svc.name}</h3>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setModal(svc)} className="p-1.5 rounded-lg hover:bg-[#FFF3EF] text-[#6A6A6A] hover:text-[#F06138] transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this service?')) deleteMutation.mutate(svc._id) }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#6A6A6A] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="font-lato text-xs text-[#6A6A6A] leading-relaxed flex-1 mb-4">{svc.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-black/5">
                    <div className="flex items-center gap-0.5 font-filson font-black text-[#8B4332] text-lg">
                      <IndianRupee size={15} />
                      {new Intl.NumberFormat('en-IN').format(svc.price)}
                    </div>
                    <span className="font-lato text-xs text-[#6A6A6A] px-2.5 py-1 rounded-full" style={{ background: '#FFF3EF', color: '#F06138' }}>
                      {svc.duration}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {modal && (
        <ServiceModal
          service={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); qc.invalidateQueries(['vendor-services']) }}
        />
      )}
    </motion.div>
  )
}
