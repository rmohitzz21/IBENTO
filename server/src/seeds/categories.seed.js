import dotenv from 'dotenv'
dotenv.config()

import connectDB from '../config/db.js'
import Category from '../models/Category.js'

const CATEGORIES = [
  { name: 'Photography', emoji: '📸', description: 'Professional photographers for weddings and events', sortOrder: 1 },
  { name: 'Decoration', emoji: '🎨', description: 'Event decorators, floral designers, and theme setup', sortOrder: 2 },
  { name: 'Catering', emoji: '🍽️', description: 'Food and beverage catering services', sortOrder: 3 },
  { name: 'DJ & Music', emoji: '🎵', description: 'DJs, live bands, and sound system providers', sortOrder: 4 },
  { name: 'Mehendi', emoji: '🪷', description: 'Mehendi and henna artists for ceremonies', sortOrder: 5 },
  { name: 'Makeup', emoji: '💄', description: 'Bridal and event makeup artists and hair stylists', sortOrder: 6 },
  { name: 'Venue', emoji: '🏛️', description: 'Event venues, banquet halls, and farmhouses', sortOrder: 7 },
  { name: 'Videography', emoji: '🎬', description: 'Cinematographers and video editors', sortOrder: 8 },
  { name: 'Invitation', emoji: '✉️', description: 'Wedding invitation designers and printers', sortOrder: 9 },
  { name: 'Planning', emoji: '📋', description: 'Event planners and wedding coordinators', sortOrder: 10 },
]

async function seed() {
  await connectDB()
  console.log('\n🌱 Seeding categories...\n')

  let created = 0
  let updated = 0

  for (const cat of CATEGORIES) {
    const result = await Category.findOneAndUpdate(
      { name: cat.name },
      { ...cat, isActive: true },
      { upsert: true, new: true, rawResult: true }
    )
    if (result.lastErrorObject?.updatedExisting) {
      console.log(`  ♻️  Updated: ${cat.emoji} ${cat.name}`)
      updated++
    } else {
      console.log(`  ✅ Created: ${cat.emoji} ${cat.name}`)
      created++
    }
  }

  console.log(`\n✨ Done! Created: ${created}, Updated: ${updated}\n`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
