'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// ---- Supported languages ----
export type Language = 'th' | 'en' | 'zh';

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
    'nav.works':    'Works',
    'nav.gallery':  'Gallery',
    'nav.timeline': 'Timeline',
    'nav.profile':  'Profile',
    'nav.about':    'About',

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

    // Gallery
    'gallery.title':    'Gallery',
    'gallery.sub':      'Photo Gallery',
    'gallery.all':      'All',
    'gallery.together': 'Together',
    'gallery.namtan':   'Namtan',
    'gallery.film':     'Film',
    'gallery.lunar':    'Lunar',

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

    // Footer
    'footer.fanmade': 'Fan-Made Website',
    'footer.rights':  'Not affiliated with any agency',

    // Lunar
    'lunar.name':    'Lunar',
    'lunar.fanclub': 'Official Fanclub',
  },

  th: {
    // Navigation
    'nav.works':    'ผลงาน',
    'nav.gallery':  'แกลเลอรี่',
    'nav.timeline': 'ไทม์ไลน์',
    'nav.profile':  'ประวัติส่วนตัว',
    'nav.about':    'เกี่ยวกับ',

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

    // Gallery
    'gallery.title':    'แกลเลอรี่',
    'gallery.sub':      'Photo Gallery',
    'gallery.all':      'ทั้งหมด',
    'gallery.together': 'คู่กัน',
    'gallery.namtan':   'น้ำตาล',
    'gallery.film':     'ฟิล์ม',
    'gallery.lunar':    'ลูน่า',

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

    // Footer
    'footer.fanmade': 'เว็บไซต์แฟนเมด',
    'footer.rights':  'ไม่ได้เกี่ยวข้องกับต้นสังกัด',

    // Lunar
    'lunar.name':    'ลูน่า',
    'lunar.fanclub': 'แฟนคลับอย่างเป็นทางการ',
  },

  zh: {
    // Navigation
    'nav.works':    '作品',
    'nav.gallery':  '图库',
    'nav.timeline': '时间轴',
    'nav.profile':  '个人资料',
    'nav.about':    '关于',

    // Hero
    'hero.scroll':    '向下滚动',
    'hero.viewWorks': '查看作品',

    // Actor labels
    'actor.realName':  '真实姓名：',
    'actor.birthDate': '生日：',
    'actor.birthPlace':'出生地：',
    'actor.education': '学历：',

    // State Indicator
    'state.namtanfilm': 'NamtanFilm',
    'state.namtan':     'Namtan',
    'state.film':       'Film',
    'state.lunar':      '月光粉丝团',

    // Content Section
    'content.together':      '合作',
    'content.togetherSub':   '携手故事',
    'content.togetherTitle': '合作作品',
    'content.namtanJourney': 'Namtan 的旅程',
    'content.filmJourney':   'Film 的旅程',
    'content.lunarSpace':    '月光空间',
    'content.filmography':   '完整作品集',
    'content.memories':      '我们的回忆',
    'content.noWorks':       '未找到作品',
    'content.tryOther':      '请尝试其他筛选',
    'content.backToTogether':'返回合作作品',

    // Categories
    'category.acting': '表演',
    'category.award':  '奖项',
    'category.event':  '活动',

    // Gallery
    'gallery.title':    '图库',
    'gallery.sub':      '照片库',
    'gallery.all':      '全部',
    'gallery.together': '合照',
    'gallery.namtan':   'Namtan',
    'gallery.film':     'Film',
    'gallery.lunar':    '月光',

    // Timeline
    'timeline.title': '时间轴',
    'timeline.sub':   '他们的旅程',

    // Profile
    'profile.title': '个人资料',
    'profile.sub':   '认识明星',

    // About
    'about.title':       '关于我们',
    'about.sub':         '关于这个粉丝网站',
    'about.couple':      '最爱的情侣',
    'about.worksCount':  '合作作品',
    'about.awards':      '共同奖项',
    'about.fans':        '粉丝',
    'about.description': '本网站由粉丝创建，收集了 Namtan Tipnaree 和 Film Rachanun 的作品与精彩故事。',
    'about.disclaimer':  '🎬 本网站为粉丝自制，与经纪公司无官方关联。',
    'about.imageRights': '图片版权归各自所有者所有',

    // Footer
    'footer.fanmade': '粉丝自制网站',
    'footer.rights':  '与任何经纪公司无关',

    // Lunar
    'lunar.name':    '月光',
    'lunar.fanclub': '官方粉丝团',
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
