import { Work } from '@/types';

export const works: Work[] = [
  // ========== ผลงานคู่ NamtanFilm ==========
  {
    id: 'duo-1',
    title: 'Krong Kam',
    titleThai: 'กรงกรรม',
    year: 2024,
    type: 'drama',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    actors: ['namtan', 'film'],
    description: 'ละครแนวดราม่าสุดเข้มข้น',
    role: 'นำแสดง',
    link: 'https://www.youtube.com/watch?v=krongkam',
    platform: 'ch3',
    links: [
      { platform: 'ch3', url: 'https://ch3plus.com/drama/808' },
      { platform: 'netflix', url: 'https://www.netflix.com/title/81093155' }
    ]
  },
  // ========== Content for Lunar ==========
  {
    id: 'lunar-1',
    title: '1st Fan Meeting',
    titleThai: 'แฟนมีตติ้งครั้งแรก',
    year: 2024,
    type: 'event',
    category: 'event',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=600&fit=crop',
    actors: ['namtan', 'film'], // Shared event
    description: 'ความทรงจำสุดประทับใจ',
    link: '#',
    platform: 'youtube',
  },
  {
    id: 'duo-2',
    title: 'Midnight Museum',
    titleThai: 'พิพิธภัณฑ์รัตติกาล',
    year: 2023,
    type: 'series',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    actors: ['namtan', 'film'],
    description: 'ซีรีส์สยองขวัญสุดระทึก',
    link: 'https://www.youtube.com/watch?v=midnightmuseum',
    platform: 'netflix',
  },
  {
    id: 'duo-3',
    title: 'Best Couple Award',
    titleThai: 'คู่จิ้นยอดเยี่ยม Kazz Awards',
    year: 2024,
    type: 'award',
    category: 'award',
    image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400&h=600&fit=crop',
    actors: ['namtan', 'film'],
    description: 'Kazz Awards 2024',
    link: 'https://www.youtube.com/watch?v=kazzaward2024',
    platform: 'youtube',
  },
  {
    id: 'duo-4',
    title: 'NamtanFilm Fan Meeting',
    titleThai: 'แฟนมีตติ้ง NamtanFilm Together',
    year: 2024,
    type: 'event',
    category: 'event',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=600&fit=crop',
    actors: ['namtan', 'film'],
    description: 'Fan Meeting ครั้งแรก',
    link: 'https://www.youtube.com/watch?v=fanmeeting',
    platform: 'youtube',
  },
  {
    id: 'duo-5',
    title: 'Magazine Cover',
    titleThai: 'ปกนิตยสาร Praew',
    year: 2024,
    type: 'event',
    category: 'event',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    actors: ['namtan', 'film'],
    description: 'ขึ้นปก Praew คู่กัน',
    link: 'https://praew.me/namtanfilm-cover',
    platform: 'other',
  },

  // ========== ผลงาน Namtan ==========
  {
    id: 'namtan-1',
    title: 'Girl From Nowhere',
    titleThai: 'เด็กใหม่',
    year: 2018,
    type: 'series',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    actors: ['namtan'],
    description: 'ซีรีส์ดังระดับ Netflix',
    role: 'Nanno (นำแสดง)',
    link: 'https://www.netflix.com/title/girlfromnowhere',
    platform: 'netflix',
    links: [
      { platform: 'netflix', url: 'https://www.netflix.com/title/girlfromnowhere' }
    ]
  },
  {
    id: 'namtan-2',
    title: 'Girl From Nowhere 2',
    titleThai: 'เด็กใหม่ ซีซั่น 2',
    year: 2021,
    type: 'series',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=400&h=600&fit=crop',
    actors: ['namtan'],
    description: 'ภาคต่อสุดดาร์ก',
    role: 'Nanno (นำแสดง)',
    link: 'https://www.netflix.com/title/girlfromnowhere2',
    platform: 'netflix',
  },
  {
    id: 'namtan-3',
    title: 'The Gifted',
    titleThai: 'นักเรียนพลังกิฟต์',
    year: 2018,
    type: 'series',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop',
    actors: ['namtan'],
    description: 'ซีรีส์วัยรุ่นสุดฮิต',
    link: 'https://www.youtube.com/watch?v=thegifted',
    platform: 'gmm',
    links: [
      { platform: 'youtube', url: 'https://www.youtube.com/watch?v=thegifted' },
      { platform: 'netflix', url: 'https://www.netflix.com/title/81162468' },
      { platform: 'gmm', url: 'https://www.gmm25.com/shows/detail.php?id=128' }
    ]
  },
  {
    id: 'namtan-4',
    title: 'Best Actress',
    titleThai: 'นักแสดงนำหญิงยอดเยี่ยม',
    year: 2022,
    type: 'award',
    category: 'award',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=600&fit=crop',
    actors: ['namtan'],
    description: 'รางวัลจาก Nataraja Awards',
    link: 'https://www.youtube.com/watch?v=natarajaaward',
    platform: 'youtube',
  },
  {
    id: 'namtan-5',
    title: 'Cosmopolitan Cover',
    titleThai: 'ปกนิตยสาร Cosmopolitan',
    year: 2023,
    type: 'event',
    category: 'event',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    actors: ['namtan'],
    description: 'Cover Girl',
    link: 'https://cosmopolitan.co.th/namtan',
    platform: 'other',
  },
  {
    id: 'namtan-6',
    title: 'Enigma',
    titleThai: 'เอ็นิกม่า',
    year: 2019,
    type: 'series',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&h=600&fit=crop',
    actors: ['namtan'],
    description: 'ซีรีส์แนวไซไฟ',
    link: 'https://www.youtube.com/watch?v=enigma',
    platform: 'gmm',
  },

  // ========== ผลงาน Film ==========
  {
    id: 'film-1',
    title: 'F4 Thailand',
    titleThai: 'หัวใจรักสี่ดวงดาว',
    year: 2021,
    type: 'drama',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    actors: ['film'],
    description: 'รีเมคจากซีรีส์ดัง',
    role: 'Thyme (นำแสดง)',
    link: 'https://www.youtube.com/watch?v=f4thailand',
    platform: 'gmm',
  },
  {
    id: 'film-2',
    title: 'Fahlanruk',
    titleThai: 'ฟ้าลั่นรัก',
    year: 2023,
    type: 'drama',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=600&fit=crop',
    actors: ['film'],
    description: 'ละครช่อง 3',
    role: 'พระเอก',
    link: 'https://www.youtube.com/watch?v=fahlanruk',
    platform: 'ch3',
  },
  {
    id: 'film-3',
    title: 'Ingredients',
    titleThai: 'เมนูลับกับลุงอั้ม',
    year: 2022,
    type: 'variety',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=600&fit=crop',
    actors: ['film'],
    description: 'รายการทำอาหาร',
    link: 'https://www.youtube.com/watch?v=ingredients',
    platform: 'youtube',
  },
  {
    id: 'film-4',
    title: 'Popular Actor Award',
    titleThai: 'นักแสดงขวัญใจมหาชน',
    year: 2023,
    type: 'award',
    category: 'award',
    image: 'https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?w=400&h=600&fit=crop',
    actors: ['film'],
    description: 'Kazz Awards 2023',
    link: 'https://www.youtube.com/watch?v=kazzaward2023',
    platform: 'youtube',
  },
  {
    id: 'film-5',
    title: 'GQ Thailand Cover',
    titleThai: 'ปกนิตยสาร GQ Thailand',
    year: 2024,
    type: 'event',
    category: 'event',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    actors: ['film'],
    description: 'Cover Boy',
    link: 'https://gqthailand.com/film',
    platform: 'other',
  },
  {
    id: 'film-6',
    title: 'Love Senior',
    titleThai: 'รุ่นพี่ Secret Love',
    year: 2016,
    type: 'series',
    category: 'acting',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
    actors: ['film'],
    description: 'ผลงานแรกๆ',
    link: 'https://www.youtube.com/watch?v=lovesenior',
    platform: 'gmm',
  },
];

export const getWorksByState = (state: 'both' | 'namtan' | 'film' | 'lunar'): Work[] => {
  switch (state) {
    case 'both':
      return works.filter(w => w.actors.length === 2);
    case 'namtan':
      return works.filter(w => w.actors.includes('namtan'));
    case 'film':
      return works.filter(w => w.actors.includes('film'));
    case 'lunar':
      // Return event type works as "Lunar" content for now
      return works.filter(w => w.type === 'event' || w.title.includes('Fan Meeting'));
    default:
      return works;
  }
};

export const getWorksByCategory = (
  state: 'both' | 'namtan' | 'film' | 'lunar',
  category: string
): Work[] => {
  return getWorksByState(state).filter(w => w.category === category);
};
