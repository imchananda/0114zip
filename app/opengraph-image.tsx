import { ImageResponse } from 'next/og';

export const runtime = 'edge';
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
          background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%)',
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
            background: 'radial-gradient(circle, rgba(30,136,229,0.3) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(253,216,53,0.3) 0%, transparent 70%)',
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
            background: 'linear-gradient(90deg, #1E88E5, #64B5F6, #FDD835, #FFF176)',
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
            background: 'linear-gradient(90deg, #1E88E5, #FDD835)',
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
