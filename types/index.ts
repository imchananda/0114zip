export type ViewState = 'both' | 'namtan' | 'film' | 'lunar';

export interface Actor {
  id: string;
  name: string;
  nameThai: string;
  nickname: string;
  nicknameThai?: string;
  tagline: string;
  taglineThai: string;
  image: string;
  heroImage: string;
  color: {
    primary: string;
    secondary: string;
    glow: string;
  };
  bio?: {
    fullName: string;
    fullNameThai: string;
    birthDate: string;
    birthDateThai?: string;
    birthPlace?: string;
    birthPlaceThai?: string;
    education: string;
    educationThai?: string;
    description?: string;
    descriptionThai?: string;
  };
  social?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

// Platform types for streaming links
export type Platform = 'youtube' | 'netflix' | 'wetv' | 'iqiyi' | 'viu' | 'ch3' | 'gmm' | 'other';

// Base interface for common fields
interface BaseContent {
  id: string;
  title: string;
  titleThai?: string;
  year: number;
  actors: ('namtan' | 'film')[];
  image: string;
}

// 1. Series (ละคร/ซีรีส์/หนัง)
export interface Series extends BaseContent {
  contentType: 'series';
  role?: string;
  description?: string;
  links?: { platform: Platform; url: string }[];
}

// 2. Variety (รายการวาไรตี้)
export interface Variety extends BaseContent {
  contentType: 'variety';
  link?: string;
}

// 3. Event (กิจกรรม)
export type EventType = 'fan_meeting' | 'press_con' | 'concert' | 'other';

export interface Event extends BaseContent {
  contentType: 'event';
  date?: string;
  eventType: EventType;
  venue?: string;
  description?: string;
  link?: string;
}

// 4. Magazine (นิตยสาร)
export interface Magazine extends BaseContent {
  contentType: 'magazine';
  magazineName: string;
  issue?: string;
  description?: string;
  link?: string;
}

// 5. Award (รางวัล)
export interface Award {
  contentType: 'award';
  id: string;
  awardName: string;
  awardNameThai?: string;
  ceremony: string;
  year: number;
  actors: ('namtan' | 'film')[];
  workTitle?: string;
  description?: string;
  image: string;
  link?: string;
}

// Union type for all content types
export type ContentItem = Series | Variety | Event | Magazine | Award;

// Legacy Work interface for backward compatibility (deprecated)
export interface Work {
  id: string;
  title: string;
  titleThai?: string;
  year: number;
  type: 'drama' | 'series' | 'film' | 'variety' | 'award' | 'event';
  category: 'acting' | 'award' | 'event';
  image: string;
  actors: ('namtan' | 'film')[];
  description?: string;
  role?: string;
  link?: string;
  platform?: Platform;
  links?: { platform: Platform; url: string }[];
}

export interface Category {
  id: string;
  title: string;
  titleThai: string;
  icon: string;
}

// DisplayItem - simplified interface for UI components (ContentRow, ContentCard)
export interface DisplayItem {
  id: string;
  title: string;
  titleThai?: string;
  year: number;
  image: string;
  actors: ('namtan' | 'film')[];
  contentType: 'series' | 'variety' | 'event' | 'magazine' | 'award';
  description?: string;
  role?: string;
  link?: string;
  links?: { platform: Platform; url: string }[];
}
