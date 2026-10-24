import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/queries'

export const runtime = 'nodejs'
export const alt = 'Manish Kumawat — Forward Deployed AI Engineer & Designer'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const settings = await getSiteSettings()

  const ownerName = settings?.owner_name || 'Manish Kumawat'
  const roleTitle =
    settings?.role_title || 'Forward Deployed AI Engineer & Designer'
  const tagline =
    settings?.tagline ||
    'I build tools that solve real problems and design things people remember.'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#EAEFE9',
          padding: '80px',
          fontFamily: 'sans-serif',
          border: '12px solid #D5D9D0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#111A16',
              letterSpacing: '-0.02em',
            }}
          >
            {ownerName}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '20px',
              color: '#C8156B',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                transform: 'rotate(45deg)',
                backgroundColor: '#C8156B',
              }}
            />
            <span>Instrument</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px' }}>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 600,
              lineHeight: 1.05,
              color: '#111A16',
              letterSpacing: '-0.03em',
            }}
          >
            {roleTitle}
          </div>
          <div
            style={{
              fontSize: '28px',
              lineHeight: 1.4,
              color: '#596159',
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid #7F867D',
            paddingTop: '24px',
            fontSize: '18px',
            color: '#596159',
          }}
        >
          <div>Forward Deployed Systems & Design</div>
          <div style={{ color: '#2743E8', fontWeight: 500 }}>manishkumawat.com</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
