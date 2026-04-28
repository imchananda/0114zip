import { ImageResponse } from 'next/og';

export const alt = 'NamtanFilm — คู่จิ้นขวัญใจ น้ำตาล × ฟิล์ม';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#141413',
          position: 'relative',
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,191,208,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,223,116,0.3) 0%, transparent 70%)',
          }}
        />

        {/* Brand name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '28px' }}>🐼</span>
          <span style={{ fontSize: '28px' }}>🦆</span>
        </div>

        <h1
          style={{
            fontSize: '72px',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #6cbfd0, #8ed0dd, #fbdf74, #fce89a)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-2px',
            margin: '0 0 16px 0',
          }}
        >
          NamtanFilm
        </h1>

        <p
          style={{
            fontSize: '28px',
            color: 'rgba(245,245,245,0.7)',
            margin: '0 0 8px 0',
            fontWeight: 300,
          }}
        >
          คู่จิ้นขวัญใจ น้ำตาล × ฟิล์ม
        </p>

        <p
          style={{
            fontSize: '20px',
            color: 'rgba(245,245,245,0.4)',
            margin: 0,
            fontWeight: 300,
          }}
        >
          Fan-Made Portal • ผลงาน • แกลเลอรี่ • ไทม์ไลน์ • สถิติ
        </p>

        {/* Gradient line */}
        <div
          style={{
            width: '200px',
            height: '3px',
            background: 'linear-gradient(90deg, #6cbfd0, #fbdf74)',
            borderRadius: '2px',
            marginTop: '32px',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
