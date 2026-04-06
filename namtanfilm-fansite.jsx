import { useState, useCallback, useMemo, createContext, useContext } from 'react';

// ============ DATA ============
const actors = {
  actorA: {
    id: 'actorA',
    name: 'Namtan Tipnaree',
    nameThai: 'น้ำตาล ทิพนารี',
    nickname: 'Namtan',
    tagline: 'ความสดใสที่เติมเต็มทุกบทบาท',
    color: '#69bcdc',
  },
  actorB: {
    id: 'actorB',
    name: 'Film Rachanun',
    nameThai: 'ฟิล์ม รัชชานนท์',
    nickname: 'Film',
    tagline: 'พระเอกหนุ่มขวัญใจมหาชน',
    color: '#f8e85f',
  },
};

const works = [
  // ผลงานคู่
  { id: 'c1', title: 'กรงsatisfied', titleThai: 'กรงกรรม', year: 2024, category: 'acting', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', actors: ['actorA', 'actorB'], description: 'ละครแนวดราม่า' },
  { id: 'c2', title: 'Midnight Museum', titleThai: 'พิพิธภัณฑ์รัตติกาล', year: 2023, category: 'acting', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', actors: ['actorA', 'actorB'], description: 'ซีรีส์สยองขวัญ' },
  { id: 'c3', title: 'คู่จิ้นยอดเยี่ยม', titleThai: 'Kazz Awards 2024', year: 2024, category: 'award', image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400&h=600&fit=crop', actors: ['actorA', 'actorB'] },
  { id: 'c4', title: 'Fan Meeting 2024', titleThai: 'NamtanFilm Together', year: 2024, category: 'event', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=600&fit=crop', actors: ['actorA', 'actorB'] },

  // ผลงาน Namtan
  { id: 'a1', title: 'Girl From Nowhere', titleThai: 'เด็กใหม่', year: 2018, category: 'acting', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop', actors: ['actorA'] },
  { id: 'a2', title: 'Girl From Nowhere 2', titleThai: 'เด็กใหม่ ซีซั่น 2', year: 2021, category: 'acting', image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=400&h=600&fit=crop', actors: ['actorA'] },
  { id: 'a3', title: 'Best Actress', titleThai: 'นักแสดงนำหญิงยอดเยี่ยม', year: 2022, category: 'award', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=600&fit=crop', actors: ['actorA'] },
  { id: 'a4', title: 'Cosmopolitan Cover', titleThai: 'ปกนิตยสาร Cosmo', year: 2023, category: 'event', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop', actors: ['actorA'] },
  { id: 'a5', title: 'The Gifted', titleThai: 'นักเรียนพลังกิฟต์', year: 2018, category: 'acting', image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop', actors: ['actorA'] },

  // ผลงาน Film
  { id: 'b1', title: 'F4 Thailand', titleThai: 'หัวใจรักสี่ดวงดาว', year: 2021, category: 'acting', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop', actors: ['actorB'] },
  { id: 'b2', title: 'Fahlanruk', titleThai: 'ฟ้าลั่นรัก', year: 2023, category: 'acting', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=600&fit=crop', actors: ['actorB'] },
  { id: 'b3', title: 'Popular Actor', titleThai: 'นักแสดงขวัญใจมหาชน', year: 2023, category: 'award', image: 'https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?w=400&h=600&fit=crop', actors: ['actorB'] },
  { id: 'b4', title: 'GQ Thailand', titleThai: 'ปกนิตยสาร GQ', year: 2024, category: 'event', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', actors: ['actorB'] },
  { id: 'b5', title: 'Ingredients', titleThai: 'เมนูลับกับลุงอั้ม', year: 2022, category: 'acting', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop', actors: ['actorB'] },
];

const categories = [
  { id: 'acting', title: 'Acting Works', titleThai: 'ผลงานการแสดง', icon: '▶' },
  { id: 'award', title: 'Awards', titleThai: 'รางวัล', icon: '★' },
  { id: 'event', title: 'Events & Magazine', titleThai: 'กิจกรรม & นิตยสาร', icon: '◈' },
];

// ============ CONTEXT ============
const ViewStateContext = createContext(null);

function ViewStateProvider({ children }) {
  const [state, setState] = useState('both');
  const [hoveredActor, setHoveredActor] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback((newState) => {
    if (state === newState || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setState(newState);
      setTimeout(() => setIsTransitioning(false), 400);
    }, 150);
  }, [state, isTransitioning]);

  return (
    <ViewStateContext.Provider value={{ state, transitionTo, isTransitioning, hoveredActor, setHoveredActor }}>
      {children}
    </ViewStateContext.Provider>
  );
}

function useViewState() {
  const context = useContext(ViewStateContext);
  if (!context) throw new Error('useViewState must be used within ViewStateProvider');
  return context;
}

// ============ COMPONENTS ============

// Netflix-Style Hero Banner
function HeroBanner() {
  const { state, transitionTo, hoveredActor, setHoveredActor } = useViewState();

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Full-screen Couple Photo Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1522098543979-ffc7f79a56c4?w=1920&h=1080&fit=crop"
          alt="Namtan and Film together"
          className="w-full h-full object-cover object-top"
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-40" />

        {/* Vignette Effect */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
        }} />
      </div>

      {/* Interactive Actor Zones */}
      <div className="absolute inset-0 flex">
        {/* Namtan Zone (Left Half) */}
        <div
          className="relative w-1/2 h-full cursor-pointer"
          onMouseEnter={() => setHoveredActor('actorA')}
          onMouseLeave={() => setHoveredActor(null)}
          onClick={() => transitionTo(state === 'actorA' ? 'both' : 'actorA')}
        >
          {/* Highlight Overlay */}
          <div
            className={`absolute inset-0 transition-all duration-700 ease-out
              ${hoveredActor === 'actorA' ? 'bg-gradient-to-r from-cyan-500/20 to-transparent' : ''}
              ${hoveredActor === 'actorB' ? 'bg-black/60' : ''}`}
          />

          {/* Actor Info - Appears on Hover */}
          <div className={`absolute bottom-32 left-8 md:left-16 lg:left-24 transition-all duration-700 ease-out
            ${hoveredActor === 'actorA' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Color Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-1 h-20 rounded-full"
                style={{ backgroundColor: actors.actorA.color }}
              />
              <div className="w-16 h-px bg-cyan-400/50" />
            </div>

            {/* Name */}
            <p className="text-cyan-300/80 text-sm tracking-[0.4em] uppercase mb-3 font-light">
              {actors.actorA.nameThai}
            </p>
            <h2 className="text-white text-5xl md:text-7xl font-light tracking-wider mb-4">
              {actors.actorA.nickname}
            </h2>
            <p className="text-white/50 text-base font-light max-w-sm leading-relaxed">
              {actors.actorA.tagline}
            </p>

            {/* CTA Button */}
            <button className="mt-8 group flex items-center gap-3 px-8 py-3 
              bg-white/10 hover:bg-white text-white hover:text-black
              backdrop-blur-sm border border-white/20 hover:border-white
              rounded-full transition-all duration-300">
              <span className="text-sm tracking-wider">ดูผลงาน</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Divider Line */}
          <div
            className={`absolute right-0 top-1/4 bottom-1/4 w-px transition-all duration-500
              ${hoveredActor === 'actorA' ? 'bg-cyan-400/40' : 'bg-white/5'}`}
          />
        </div>

        {/* Film Zone (Right Half) */}
        <div
          className="relative w-1/2 h-full cursor-pointer"
          onMouseEnter={() => setHoveredActor('actorB')}
          onMouseLeave={() => setHoveredActor(null)}
          onClick={() => transitionTo(state === 'actorB' ? 'both' : 'actorB')}
        >
          {/* Highlight Overlay */}
          <div
            className={`absolute inset-0 transition-all duration-700 ease-out
              ${hoveredActor === 'actorB' ? 'bg-gradient-to-l from-yellow-500/20 to-transparent' : ''}
              ${hoveredActor === 'actorA' ? 'bg-black/60' : ''}`}
          />

          {/* Actor Info - Appears on Hover */}
          <div className={`absolute bottom-32 right-8 md:right-16 lg:right-24 text-right transition-all duration-700 ease-out
            ${hoveredActor === 'actorB' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Color Bar */}
            <div className="flex items-center justify-end gap-4 mb-6">
              <div className="w-16 h-px bg-yellow-400/50" />
              <div
                className="w-1 h-20 rounded-full"
                style={{ backgroundColor: actors.actorB.color }}
              />
            </div>

            {/* Name */}
            <p className="text-yellow-300/80 text-sm tracking-[0.4em] uppercase mb-3 font-light">
              {actors.actorB.nameThai}
            </p>
            <h2 className="text-white text-5xl md:text-7xl font-light tracking-wider mb-4">
              {actors.actorB.nickname}
            </h2>
            <p className="text-white/50 text-base font-light max-w-sm ml-auto leading-relaxed">
              {actors.actorB.tagline}
            </p>

            {/* CTA Button */}
            <button className="mt-8 group flex items-center gap-3 px-8 py-3 ml-auto
              bg-white/10 hover:bg-white text-white hover:text-black
              backdrop-blur-sm border border-white/20 hover:border-white
              rounded-full transition-all duration-300">
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="text-sm tracking-wider">ดูผลงาน</span>
            </button>
          </div>

          {/* Divider Line */}
          <div
            className={`absolute left-0 top-1/4 bottom-1/4 w-px transition-all duration-500
              ${hoveredActor === 'actorB' ? 'bg-yellow-400/40' : 'bg-white/5'}`}
          />
        </div>
      </div>

      {/* Center Logo - Shows when no hover */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center
          transition-all duration-700 pointer-events-none
          ${hoveredActor ? 'opacity-0 scale-90 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
      >
        {/* Main Title */}
        <div className="relative">
          <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-light tracking-[0.2em]">
            <span>Namtan</span>
            <span className="text-white/50 mx-2 md:mx-4">×</span>
            <span>Film</span>
          </h1>
        </div>

        {/* Subtitle */}
        {/* <p className="text-white/40 text-sm md:text-base tracking-[0.5em] uppercase mt-10">
          คู่จิ้นขวัญใจแฟนคลับ
        </p> */}

        {/* Hover Hint */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-white/30 text-xs tracking-[0.3em] uppercase">เลื่อนเมาส์เพื่อสำรวจ</span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
        transition-opacity duration-500 ${hoveredActor ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-white/30 text-xs tracking-[0.3em]">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-white/10" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-white/10" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-white/10" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-white/10" />
    </section>
  );
}

// State Indicator Pills
function StateIndicator() {
  const { state, transitionTo, isTransitioning } = useViewState();

  const states = [
    { key: 'both', label: 'Together', labelThai: 'ด้วยกัน', color: 'linear-gradient(90deg, #69bcdc, #f8e85f)' },
    { key: 'actorA', label: 'Namtan', labelThai: 'น้ำตาล', color: actors.actorA.color },
    { key: 'actorB', label: 'Film', labelThai: 'ฟิล์ม', color: actors.actorB.color },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-black/95 backdrop-blur-2xl border-b border-white/5">
      <div className="flex justify-center items-center gap-2 py-4 px-4">
        {states.map(({ key, label, labelThai, color }, index) => (
          <div key={key} className="flex items-center">
            <button
              onClick={() => !isTransitioning && transitionTo(key)}
              disabled={isTransitioning}
              className={`relative px-6 py-2.5 text-sm tracking-wider transition-all duration-300
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-full
                ${state === key
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'}
                ${isTransitioning ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              {/* Active Background */}
              {state === key && (
                <span
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{ background: color }}
                />
              )}

              {/* Active Indicator */}
              {state === key && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: color }}
                />
              )}

              <span className="relative z-10 font-light">{label}</span>
            </button>

            {index < states.length - 1 && (
              <span className="text-white/10 mx-2 text-lg">|</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

// Content Card
function ContentCard({ work }) {
  const [isHovered, setIsHovered] = useState(false);

  const categoryIcons = { acting: '▶', award: '★', event: '◈' };
  const categoryColors = { acting: '#EF4444', award: '#F59E0B', event: '#8B5CF6' };

  return (
    <article
      className="relative group cursor-pointer flex-shrink-0 w-44 md:w-52 lg:w-56"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative aspect-[2/3] rounded overflow-hidden bg-neutral-900
          transition-all duration-500 ease-out
          ${isHovered ? '-translate-y-3 shadow-2xl shadow-black/80' : 'shadow-xl shadow-black/50'}`}
      >
        <img
          src={work.image}
          alt={work.title}
          className={`w-full h-full object-cover transition-all duration-700
            ${isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-90'}`}
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 transition-all duration-500
          bg-gradient-to-t from-black via-black/50 to-transparent
          ${isHovered ? 'opacity-90' : 'opacity-70'}`}
        />

        {/* Year */}
        <div className="absolute top-4 left-4 text-white/50 text-xs tracking-widest font-light">
          {work.year}
        </div>

        {/* Category Badge */}
        <div
          className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center
            text-white text-xs transition-all duration-300
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`}
          style={{ backgroundColor: categoryColors[work.category] + '40' }}
        >
          {categoryIcons[work.category]}
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white font-light text-base leading-snug tracking-wide mb-1">
            {work.titleThai || work.title}
          </h3>
          <p className={`text-white/40 text-xs font-light tracking-wider transition-all duration-300
            ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {work.description || work.title}
          </p>
        </div>

        {/* Duo Badge */}
        {work.actors.length === 2 && (
          <div className={`absolute bottom-4 right-4 flex items-center gap-1.5 transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-50'}`}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: actors.actorA.color }} />
            <span className="text-white/40 text-[10px]">×</span>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: actors.actorB.color }} />
          </div>
        )}

        {/* Hover Border */}
        <div className={`absolute inset-0 rounded transition-all duration-500
          ${isHovered ? 'ring-1 ring-white/30 ring-inset' : ''}`} />
      </div>
    </article>
  );
}

// Content Row
function ContentRow({ title, titleThai, icon, works, delay = 0 }) {
  if (works.length === 0) return null;

  return (
    <section
      className="py-8 md:py-10 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Row Header */}
      <div className="flex items-end gap-4 px-6 md:px-12 lg:px-20 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-white text-xl md:text-2xl font-light tracking-wide">{title}</h3>
            <p className="text-white/30 text-sm font-light">{titleThai}</p>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        <span className="text-white/20 text-xs tracking-widest">{works.length} ITEMS</span>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-4 md:gap-5 overflow-x-auto px-6 md:px-12 lg:px-20 pb-4 scrollbar-hide">
        {works.map((work, i) => (
          <div
            key={work.id}
            className="animate-fade-in"
            style={{ animationDelay: `${delay + (i * 100)}ms` }}
          >
            <ContentCard work={work} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Content Section
function ContentSection() {
  const { state } = useViewState();

  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      if (state === 'both') return work.actors.length === 2;
      return work.actors.includes(state);
    });
  }, [state]);

  const worksByCategory = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      works: filteredWorks.filter(w => w.category === cat.id),
    })).filter(cat => cat.works.length > 0);
  }, [filteredWorks]);

  const sectionInfo = {
    both: {
      title: 'ผลงานที่แสดงร่วมกัน',
      sub: 'Their Story Together',
      gradient: 'from-cyan-500 to-yellow-500'
    },
    actorA: {
      title: 'ผลงานของน้ำตาล',
      sub: "Namtan's Journey",
      gradient: 'from-cyan-500 to-cyan-300'
    },
    actorB: {
      title: 'ผลงานของฟิล์ม',
      sub: "Film's Journey",
      gradient: 'from-yellow-500 to-yellow-300'
    },
  };

  const info = sectionInfo[state];

  return (
    <section className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black pt-12 pb-24">
      {/* Section Header */}
      <div className="px-6 md:px-12 lg:px-20 mb-12">
        <div key={state} className="animate-fade-in">
          <div className="flex items-center gap-6">
            <div
              className={`w-1.5 h-20 rounded-full bg-gradient-to-b ${info.gradient}`}
            />
            <div>
              <p className="text-white/40 text-sm tracking-[0.3em] uppercase mb-2 font-light">
                {info.sub}
              </p>
              <h2 className="text-white text-4xl md:text-5xl font-extralight tracking-wide">
                {info.title}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div key={state}>
        {worksByCategory.map((cat, index) => (
          <ContentRow
            key={cat.id}
            title={cat.title}
            titleThai={cat.titleThai}
            icon={cat.icon}
            works={cat.works}
            delay={index * 150}
          />
        ))}
      </div>
    </section>
  );
}

// Return Button
function ReturnButton() {
  const { state, transitionTo } = useViewState();

  if (state === 'both') return null;

  return (
    <div className="flex justify-center py-16 bg-black">
      <button
        onClick={() => transitionTo('both')}
        className="group flex items-center gap-3 text-white/40 hover:text-white text-sm tracking-wider 
          transition-all duration-300 border border-white/10 hover:border-white/30 
          px-8 py-4 rounded-full hover:bg-white/5"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>กลับไปหน้าผลงานคู่</span>
      </button>
    </div>
  );
}

// Header
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
      <nav className="container mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 text-white group">
          <span className="text-2xl font-light tracking-[0.15em]">
            Namtan
            <span className="text-white/50 mx-1">×</span>
            Film
          </span>
        </a>
        <div className="hidden md:flex items-center gap-10">
          {['ผลงาน', 'แกลเลอรี่', 'ไทม์ไลน์', 'เกี่ยวกับ'].map(item => (
            <a
              key={item}
              href="#"
              className="text-white/40 hover:text-white text-sm font-light tracking-wider transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-20">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h3 className="text-white text-3xl font-light tracking-[0.2em] mb-4">
          Namtan
          <span className="text-white/50 mx-2">×</span>
          Film
        </h3>
        <p className="text-white/30 text-sm font-light tracking-wider mb-8">
          สร้างด้วยความรักจากแฟนคลับ
        </p>
        <div className="flex items-center justify-center gap-8 mb-8">
          {['Twitter', 'Instagram', 'TikTok'].map(social => (
            <a key={social} href="#" className="text-white/20 hover:text-white/60 text-xs tracking-widest transition-colors">
              {social}
            </a>
          ))}
        </div>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-8" />
        <p className="text-white/15 text-xs tracking-wider">
          © 2024 Fan Project · ไม่ได้เกี่ยวข้องกับต้นสังกัด
        </p>
      </div>
    </footer>
  );
}

// ============ MAIN APP ============
export default function App() {
  return (
    <ViewStateProvider>
      <div className="min-h-screen bg-black text-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            font-family: 'Inter', 'IBM Plex Sans Thai', sans-serif;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Inter', 'IBM Plex Sans Thai', sans-serif;
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }
          
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          
          ::selection {
            background: rgba(105, 188, 220, 0.3);
            color: white;
          }
        `}</style>

        <Header />

        <main>
          <HeroBanner />
          <StateIndicator />
          <ContentSection />
          <ReturnButton />
        </main>

        <Footer />
      </div>
    </ViewStateProvider>
  );
}
