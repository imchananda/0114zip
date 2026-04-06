export interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    category: 'both' | 'namtan' | 'film';
    aspectRatio: 'square' | 'portrait' | 'landscape';
}

export const galleryImages: GalleryImage[] = [
    // ผลงานคู่
    {
        id: 'g1',
        src: 'https://images.unsplash.com/photo-1522098543979-ffc7f79a56c4?w=800&h=1000&fit=crop',
        alt: 'NamtanFilm Together 1',
        category: 'both',
        aspectRatio: 'portrait',
    },
    {
        id: 'g2',
        src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=800&fit=crop',
        alt: 'NamtanFilm Magazine Shoot',
        category: 'both',
        aspectRatio: 'square',
    },
    {
        id: 'g3',
        src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop',
        alt: 'Fan Meeting 2024',
        category: 'both',
        aspectRatio: 'landscape',
    },
    {
        id: 'g4',
        src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
        alt: 'Couple Photoshoot',
        category: 'both',
        aspectRatio: 'portrait',
    },

    // น้ำตาล
    {
        id: 'g5',
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
        alt: 'Namtan Portrait 1',
        category: 'namtan',
        aspectRatio: 'portrait',
    },
    {
        id: 'g6',
        src: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=800&h=800&fit=crop',
        alt: 'Namtan Fashion',
        category: 'namtan',
        aspectRatio: 'square',
    },
    {
        id: 'g7',
        src: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1200&h=800&fit=crop',
        alt: 'Girl From Nowhere BTS',
        category: 'namtan',
        aspectRatio: 'landscape',
    },
    {
        id: 'g8',
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
        alt: 'Namtan Award Show',
        category: 'namtan',
        aspectRatio: 'portrait',
    },

    // ฟิล์ม
    {
        id: 'g9',
        src: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1000&fit=crop',
        alt: 'Film Portrait 1',
        category: 'film',
        aspectRatio: 'portrait',
    },
    {
        id: 'g10',
        src: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&h=800&fit=crop',
        alt: 'Film GQ Cover',
        category: 'film',
        aspectRatio: 'square',
    },
    {
        id: 'g11',
        src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=800&fit=crop',
        alt: 'F4 Thailand BTS',
        category: 'film',
        aspectRatio: 'landscape',
    },
    {
        id: 'g12',
        src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
        alt: 'Film Award Show',
        category: 'film',
        aspectRatio: 'portrait',
    },
];
