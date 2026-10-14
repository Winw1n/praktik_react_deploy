import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const DESTINATIONS = [
  { id: 'srilanka', country: 'Sri Lanka', city: 'Colombo', code: 'CMB', flag: '🇱🇰', no: 'UL-308', time: '14:20', gate: 'G03', airline: 'SriLankan Airlines' },
  { id: 'thailand', country: 'Thailand', city: 'Bangkok', code: 'BKK', flag: '🇹🇭', no: 'TG-422', time: '16:45', gate: 'G07', airline: 'Thai Airways' },
  { id: 'china', country: 'China', city: 'Guangzhou', code: 'CAN', flag: '🇨🇳', no: 'CZ-304', time: '20:10', gate: 'G12', airline: 'China Southern' }
];
const TAKEN = ['1B', '2D', '3A', '4C', '5B', '6D', '7A'];
const PLANE_PATH = 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';

function Barcode({ value, mini = false }) {
  const bars = Array.from(value || 'KNO', (char, index) => 1 + ((char.charCodeAt(0) + index) % 4));
  return <div className={`bar ${mini ? 'mini' : ''}`}><svg viewBox={`0 0 ${bars.length * 4 + 4} 35`} preserveAspectRatio="none" aria-label="Barcode verifikasi">
    {bars.map((width, index) => <rect key={index} x={2 + index * 4} y="0" width={width} height="28" />)}
  </svg>{!mini && <code>{value}</code>}</div>;
}

function FlightRoute({ destination, progress = 1, animate = false, animationKey = 0 }) {
  const routeId = `flight-path-${destination.id}`;
  return <div className="flight-route" aria-label={`Rute KNO ke ${destination.code}`}>
    <div className="airport airport-origin"><b>KNO</b><small>Dari<br />Medan</small></div>
    <svg className="flight-arc" viewBox="0 0 280 92" role="img" aria-label="Lintasan pesawat">
      <path id={routeId} className="arc-track" d="M24 65 Q140 0 256 65" />
      <path className="arc-track-done" d="M24 65 Q140 0 256 65" pathLength="1" style={{ strokeDasharray: `${progress} 1` }} />
      <circle className="arc-dot" cx="24" cy="65" r="4" />
      <g className="arc-plane" key={`${routeId}-${animationKey}`}>
        <path d={PLANE_PATH} />
        {animate && <animateMotion dur="1.4s" repeatCount="1" rotate="auto" calcMode="easeInOut" keyPoints={`0;${progress}`} keyTimes="0;1">
          <mpath href={`#${routeId}`} />
        </animateMotion>}
      </g>
    </svg>
    <div className="airport airport-destination"><b>{destination.code}</b><small>Ke<br />{destination.city}</small></div>
  </div>;
}

