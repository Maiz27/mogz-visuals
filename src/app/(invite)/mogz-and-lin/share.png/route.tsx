import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { INVITE } from '@/lib/invite';

// Drawn once at build time.
export const dynamic = 'force-static';

const SIZE = { width: 1200, height: 630 };
const DIR = join(process.cwd(), 'src/app/(invite)/mogz-and-lin/share.png');
const read = (path: string) => readFile(join(DIR, path));
const dataUrl = (bytes: Buffer, type: string) => `data:${type};base64,${bytes.toString('base64')}`;

const GOLD = '#c5a15b';
const FOIL = 'linear-gradient(100deg, #b08a43 0%, #ead6a4 30%, #c5a15b 50%, #f6e7c1 66%, #b08a43 100%)';
const BAND = 'linear-gradient(90deg, #7a5c26 0%, #c5a15b 18%, #f1e0b4 34%, #d2b170 50%, #a8854a 66%, #e6cf98 82%, #7a5c26 100%)';
const BAND_X = 300;

// next/og has no `inset` shorthand.
const frame = (gap: number) =>
  ({ position: 'absolute', top: gap, left: gap, right: gap, bottom: gap, display: 'flex' }) as const;

/**
 * The link preview: the cover in landscape. Burgundy card, a champagne ribbon
 * tied down its left side, and the names in gold foil.
 */
export async function GET() {
  const [script, serif, italic, bow, paper] = await Promise.all([
    read('fonts/PinyonScript-Regular.ttf'),
    read('fonts/CormorantGaramond-Medium.ttf'),
    read('fonts/CormorantGaramond-Italic.ttf'),
    read('bow.png'),
    readFile(join(process.cwd(), 'public/imgs/wedding/paper-burgundy.jpg')),
  ]);
  const [first, second] = INVITE.couple.short;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#70263d',
          backgroundImage: `url(${dataUrl(paper, 'image/jpeg')})`,
          backgroundSize: '700px auto',
        }}
      >
        {/* The double gold rule. */}
        <div style={{ ...frame(26), border: `1.5px solid ${GOLD}` }} />
        <div style={{ ...frame(34), border: '1px solid rgba(197,161,91,0.45)' }} />

        {/* The ribbon down the card, and its bow. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: BAND_X - 24,
            width: 48,
            display: 'flex',
            backgroundImage: BAND,
            boxShadow: '6px 0 14px rgba(0,0,0,0.45)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
        <img
          src={dataUrl(bow, 'image/png')}
          width={360}
          height={350}
          alt=''
          style={{ position: 'absolute', left: BAND_X - 180, top: 315 - 350 * 0.31 - 40 }}
        />

        <div
          style={{
            position: 'absolute',
            left: 470,
            right: 70,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Cormorant',
              fontSize: 22,
              letterSpacing: 9,
              color: GOLD,
              display: 'flex',
            }}
          >
            THE WEDDING OF
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 8,
              fontFamily: 'Pinyon',
              fontSize: 132,
              lineHeight: 1.35,
              backgroundImage: FOIL,
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            <span>{first}</span>
            {/* Lifted to the script's optical middle, as on the cover. */}
            <span style={{ fontFamily: 'CormorantItalic', fontSize: 54, margin: '0 26px', position: 'relative', top: -19 }}>
              &amp;
            </span>
            <span>{second}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <div style={{ width: 70, height: 1, backgroundColor: 'rgba(197,161,91,0.7)', display: 'flex' }} />
            <div style={{ width: 8, height: 8, margin: '0 14px', transform: 'rotate(45deg)', backgroundColor: GOLD, display: 'flex' }} />
            <div style={{ width: 70, height: 1, backgroundColor: 'rgba(197,161,91,0.7)', display: 'flex' }} />
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontFamily: 'Cormorant',
              fontSize: 34,
              color: '#f5ebdd',
            }}
          >
            {INVITE.date.long}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 12,
              fontFamily: 'Cormorant',
              fontSize: 18,
              letterSpacing: 7,
              color: 'rgba(245,235,221,0.75)',
            }}
          >
            {INVITE.city.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: [
        { name: 'Pinyon', data: script, weight: 400, style: 'normal' },
        { name: 'Cormorant', data: serif, weight: 500, style: 'normal' },
        { name: 'CormorantItalic', data: italic, weight: 400, style: 'italic' },
      ],
    },
  );
}
