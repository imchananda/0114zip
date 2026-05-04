'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// ---- Supported languages ----
export type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ---- Translations ----
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.works':      'Works',
    'nav.timeline':   'Timeline',
    'nav.profile':    'Profile',
    'nav.about':      'About',
    'nav.community':  'Community',
    'nav.challenges': 'Challenges',
    'nav.engage':     'Engage Hub',
    'nav.schedule':   'Schedule',
    'nav.awards':     'Awards',
    'nav.stats':      'Stats',

    // Hero
    'hero.scroll':    'SCROLL',
    'hero.viewWorks': 'View Works',

    // Actor labels
    'actor.realName':  'Real Name:',
    'actor.birthDate': 'Birth Date:',
    'actor.birthPlace':'Birth Place:',
    'actor.education': 'Education:',

    // State Indicator
    'state.namtanfilm': 'NamtanFilm',
    'state.namtan':     'Namtan',
    'state.film':       'Film',
    'state.lunar':      'Lunar',

    // Content Section
    'content.together':      'Together',
    'content.togetherSub':   'Their Story Together',
    'content.togetherTitle': 'Works Together',
    'content.namtanJourney': "Namtan's Journey",
    'content.filmJourney':   "Film's Journey",
    'content.lunarSpace':    "Lunar's Space",
    'content.filmography':   'Complete Filmography',
    'content.memories':      'Our Memories',
    'content.noWorks':       'No works found',
    'content.tryOther':      'Try selecting another filter',
    'content.backToTogether':'Back to Works Together',

    // Categories
    'category.acting': 'Acting',
    'category.award':  'Awards',
    'category.event':  'Events',

    // Timeline
    'timeline.title': 'Timeline',
    'timeline.sub':   'Their Journey',

    // Profile
    'profile.title': 'Profile',
    'profile.sub':   'Meet The Stars',

    // About
    'about.title':       'About Us',
    'about.sub':         'About This Fansite',
    'about.couple':      'Beloved Couple',
    'about.worksCount':  'Works Together',
    'about.awards':      'Shared Awards',
    'about.fans':        'Fans',
    'about.description': 'This website was created with love and admiration from fans, to collect the works and memorable stories of the beloved couple Namtan Tipnaree and Film Rachanun.',
    'about.disclaimer':  '🎬 This website is fan-made and is not officially affiliated with the agency.',
    'about.imageRights': 'All images belong to their respective owners',

    // Previews (Home)
    'preview.engage.title': 'Engagement Hub',
    'preview.engage.sub':   'Join the Trend',
    'preview.engage.live':  'LIVE',
    'preview.schedule.title': 'Upcoming Events',
    'preview.schedule.sub': 'Save the Date',
    'preview.awards.title': 'Recent Awards',
    'preview.awards.sub':   'Hall of Fame',
    'preview.all':          'View All',

    // Footer
    'footer.fanmade': 'Fan-Made Website',
    'footer.rights':  'Not affiliated with any agency',

    // Lunar
    'lunar.name':    'Lunar',
    'lunar.fanclub': 'Official Fanclub',
  },

  th: {
    // Navigation
    'nav.works':      'ผลงาน',
    'nav.timeline':   'ไทม์ไลน์',
    'nav.profile':    'ประวัติส่วนตัว',
    'nav.about':      'เกี่ยวกับ',
    'nav.community':  'ชุมชน',
    'nav.challenges': 'ชาเลนจ์',
    'nav.engage':     'เอ็นเกจเมนท์',
    'nav.schedule':   'ตารางงาน',
    'nav.awards':     'รางวัล',
    'nav.stats':      'สถิติ',

    // Hero
    'hero.scroll':    'เลื่อนลง',
    'hero.viewWorks': 'ดูผลงาน',

    // Actor labels
    'actor.realName':  'ชื่อจริง:',
    'actor.birthDate': 'วันเกิด:',
    'actor.birthPlace':'ภูมิลำเนา:',
    'actor.education': 'การศึกษา:',

    // State Indicator
    'state.namtanfilm': 'น้ำตาลฟิล์ม',
    'state.namtan':     'น้ำตาล',
    'state.film':       'ฟิล์ม',
    'state.lunar':      'ลูน่า',

    // Content Section
    'content.together':      'ผลงานคู่',
    'content.togetherSub':   'ผลงานที่แสดงร่วมกัน',
    'content.togetherTitle': 'ผลงานที่แสดงร่วมกัน',
    'content.namtanJourney': 'ผลงานของน้ำตาล',
    'content.filmJourney':   'ผลงานของฟิล์ม',
    'content.lunarSpace':    'พื้นที่ของลูน่า',
    'content.filmography':   'ผลงานทั้งหมด',
    'content.memories':      'ความทรงจำของเรา',
    'content.noWorks':       'ไม่พบผลงาน',
    'content.tryOther':      'ลองเลือกดูแบบอื่น',
    'content.backToTogether':'กลับไปหน้าผลงานคู่',

    // Categories
    'category.acting': 'การแสดง',
    'category.award':  'รางวัล',
    'category.event':  'อีเว้นท์',

    // Timeline
    'timeline.title': 'ไทม์ไลน์',
    'timeline.sub':   'เส้นทางของพวกเขา',

    // Profile
    'profile.title': 'ประวัติส่วนตัว',
    'profile.sub':   'รู้จักดาราของเรา',

    // About
    'about.title':       'เกี่ยวกับเรา',
    'about.sub':         'About This Fansite',
    'about.couple':      'คู่จิ้นขวัญใจแฟนคลับ',
    'about.worksCount':  'ผลงานคู่',
    'about.awards':      'รางวัลร่วม',
    'about.fans':        'แฟนคลับ',
    'about.description': 'เว็บไซต์นี้สร้างขึ้นด้วยความรักและความชื่นชมจากแฟนคลับ เพื่อรวบรวมผลงานและเรื่องราวความประทับใจของคู่จิ้น น้ำตาล ทิพนารี และ ฟิล์ม รชานันท์',
    'about.disclaimer':  '🎬 เว็บไซต์นี้สร้างโดยแฟนคลับ ไม่ได้เกี่ยวข้องกับต้นสังกัดอย่างเป็นทางการ',
    'about.imageRights': 'All images belong to their respective owners',

    // Previews (Home)
    'preview.engage.title': 'ภารกิจของแฟนคลับ',
    'preview.engage.sub':   'มาร่วมสร้างเทรนด์',
    'preview.engage.live':  'กำลังจัดขึ้น',
    'preview.schedule.title': 'ตารางงานล่าสุด',
    'preview.schedule.sub': 'อย่าลืมบันทึกวัน',
    'preview.awards.title': 'ความสำเร็จล่าสุด',
    'preview.awards.sub':   'รางวัลแห่งความภาคภูมิใจ',
    'preview.all':          'ดูทั้งหมด',

    // Footer
    'footer.fanmade': 'เว็บไซต์แฟนเมด',
    'footer.rights':  'ไม่ได้เกี่ยวข้องกับต้นสังกัด',

    // Lunar
    'lunar.name':    'ลูน่า',
    'lunar.fanclub': 'แฟนคลับอย่างเป็นทางการ',
  },

};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('th');

  const t = (key: string): string => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