function PassportScreen({ issued, dark, setDark, onReset }) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [stamped, setStamped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const scan = () => {
    setOpen(false);
    setScanning(true);
    setScanResult('');
    window.setTimeout(() => {
      setScanning(false);
      setScanResult('Paspor terverifikasi. Data cocok dengan boarding pass.');
    }, 1300);
  };

  return <div className={`app result-app ${dark ? 'dark' : 'light'}`}>
    <div className="wrap result-wrap">
      <header>
        <div><h1>Kualanamu <span className="kno">KNO</span></h1><p>Check-in web · Medan, Indonesia</p></div>
        <div className="tools"><button className="pill" onClick={() => setDark((value) => !value)}>Tema</button></div>
      </header>
      <main className="passport-result">
        <div className="result-hero">
          <span className="success-orbit orbit-a">✦</span><span className="success-orbit orbit-b">✧</span>
          <div className="success-icon">✓</div>
          <p className="eyebrow">CHECK-IN BERHASIL · {issued.ref}</p>
          <h2>Selamat jalan, {issued.passenger.split(' ')[0]}!</h2>
          <p>Paspor digital dan e-boarding pass Anda sudah siap digunakan.</p>
        </div>
        <section className="result-layout">
          <div className="passport-column">
            <div className="passport-scene">
              <span className="passport-light" />
              <button
                type="button"
                className={`result-book ${open ? 'open' : ''} ${scanning ? 'scanning' : ''}`}
                style={{ '--rx': `${tilt.x}deg`, '--ry': `${tilt.y}deg` }}
                onPointerMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setTilt({ x: -((event.clientY - rect.top) / rect.height - .5) * 10, y: ((event.clientX - rect.left) / rect.width - .5) * 12 });
                }}
                onPointerLeave={() => setTilt({ x: 0, y: 0 })}
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? 'Tutup paspor' : 'Buka paspor'}
              >
                <span className="result-page">
                  <span className="page-photo">🧑‍✈️</span>
                  <small>REPUBLIK INDONESIA</small><strong>{issued.passenger}</strong>
                  <small>NO. PASPOR</small><strong>{issued.passport}</strong>
                  <small>PERJALANAN</small><strong>{issued.destination.flag} KNO → {issued.destination.code}</strong>
                  <span className="mrz">P&lt;IDN{issued.passport}&lt;&lt;{issued.passenger.replaceAll(' ', '&lt;')}</span>
                  {stamped && <span className="passport-page-stamp">KNO<br /><small>APPROVED</small></span>}
                </span>
                <span className="result-cover">
                  <span className="cover-star">✦</span><strong>REPUBLIK INDONESIA</strong><b>PASPOR</b>
                  <span className="cover-chip">▰</span><span className="barcode-target"><Barcode value={`${issued.ref}${issued.passport}`} mini /><i /></span><small>SCAN TO VERIFY · {issued.ref}</small>
                </span>
              </button>
            </div>
            <p className="result-hint">{open ? 'Klik paspor untuk menutup halaman identitas.' : 'Klik paspor untuk membuka halaman identitas.'}</p>
            <div className="passport-actions">
              <button className="btn main" type="button" onClick={scan} disabled={scanning}>{scanning ? 'Memindai barcode...' : 'Pindai barcode paspor'}</button>
              <button className={`btn ghost ${stamped ? 'stamped' : ''}`} type="button" onClick={() => setStamped(true)}>{stamped ? '✓ Paspor sudah dicap' : 'Cap paspor'}</button>
            </div>
            <div className={`scan-result ${scanResult ? 'visible' : ''}`} role="status">{scanResult}</div>
          </div>
          <aside className="result-ticket">
            <div className="result-ticket-head"><span>E-BOARDING PASS</span><strong>{issued.ref}</strong></div>
            <FlightRoute destination={issued.destination} />
            <div className="result-details"><div><small>NAMA</small><strong>{issued.passenger}</strong></div><div><small>KURSI</small><strong>{issued.seat}</strong></div><div><small>GATE</small><strong>{issued.destination.gate}</strong></div><div><small>WAKTU</small><strong>{issued.destination.time} WIB</strong></div></div>
            <Barcode value={`P<IDN${issued.passport}<<KNO${issued.destination.code}2026`} />
          </aside>
        </section>
        <button className="new-checkin" type="button" onClick={onReset}>← Check-in penerbangan lain</button>
      </main>
    </div>
  </div>;
}

