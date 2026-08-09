import { ImageResponse } from 'next/og';

export const alt = 'Invoice.In — Aplikasi Pembuat Invoice & Manajemen Bisnis Praktis';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0c',
          backgroundImage: 'radial-gradient(circle at 50% 35%, rgba(37, 99, 235, 0.28) 0%, #0a0a0c 75%)',
          padding: '40px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '36px',
              fontWeight: 900,
            }}
          >
            i
          </div>
          <span
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Invoice.In
          </span>
        </div>

        <div
          style={{
            fontSize: '46px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.25,
            maxWidth: '960px',
            marginBottom: '20px',
          }}
        >
          Buat Invoice Digital Profesional dalam Hitungan Detik
        </div>

        <div
          style={{
            fontSize: '22px',
            color: '#cbd5e1',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.5,
          }}
        >
          Hitung DP & Pajak Otomatis • Cetak PDF Resmi A4 • Pantau Arus Kas Bisnis
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: '36px',
            padding: '10px 28px',
            borderRadius: '999px',
            background: 'rgba(37, 99, 235, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            color: '#93c5fd',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          https://invoicein.id
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
