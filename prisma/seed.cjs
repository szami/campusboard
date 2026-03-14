const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashed, name: 'Administrator' },
  })
  console.log('✅ Admin user created: admin / admin123')

  const defaults = {
    campus_name: 'Universitas Kampus',
    logo_main: '',
    logo_1: '',
    logo_2: '',
    logo_3: '',
    logo_4: '',
    weather_lat: '-6.2088',
    weather_lon: '106.8456',
    default_media_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    marquee_speed: '30',
    slide_duration: '8',
  }

  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    })
  }
  console.log('✅ Default settings seeded')

  const today = new Date()
  const events = [
    {
      title: 'Seminar Nasional Teknologi',
      description: 'Seminar tahunan membahas perkembangan teknologi terkini',
      startTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        9,
        0
      ),
      endTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        12,
        0
      ),
      floor: 2,
      room: 'Aula Utama',
      organizer: 'Fakultas Teknik',
      isActive: true,
    },
    {
      title: 'Workshop Machine Learning',
      description: 'Workshop praktis pengenalan Machine Learning untuk pemula',
      startTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        13,
        0
      ),
      endTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        16,
        0
      ),
      floor: 3,
      room: 'Lab Komputer 301',
      organizer: 'Himpunan Mahasiswa Informatika',
      isActive: true,
    },
  ]
  for (const ev of events) {
    await prisma.event.create({ data: ev })
  }
  console.log('✅ Sample events created')

  const announcements = [
    {
      text: 'Pendaftaran wisuda semester ini dibuka hingga 30 April. Segera lengkapi berkas di bagian akademik.',
      priority: 10,
      isActive: true,
    },
    {
      text: 'Perpustakaan kampus kini buka setiap hari termasuk Sabtu dan Minggu pukul 08.00 - 16.00 WIB.',
      priority: 5,
      isActive: true,
    },
    {
      text: 'Diingatkan kepada seluruh mahasiswa agar menjaga kebersihan lingkungan kampus.',
      priority: 1,
      isActive: true,
    },
  ]
  for (const ann of announcements) {
    await prisma.announcement.create({ data: ann })
  }
  console.log('✅ Sample announcements created')

  await prisma.media.create({
    data: {
      type: 'YOUTUBE',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      title: 'Lo-Fi Music for Studying',
      displayOrder: 0,
      duration: 30,
      isActive: true,
    },
  })
  console.log('✅ Sample media created')
}

main()
  .then(() => console.log('\n🎉 Database seeding complete!'))
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
