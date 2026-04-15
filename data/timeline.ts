export interface TimelineEvent {
    id: string;
    year: number;
    month?: number;
    title: string;
    titleThai: string;
    description: string;
    category: 'debut' | 'work' | 'award' | 'event' | 'milestone';
    actor: 'both' | 'namtan' | 'film';
    icon: string;
    image?: string;
}

export const timelineEvents: TimelineEvent[] = [
    // 2016
    {
        id: 't1',
        year: 2016,
        title: 'Film Debut',
        titleThai: 'ฟิล์มเดบิวต์',
        description: 'เริ่มต้นเข้าวงการจากการประกวด Go On Girl Star Search',
        category: 'debut',
        actor: 'film',
        icon: '⭐',
        image: 'https://images.unsplash.com/photo-1516280440504-45ea0f81d11b?q=80&w=800&auto=format&fit=crop'
    },

    // 2018
    {
        id: 't2',
        year: 2018,
        title: 'Girl From Nowhere',
        titleThai: 'น้ำตาลรับบท Nanno ในเด็กใหม่',
        description: 'ซีรีส์ที่ทำให้น้ำตาลโด่งดังไปทั่วโลก',
        category: 'work',
        actor: 'namtan',
        icon: '🎬',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 't3',
        year: 2018,
        title: 'The Gifted',
        titleThai: 'น้ำตาลร่วมแสดงในนักเรียนพลังกิฟต์',
        description: 'ซีรีส์ GMMTV ที่ประสบความสำเร็จ',
        category: 'work',
        actor: 'namtan',
        icon: '📺',
    },

    // 2021
    {
        id: 't4',
        year: 2021,
        title: 'F4 Thailand',
        titleThai: 'ฟิล์มรับบท Thyme ใน F4 Thailand',
        description: 'บทบาทพระเอกที่ทำให้เป็นที่รู้จักวงกว้าง',
        category: 'work',
        actor: 'film',
        icon: '🌟',
    },
    {
        id: 't5',
        year: 2021,
        title: 'Girl From Nowhere 2',
        titleThai: 'เด็กใหม่ ซีซั่น 2',
        description: 'กลับมาอีกครั้งกับบท Nanno ที่มืดหม่นกว่าเดิม',
        category: 'work',
        actor: 'namtan',
        icon: '🎭',
    },

    // 2022
    {
        id: 't6',
        year: 2022,
        title: 'Nataraja Award',
        titleThai: 'น้ำตาลได้รางวัลนักแสดงนำหญิงยอดเยี่ยม',
        description: 'รางวัลเกียรติยศจากผลงานการแสดง',
        category: 'award',
        actor: 'namtan',
        icon: '🏆',
        image: 'https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?q=80&w=800&auto=format&fit=crop'
    },

    // 2023
    {
        id: 't7',
        year: 2023,
        month: 6,
        title: 'First Meeting',
        titleThai: 'พบกันครั้งแรก',
        description: 'น้ำตาลและฟิล์มพบกันครั้งแรกในงานอีเวนต์',
        category: 'milestone',
        actor: 'both',
        icon: '💫',
        image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 't8',
        year: 2023,
        title: 'Midnight Museum',
        titleThai: 'พิพิธภัณฑ์รัตติกาล',
        description: 'ผลงานคู่แรกของน้ำตาลและฟิล์ม',
        category: 'work',
        actor: 'both',
        icon: '🎬',
    },
    {
        id: 't9',
        year: 2023,
        title: 'Kazz Awards',
        titleThai: 'ฟิล์มได้รางวัลนักแสดงขวัญใจมหาชน',
        description: 'Kazz Awards 2023',
        category: 'award',
        actor: 'film',
        icon: '🏆',
    },

    // 2024
    {
        id: 't10',
        year: 2024,
        title: 'Krong Kam',
        titleThai: 'กรงกรรม',
        description: 'ละครช่อง 3 ที่ทำให้คู่จิ้นโด่งดัง',
        category: 'work',
        actor: 'both',
        icon: '📺',
        image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 't11',
        year: 2024,
        title: 'Best Couple Award',
        titleThai: 'รางวัลคู่จิ้นยอดเยี่ยม',
        description: 'Kazz Awards 2024 - คู่จิ้นขวัญใจแฟนคลับ',
        category: 'award',
        actor: 'both',
        icon: '💕',
    },
    {
        id: 't12',
        year: 2024,
        title: 'First Fan Meeting',
        titleThai: 'แฟนมีตติ้งครั้งแรก',
        description: 'NamtanFilm Together - งานแฟนมีตติ้งคู่แรก',
        category: 'event',
        actor: 'both',
        icon: '🎉',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop'
    },
];

export const getTimelineByActor = (actor: 'both' | 'namtan' | 'film' | 'all'): TimelineEvent[] => {
    if (actor === 'all') return timelineEvents;
    return timelineEvents.filter(e => e.actor === actor || e.actor === 'both');
};
