import { Actor } from '@/types';

export const actors: Record<'namtan' | 'film' | 'lunar', Actor> = {
  namtan: {
    id: 'namtan',
    name: 'Namtan Tipnaree',
    nameThai: 'น้ำตาล ทิพนารี',
    nickname: 'Namtan',
    nicknameThai: 'น้ำตาล',
    tagline: 'Deeply Felt. Perfectly Portrayed.',
    taglineThai: 'เข้าถึงทุกความรู้สึก ลึกซึ้งทุกตัวตน',
    image: '/images/banners/nt.png',
    heroImage: '/images/banners/nt.png',
    color: {
      primary: '#69bcdc',
      secondary: '#4aa3c7',
      glow: 'rgba(105, 188, 220, 0.4)',
    },
    bio: {
      fullName: 'Tipnaree Weerawatnodom',
      fullNameThai: 'ทิพนารี วีรวัฒโนดม',
      birthDate: 'July 1, 1996',
      birthDateThai: '1 กรกฎาคม พ.ศ. 2539',
      birthPlace: 'Phra Nakhon Si Ayutthaya Province',
      birthPlaceThai: 'จังหวัดพระนครศรีอยุธยา',
      education: 'Faculty of Fine Arts, Performing Arts, Srinakharinwirot University',
      educationThai: 'คณะศิลปกรรมศาสตร์ สาขาวิชาศิลปะการแสดง มหาวิทยาลัยศรีนครินทรวิโรฒ',
    },
    social: {
      instagram: 'namtan.tipnaree',
      twitter: 'NamtanTipnaree',
      tiktok: 'namtantipnaree',
    },
  },
  film: {
    id: 'film',
    name: 'Film Rachanun',
    nameThai: 'ฟิล์ม รชานันท์',
    nickname: 'Film',
    nicknameThai: 'ฟิล์ม',
    tagline: 'Rising star with versatile talent',
    taglineThai: 'ดาวรุ่งพุ่งแรงแห่ง GMMTV',
    image: '/images/banners/f.png',
    heroImage: '/images/banners/f.png',
    color: {
      primary: '#f8e85f',
      secondary: '#e6d64e',
      glow: 'rgba(248, 232, 95, 0.4)',
    },
    bio: {
      fullName: 'Rachanun Mahawan',
      fullNameThai: 'รชานันท์ มหาวรรณ์',
      birthDate: 'July 14, 2000',
      birthDateThai: '14 กรกฎาคม พ.ศ. 2543',
      education: 'Faculty of Architecture and Design, KMUTT',
      educationThai: 'คณะสถาปัตยกรรมศาสตร์และการออกแบบ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
      description: 'GMMTV actress, Winner of Go On Girl Star Search 2019',
      descriptionThai: 'นักแสดงสังกัด GMMTV ผู้ชนะการประกวด Go On Girl Star Search 2562',
    },
    social: {
      instagram: 'fr.racha',
      twitter: 'filmracha',
      tiktok: 'fr.racha99',
    },
  },
  lunar: {
    id: 'lunar',
    name: 'Lunar',
    nameThai: 'ลูน่า',
    nickname: 'Lunar',
    tagline: 'Panda x Duck',
    taglineThai: 'แพนดั๊กผู้แสนน่ารัก',
    image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=600&fit=crop', // Moon/Night sky image
    heroImage: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920&h=1080&fit=crop',
    color: {
      primary: 'linear-gradient(135deg, #69bcdc 0%, #f8e85f 100%)', // Mix of Namtan (Blue) & Film (Yellow)
      secondary: '#f8e85f',
      glow: 'rgba(105, 188, 220, 0.4)',
    },
    bio: {
      fullName: 'NamtanFilm Official Fanclub',
      fullNameThai: 'แฟนคลับอย่างเป็นทางการ',
      birthDate: 'Everyday',
      education: 'NamtanFilm Heart',
      description: 'Lunar คือชื่อเรียกแฟนคลับของน้ำตาลและฟิล์ม โดยมีมาสคอตเป็นลูกผสมระหว่าง "แพนด้า" และ "เป็ด"',
    },
  },
};

export const getActorById = (id: 'namtan' | 'film' | 'lunar'): Actor => actors[id];
