import { Series } from '@/types';

export const series: Series[] = [
    // ========== ผลงานคู่ NamtanFilm ==========
    {
        contentType: 'series',
        id: 'duo-1',
        title: 'Krong Kam',
        titleThai: 'กรงกรรม',
        year: 2024,
        actors: ['namtan', 'film'],
        role: 'นำแสดง',
        description: 'ละครแนวดราม่าสุดเข้มข้น',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
        links: [
            { platform: 'ch3', url: 'https://ch3plus.com/drama/808' },
            { platform: 'netflix', url: 'https://www.netflix.com/title/81093155' }
        ]
    },
    {
        contentType: 'series',
        id: 'duo-2',
        title: 'Midnight Museum',
        titleThai: 'พิพิธภัณฑ์รัตติกาล',
        year: 2023,
        actors: ['namtan', 'film'],
        description: 'ซีรีส์สยองขวัญสุดระทึก',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
        links: [
            { platform: 'netflix', url: 'https://www.netflix.com/title/midnightmuseum' }
        ]
    },

    // ========== ผลงาน Namtan ==========
    {
        contentType: 'series',
        id: 'namtan-1',
        title: 'Girl From Nowhere',
        titleThai: 'เด็กใหม่',
        year: 2018,
        actors: ['namtan'],
        role: 'Nanno (นำแสดง)',
        description: 'ซีรีส์ดังระดับ Netflix',
        image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
        links: [
            { platform: 'netflix', url: 'https://www.netflix.com/title/girlfromnowhere' }
        ]
    },
    {
        contentType: 'series',
        id: 'namtan-2',
        title: 'Girl From Nowhere 2',
        titleThai: 'เด็กใหม่ ซีซั่น 2',
        year: 2021,
        actors: ['namtan'],
        role: 'Nanno (นำแสดง)',
        description: 'ภาคต่อสุดดาร์ก',
        image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=400&h=600&fit=crop',
        links: [
            { platform: 'netflix', url: 'https://www.netflix.com/title/girlfromnowhere2' }
        ]
    },
    {
        contentType: 'series',
        id: 'namtan-3',
        title: 'The Gifted',
        titleThai: 'นักเรียนพลังกิฟต์',
        year: 2018,
        actors: ['namtan'],
        description: 'ซีรีส์วัยรุ่นสุดฮิต',
        image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop',
        links: [
            { platform: 'youtube', url: 'https://www.youtube.com/watch?v=thegifted' },
            { platform: 'netflix', url: 'https://www.netflix.com/title/81162468' },
            { platform: 'gmm', url: 'https://www.gmm25.com/shows/detail.php?id=128' }
        ]
    },
    {
        contentType: 'series',
        id: 'namtan-6',
        title: 'Enigma',
        titleThai: 'เอ็นิกม่า',
        year: 2019,
        actors: ['namtan'],
        description: 'ซีรีส์แนวไซไฟ',
        image: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&h=600&fit=crop',
        links: [
            { platform: 'gmm', url: 'https://www.youtube.com/watch?v=enigma' }
        ]
    },

    // ========== ผลงาน Film ==========
    {
        contentType: 'series',
        id: 'film-1',
        title: 'F4 Thailand',
        titleThai: 'หัวใจรักสี่ดวงดาว',
        year: 2021,
        actors: ['film'],
        role: 'Thyme (นำแสดง)',
        description: 'รีเมคจากซีรีส์ดัง',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
        links: [
            { platform: 'gmm', url: 'https://www.youtube.com/watch?v=f4thailand' }
        ]
    },
    {
        contentType: 'series',
        id: 'film-2',
        title: 'Fahlanruk',
        titleThai: 'ฟ้าลั่นรัก',
        year: 2023,
        actors: ['film'],
        role: 'พระเอก',
        description: 'ละครช่อง 3',
        image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=600&fit=crop',
        links: [
            { platform: 'ch3', url: 'https://www.youtube.com/watch?v=fahlanruk' }
        ]
    },
    {
        contentType: 'series',
        id: 'film-6',
        title: 'Love Senior',
        titleThai: 'รุ่นพี่ Secret Love',
        year: 2016,
        actors: ['film'],
        description: 'ผลงานแรกๆ',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
        links: [
            { platform: 'gmm', url: 'https://www.youtube.com/watch?v=lovesenior' }
        ]
    },
];