function App() {
  const [dark, setDark] = useState(true);
  const [step, setStep] = useState(0);
  const [destinationId, setDestinationId] = useState('thailand');
  const [name, setName] = useState('');
  const [passport, setPassport] = useState('');
  const [email, setEmail] = useState('');
  const [seat, setSeat] = useState('');
  const [issued, setIssued] = useState(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [ticketTilt, setTicketTilt] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState('');
  const [routeAnimation, setRouteAnimation] = useState({ progress: 0, key: 0 });

  const destination = useMemo(() => DESTINATIONS.find((item) => item.id === destinationId) || DESTINATIONS[1], [destinationId]);
  const validName = name.trim().length >= 3;
  const validPassport = /^[A-Z][0-9]{7}$/.test(passport);
  const validEmail = /^\S+@\S+\.\S+$/.test(email);
  const canContinue = step === 0 || (step === 1 && validName && validPassport && validEmail) || (step === 2 && seat);

  useEffect(() => {
    const update = () => setTime(`${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`);
    update();
    const timer = window.setInterval(update, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const reset = () => {
    setStep(0); setName(''); setPassport(''); setEmail(''); setSeat('');
    setIssued(null); setBookOpen(false); setScanResult(''); setScanning(false);
    setRouteAnimation({ progress: 0, key: 0 });
  };

  const issue = () => {
    const ref = `KNO-${Math.floor(100000 + Math.random() * 900000)}`;
    setIssued({ ref, passenger: name.trim().toUpperCase(), passport, email, seat, destination, date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) });
    setRouteAnimation(({ key }) => ({ progress: 1, key: key + 1 }));
    setStep(3);
  };

  const next = () => {
    if (step === 3) return reset();
    if (!canContinue) return;
    if (step === 2) return issue();
    const nextStep = step + 1;
    setRouteAnimation(({ key }) => ({ progress: nextStep / 3, key: key + 1 }));
    setStep(nextStep);
  };

  const scan = () => {
    setScanning(true); setScanResult('');
    window.setTimeout(() => { setScanning(false); setScanResult('✓ Paspor terverifikasi · Data cocok dengan e-boarding pass'); }, 1300);
  };

  const ticketProps = {
    '--rx': `${ticketTilt.x}deg`,
    '--ry': `${ticketTilt.y}deg`
  };

  if (issued) return <PassportScreen issued={issued} dark={dark} setDark={setDark} onReset={reset} />;

  return <div className={`app ${dark ? 'dark' : 'light'}`}>
    <div className="wrap">
      <header>
        <div><h1>Kualanamu <span className="kno">KNO</span></h1><p>Check-in web · Medan, Indonesia</p></div>
        <div className="tools"><span className="pill">{time || '--:-- WIB'}</span><button className="pill" onClick={() => setDark((value) => !value)} aria-label="Ganti tema">Tema</button></div>
      </header>
      <div className="grid">
        <section className="panel" aria-label="Form check-in">
          <div className="track"><div className="done" style={{ width: `${step / 3 * 100}%` }} /><div className="plane" style={{ left: `${step / 3 * 92 + 4}%` }}><svg viewBox="0 0 24 24" width="26" height="26"><path d={PLANE_PATH} transform="rotate(90 12 12)" /></svg></div></div>
          <div className="steps">{['Tujuan', 'Data diri', 'Kursi', 'Tiket'].map((label, index) => <span className={index === step ? 'on' : ''} key={label}>{label}</span>)}</div>
          {step === 0 && <div><h2>Mau terbang ke mana?</h2><p className="sub">Pilih tujuan, tiket di sebelah langsung berubah.</p><div className="dests">{DESTINATIONS.map((item) => <button className="dest" type="button" key={item.id} aria-pressed={item.id === destinationId} onClick={() => setDestinationId(item.id)}><span className="f">{item.flag}</span><span><b>{item.country}</b><small>{item.city} · {item.no} · {item.time} WIB</small></span><span className="c">{item.code}</span></button>)}</div></div>}
          {step === 1 && <div><h2>Isi data penumpang</h2><p className="sub">Tulis sesuai paspor. Tiket ikut terisi saat Anda mengetik.</p><Field label="Nama lengkap" value={name} placeholder="Contoh: PRAVEEN NETHMIKA" onChange={setName} valid={validName} error={name && !validName ? 'Tulis nama lengkap sesuai paspor.' : ''} /><Field label="Nomor paspor" value={passport} placeholder="N7829104" onChange={(value) => setPassport(value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} valid={validPassport} error={passport && !validPassport ? 'Format: 1 huruf diikuti 7 angka.' : ''} /><Field label="Email aktif" type="email" value={email} placeholder="nama@gmail.com" onChange={setEmail} valid={validEmail} error={email && !validEmail ? 'Masukkan email yang valid.' : ''} /></div>}
          {step === 2 && <div><h2>Pilih kursi Anda</h2><p className="sub">Ketuk kursi di denah pesawat.</p><div className="cabin"><span><i className="exec-key" />Eksekutif</span><span><i className="eco-key" />Ekonomi</span><span><i className="taken-key" />Terisi</span></div><div className="fuselage">{Array.from({ length: 7 }, (_, row) => <div className="row" key={row}>{['A', 'B', '_', 'C', 'D'].map((column) => column === '_' ? <span className="n" key={column}>{row + 1}</span> : <button className={`seat ${row < 2 ? 'exec' : ''}`} type="button" key={column} disabled={TAKEN.includes(`${row + 1}${column}`)} aria-pressed={seat === `${row + 1}${column}`} onClick={() => setSeat(`${row + 1}${column}`)}>{column}</button>)}</div>)}</div><div className="seatinfo">{seat ? `Kursi ${seat} · ${Number(seat.slice(0, -1)) <= 2 ? 'Eksekutif' : 'Ekonomi'} · ${seat.endsWith('B') || seat.endsWith('C') ? 'Aisle' : 'Window'}` : 'Belum ada kursi dipilih'}</div></div>}
          {step === 3 && <div className="complete"><div className="okmark">✓</div><h2>Check-in selesai</h2><p className="sub">E-boarding pass sudah terbit. Buka paspor Anda di sebelah untuk melihat detailnya.</p></div>}
          <div className="nav"><button className="btn ghost" type="button" hidden={step === 0 || step === 3} onClick={() => setStep((value) => value - 1)}>Kembali</button><button className="btn main" type="button" disabled={step !== 3 && !canContinue} onClick={next}>{step === 3 ? 'Buat tiket baru' : step === 2 ? 'Terbitkan tiket' : 'Lanjut isi data'}</button></div>
        </section>
        <section className="stage" aria-label="Pratinjau tiket">
          <div className="tk" style={ticketProps} onPointerMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setTicketTilt({ x: -((event.clientY - rect.top) / rect.height - .5) * 8, y: ((event.clientX - rect.left) / rect.width - .5) * 8 }); }} onPointerLeave={() => setTicketTilt({ x: 0, y: 0 })}>
            <div className="tk-main"><div className="tk-top"><b>{destination.airline}</b><span>{issued ? issued.ref : 'LIVE PREVIEW'}</span></div><FlightRoute destination={destination} progress={issued ? 1 : routeAnimation.progress} animate={!issued && routeAnimation.key > 0} animationKey={routeAnimation.key} /><div className="meta"><div><small>PENUMPANG</small><strong>{issued?.passenger || name.toUpperCase() || '—'}</strong></div><div><small>PASPOR</small><strong>{issued?.passport || passport || '—'}</strong></div><div><small>KURSI</small><strong>{issued?.seat || seat || '—'}</strong></div><div><small>GATE</small><strong>{destination.gate}</strong></div><div><small>WAKTU</small><strong>{destination.time} WIB</strong></div><div><small>KELAS</small><strong>{seat && Number(seat.slice(0, -1)) <= 2 ? 'Eksekutif' : 'Ekonomi'}</strong></div></div></div>
            <div className="tk-stub"><small>BOARDING PASS</small><strong className="seatbig">{issued?.seat || seat || '—'}</strong><Barcode value={issued ? `P<IDN${issued.passport}<<KNO${destination.code}2026` : 'KNO-PREVIEW'} /></div>
            {issued && <span className="stamp">CHECKED<br /><small>VERIFIED</small></span>}
          </div>
          <p className="hint">{issued ? 'Tiket sudah terbit. Interaksikan paspor di bawah.' : 'Arahkan kursor ke tiket untuk efek 3D.'}</p>
          {issued && <div className="pp show"><button className={`book ${bookOpen ? 'open' : ''} ${scanning ? 'scanning' : ''}`} type="button" onClick={() => setBookOpen((value) => !value)} aria-pressed={bookOpen} aria-label="Buka atau tutup paspor"><span className="page"><span className="ph">🧑‍✈️</span><small>Nama</small><strong>{issued.passenger}</strong><small>No. paspor</small><strong>{issued.passport}</strong><small>Tujuan</small><strong>{destination.flag} {destination.city} ({destination.code})</strong><span className="mrz">P&lt;IDN{issued.passport}&lt;&lt;KNO{destination.code}2026</span></span><span className="cover"><span className="em">✦</span><b>REPUBLIK INDONESIA</b><span>Paspor</span><Barcode value={issued.ref + issued.passport} mini /><small>Pindai untuk verifikasi · {issued.ref}</small></span></button><p className="hint">{bookOpen ? 'Ketuk lagi untuk menutup paspor.' : 'Ketuk paspor untuk membukanya.'}</p><div className="acts"><button className="btn ghost" type="button" onClick={scan} disabled={scanning}>{scanning ? 'Memindai...' : 'Pindai paspor'}</button><button className="btn ghost" type="button" onClick={() => setScanResult('✦ Cap KNO berhasil ditambahkan pada paspor')}>Cap paspor</button></div><div className={`scanres ${scanResult ? 'ok' : ''}`} role="status">{scanResult}</div></div>}
        </section>
      </div>
    </div>
  </div>;
}

function Field({ label, value, placeholder, onChange, valid, error, type = 'text' }) {
  return <label className={`fld ${valid ? 'ok' : ''} ${error ? 'bad' : ''}`}><span>{label} {valid && <em>✓ sesuai</em>}</span><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /><div className="msg">{error}</div></label>;
}

createRoot(document.getElementById('root')).render(<App />);
