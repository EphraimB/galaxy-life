import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import { UserData } from './OnboardingForm';
import { calculateAge } from '@/lib/utils';
import { PLANETS, PlanetConfig } from '@/lib/planets';
import { User, Ruler, Weight, Rocket, Activity, Navigation, AlertTriangle, MapPin, ChevronRight } from 'lucide-react';
import * as THREE from 'three';

interface Props {
  active: boolean;
  userData: UserData | null;
  onAltitudeChange: (altitude: number) => void;
  onPlanetChange: (planet: string) => void;
}

type TravelState = 'landed' | 'pre-launch' | 'ascending' | 'orbiting' | 'warping' | 'descending';

export default function Starship({ active, userData, onAltitudeChange, onPlanetChange }: Props) {
  const shipRef = useRef<THREE.Group>(null);
  const [travelState, setTravelState] = useState<TravelState>('landed');
  const [countdown, setCountdown] = useState(3);
  const [altitude, setAltitude] = useState(0);
  const [currentPlanetId, setCurrentPlanetId] = useState('earth');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const planet = PLANETS[currentPlanetId];
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (travelState === 'pre-launch') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setTravelState('ascending');
      }
    } else {
      setCountdown(3);
    }
    return () => clearTimeout(timer);
  }, [travelState, countdown]);

  // Animation logic
  useFrame((state, delta) => {
    if (!shipRef.current) return;

    let currentAltitude = altitude;

    // ASCENDING
    if (travelState === 'ascending' && currentAltitude < 1000) {
      currentAltitude += delta * 150; 
      if (currentAltitude >= 1000) {
        currentAltitude = 1000;
        setTravelState('orbiting');
      }
      setAltitude(currentAltitude);
      shipRef.current.position.y = currentAltitude;
      onAltitudeChange(currentAltitude);
    }

    // DESCENDING
    if (travelState === 'descending' && currentAltitude > 0) {
      currentAltitude -= delta * 150;
      if (currentAltitude <= 0) {
        currentAltitude = 0;
        setTravelState('landed');
      }
      setAltitude(currentAltitude);
      shipRef.current.position.y = currentAltitude;
      onAltitudeChange(currentAltitude);
    }

    // Add a slight hover effect when on the ground
    if (travelState === 'landed' && active) {
      shipRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }

    // Subtle ship shake during launch or warp
    if (travelState === 'ascending' || travelState === 'descending' || travelState === 'warping') {
      const shakeIntensity = travelState === 'warping' ? 0.2 : 0.05;
      shipRef.current.position.x = (Math.random() - 0.5) * shakeIntensity;
      shipRef.current.position.z = (Math.random() - 0.5) * shakeIntensity;
    } else if (travelState === 'pre-launch') {
      // Violent shake right before launch
      const shakeIntensity = 0.02 * (4 - countdown);
      shipRef.current.position.x = (Math.random() - 0.5) * shakeIntensity;
      shipRef.current.position.z = (Math.random() - 0.5) * shakeIntensity;
    } else if (travelState === 'orbiting') {
      // Stabilize in orbit
      shipRef.current.position.x = 0;
      shipRef.current.position.z = 0;
    }

    // Parallax effect: let the user look around the cockpit slightly using the global mouse
    if (active) {
      const { camera } = state;
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mouse.current.x * 0.3, 0.05);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, mouse.current.y * 0.3, 0.05);
    }
  });

  const handleLaunch = () => {
    if (travelState === 'landed' && active) {
      setTravelState('pre-launch');
    }
  };

  const handleNavigate = () => {
    if (travelState === 'orbiting' && selectedDestination) {
      setTravelState('warping');
      
      // Simulate warp delay
      setTimeout(() => {
        setCurrentPlanetId(selectedDestination);
        onPlanetChange(selectedDestination);
        setTravelState('descending');
        setSelectedDestination(null);
      }, 2000);
    }
  };

  const currentWeight = travelState === 'orbiting' || travelState === 'warping' 
    ? 0 
    : (userData?.weight! * planet.gravityMultiplier).toFixed(1);

  const CircularGauge = ({ label, value, max, unit, color }: any) => {
    const percentage = Math.min(value / max, 1);
    const strokeDasharray = `${percentage * 100}, 100`;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
          <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="3" strokeDasharray={strokeDasharray} style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', textShadow: `0 0 10px ${color}` }}>{value}</span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '-4px' }}>{unit}</span>
          </div>
        </div>
        <span style={{ color: '#9ca3af', fontSize: '0.9rem', letterSpacing: '1px' }}>{label}</span>
      </div>
    );
  };

  return (
    <group ref={shipRef} position={[0, 0, 0]}>
      {/* Make the camera a child of the ship so it moves with it. 
          Position it higher (y=0.5) to act as the pilot's head, giving a better view of the station. */}
      <PerspectiveCamera makeDefault position={[0, 0.5, 0]} fov={60} />
      
      {/* Full-Screen Launch Cinematic */}
      {travelState === 'pre-launch' && (
        <Html wrapperClass="launch-overlay" zIndexRange={[999999, 0]}>
          <style>{`
            .launch-overlay {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              transform: none !important;
              pointer-events: none !important;
            }
            @keyframes alarmPulse {
              0% { box-shadow: inset 0 0 50px rgba(239, 68, 68, 0.3); border: 10px solid rgba(239, 68, 68, 0.3); }
              50% { box-shadow: inset 0 0 250px rgba(239, 68, 68, 0.9); border: 10px solid rgba(239, 68, 68, 0.9); }
              100% { box-shadow: inset 0 0 50px rgba(239, 68, 68, 0.3); border: 10px solid rgba(239, 68, 68, 0.3); }
            }
          `}</style>
          <div style={{
            width: '100%', height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'alarmPulse 1s infinite',
          }}>
            <h1 style={{
              fontSize: '15vw',
              color: 'white',
              fontFamily: 'var(--font-outfit), sans-serif',
              fontWeight: 'bold',
              textShadow: '0 0 50px rgba(239, 68, 68, 1), 0 0 100px rgba(239, 68, 68, 1)',
              margin: 0,
              padding: 0,
              letterSpacing: '-2px'
            }}>
              T-{countdown}
            </h1>
          </div>
        </Html>
      )}

      {/* The Touchscreen Dashboard */}
      {active && userData && (
        <group position={[0, 0.1, -1.8]} rotation={[-Math.PI / 12, 0, 0]}>
          {/* Dashboard Physical Frame */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[1.8, 1.1, 0.1]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* HTML Touchscreen */}
          <Html 
            transform 
            position={[0, 0, 0.01]} 
            distanceFactor={0.7}
            zIndexRange={[100, 0]}
            style={{
              width: '900px',
              height: '560px',
              boxSizing: 'border-box',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.6) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '32px',
              color: 'white',
              fontFamily: 'var(--font-outfit), sans-serif',
              boxShadow: travelState === 'pre-launch' 
                ? '0 0 40px rgba(239, 68, 68, 0.8) inset, 0 8px 32px rgba(0, 0, 0, 0.5)' 
                : '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2rem', color: travelState === 'pre-launch' ? '#ef4444' : '#ffffff', marginBottom: '16px', borderBottom: `1px solid ${travelState === 'pre-launch' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`, paddingBottom: '16px', transition: 'all 0.2s', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                {travelState === 'orbiting' || travelState === 'warping' ? <><Navigation size={28} color="#60a5fa" /> Solar Navigation System</> : <><Activity size={28} color="#60a5fa" /> {planet.name} Surface</>}
              </h2>
              
              {travelState === 'orbiting' ? (
                <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
                  {/* Solar System Mini-Map */}
                  <div style={{ flex: 2, position: 'relative', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {/* The Sun */}
                    <div style={{ position: 'absolute', width: '40px', height: '40px', background: 'radial-gradient(circle, #fef08a, #f59e0b)', borderRadius: '50%', boxShadow: '0 0 40px #f59e0b', zIndex: 10 }} />
                    
                    {/* Earth Orbit Ring */}
                    <div style={{ position: 'absolute', width: '160px', height: '160px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%' }} />
                    {/* Mars Orbit Ring */}
                    <div style={{ position: 'absolute', width: '280px', height: '280px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%' }} />

                    {/* Earth */}
                    <div 
                      onClick={() => setSelectedDestination('earth')}
                      style={{ position: 'absolute', top: 'calc(50% - 80px)', left: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 20 }}
                    >
                      {/* Moon Orbit Ring (relative to Earth) */}
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '50px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%' }} />
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #4ade80, #1e3a8a)', boxShadow: selectedDestination === 'earth' ? '0 0 15px #60a5fa' : 'none', border: selectedDestination === 'earth' ? '2px solid #fff' : 'none' }} />
                      {currentPlanetId === 'earth' && <MapPin size={20} color="#ef4444" style={{ position: 'absolute', top: '-24px', left: '2px', filter: 'drop-shadow(0 0 5px #ef4444)' }} />}
                    </div>

                    {/* Moon */}
                    <div 
                      onClick={() => setSelectedDestination('moon')}
                      style={{ position: 'absolute', top: 'calc(50% - 80px - 25px)', left: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 20 }}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #e5e7eb, #4b5563)', boxShadow: selectedDestination === 'moon' ? '0 0 10px #e5e7eb' : 'none', border: selectedDestination === 'moon' ? '2px solid #fff' : 'none' }} />
                      {currentPlanetId === 'moon' && <MapPin size={16} color="#ef4444" style={{ position: 'absolute', top: '-20px', left: '-2px', filter: 'drop-shadow(0 0 5px #ef4444)' }} />}
                    </div>

                    {/* Mars */}
                    <div 
                      onClick={() => setSelectedDestination('mars')}
                      style={{ position: 'absolute', top: 'calc(50% + 99px)', left: 'calc(50% + 99px)', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 20 }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #fb923c, #991b1b)', boxShadow: selectedDestination === 'mars' ? '0 0 15px #fb923c' : 'none', border: selectedDestination === 'mars' ? '2px solid #fff' : 'none' }} />
                      {currentPlanetId === 'mars' && <MapPin size={20} color="#ef4444" style={{ position: 'absolute', top: '-24px', left: '0px', filter: 'drop-shadow(0 0 5px #ef4444)' }} />}
                    </div>

                  </div>

                  {/* Destination Info Panel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Destination</p>
                    {selectedDestination ? (
                      <>
                        <h3 style={{ fontSize: '2.5rem', margin: 0, color: 'white', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{PLANETS[selectedDestination].name}</h3>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.2rem' }}>
                          <p style={{ margin: 0 }}><strong>Gravity:</strong> {PLANETS[selectedDestination].gravityMultiplier} G</p>
                          <p style={{ margin: 0 }}><strong>Year Length:</strong> {PLANETS[selectedDestination].yearLengthMultiplier === 1.0 && selectedDestination !== 'earth' ? 'N/A' : `${PLANETS[selectedDestination].yearLengthMultiplier} Earth Yrs`}</p>
                        </div>
                        {selectedDestination === currentPlanetId ? (
                          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
                            CURRENT LOCATION
                          </div>
                        ) : (
                          <button 
                            onClick={handleNavigate}
                            style={{ padding: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          >
                            WARP <ChevronRight size={20} />
                          </button>
                        )}
                      </>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '1.2rem', textAlign: 'center' }}>
                        Select a planet from the orbital map
                      </div>
                    )}

                    {/* Compact Biometrics in orbit */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#60a5fa" />
                        <span style={{ color: '#9ca3af' }}>Age</span>
                        <span style={{ color: '#c4b5fd', fontWeight: 'bold', marginLeft: 'auto', fontStyle: 'italic' }}>Ageless ∞</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Ruler size={14} color="#60a5fa" />
                        <span style={{ color: '#9ca3af' }}>Height</span>
                        <span style={{ color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}>{userData.height} {userData.unit === 'metric' ? 'cm' : 'in'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Weight size={14} color="#4ade80" />
                        <span style={{ color: '#9ca3af' }}>Weight</span>
                        <span style={{ color: '#4ade80', fontWeight: 'bold', marginLeft: 'auto' }}>0G</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={14} color="#4ade80" />
                        <span style={{ color: '#9ca3af' }}>Gravity</span>
                        <span style={{ color: '#4ade80', fontWeight: 'bold', marginLeft: 'auto' }}>Micro</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', gap: '32px', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  {/* Left Column: Visual Infographic */}
                  <div style={{ flex: 1.5, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '24px' }}>
                    
                    {/* Ground / Floor */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: '24px', height: '3px', background: `linear-gradient(90deg, transparent 0%, ${planet.padColor}66 50%, transparent 100%)` }} />

                    {/* Gravity Arrows — more arrows = stronger gravity */}
                    {Array.from({ length: Math.max(1, Math.round(planet.gravityMultiplier * 3)) }).map((_, i) => (
                      <div key={i} style={{
                        position: 'absolute',
                        left: `${20 + i * 28}px`,
                        bottom: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        opacity: 0.3 + (i * 0.15),
                      }}>
                        <div style={{ width: '2px', height: `${16 + i * 4}px`, background: '#f59e0b' }} />
                        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '8px solid #f59e0b' }} />
                      </div>
                    ))}
                    <div style={{ position: 'absolute', left: '12px', bottom: `${38 + Math.round(planet.gravityMultiplier * 3) * 4}px`, color: '#f59e0b', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 'bold' }}>
                      {planet.gravityMultiplier}G
                    </div>

                    {/* Person Avatar — floats higher in low gravity */}
                    <div style={{
                      position: 'relative',
                      bottom: `${Math.max(3, (1 - planet.gravityMultiplier) * 40)}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'bottom 1s ease',
                    }}>
                      {/* Age Badge */}
                      <div style={{
                        background: 'rgba(139, 92, 246, 0.25)',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        borderRadius: '20px',
                        padding: '3px 14px',
                        marginBottom: '8px',
                        fontSize: '0.9rem',
                        color: '#c4b5fd',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}>
                        {calculateAge(userData.birthdate, planet.yearLengthMultiplier)} {planet.name} yrs
                      </div>
                      
                      {/* Head */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: '2px solid rgba(255,255,255,0.3)' }} />
                      {/* Body */}
                      <div style={{ width: '28px', height: '50px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '6px 6px 4px 4px', marginTop: '-2px' }} />
                      {/* Legs */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '-1px' }}>
                        <div style={{ width: '10px', height: '40px', background: 'linear-gradient(180deg, #1e3a5f, #0f172a)', borderRadius: '3px' }} />
                        <div style={{ width: '10px', height: '40px', background: 'linear-gradient(180deg, #1e3a5f, #0f172a)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    {/* Height Ruler — right side of person */}
                    <div style={{
                      position: 'absolute',
                      right: '50px',
                      bottom: '3px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <div style={{ position: 'relative', width: '16px', height: '150px', borderLeft: '2px solid #60a5fa', borderTop: '2px solid #60a5fa', borderBottom: '2px solid #60a5fa' }}>
                        {/* Ruler ticks */}
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} style={{ position: 'absolute', top: `${i * 25}%`, left: 0, width: '8px', height: '1px', background: '#60a5fa' }} />
                        ))}
                      </div>
                      <div style={{ position: 'absolute', right: '-4px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {userData.height} {userData.unit === 'metric' ? 'cm' : 'in'}
                      </div>
                    </div>

                    {/* Weight Scale — under the person */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <div style={{
                        width: '60px',
                        height: '8px',
                        background: 'linear-gradient(90deg, #334155, #475569)',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }} />
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '4px' }}>
                        {currentWeight} {userData.unit === 'metric' ? 'kg' : 'lbs'}
                      </span>
                    </div>

                  </div>

                  {/* Right Column: Vertical Flight Map */}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', padding: '12px 24px' }}>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '1.2rem', letterSpacing: '1px', textAlign: 'center', marginBottom: '16px' }}>FLIGHT TRAJECTORY</p>
                    
                    <div style={{ flex: 1, position: 'relative', borderLeft: '2px dashed rgba(255,255,255,0.2)', marginLeft: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      
                      {/* Orbit Target Node */}
                      <div 
                        onClick={handleLaunch} 
                        style={{ cursor: travelState === 'landed' ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '-11px', position: 'relative', zIndex: 10 }}
                        onMouseOver={(e) => { if (travelState === 'landed') e.currentTarget.style.transform = 'scale(1.05)' }}
                        onMouseOut={(e) => { if (travelState === 'landed') e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: travelState === 'landed' ? '#3b82f6' : 'rgba(255,255,255,0.2)', boxShadow: travelState === 'landed' ? '0 0 15px #3b82f6' : 'none', border: travelState === 'landed' ? '2px solid white' : 'none', transition: 'all 0.2s' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: travelState === 'landed' ? '#3b82f6' : '#9ca3af', textShadow: travelState === 'landed' ? '0 0 10px #3b82f6' : 'none' }}>
                          {travelState === 'landed' ? 'CLICK TO LAUNCH' : 'LOW ORBIT'}
                        </span>
                      </div>

                      {/* Rocket Icon */}
                      <div style={{ position: 'absolute', left: '-19px', bottom: `${Math.max(0, (altitude / 1000) * 100)}%`, transition: 'bottom 0.1s linear', zIndex: 20 }}>
                        <div style={{ background: travelState === 'pre-launch' ? '#ef4444' : '#4ade80', padding: '8px', borderRadius: '50%', boxShadow: travelState === 'pre-launch' ? '0 0 20px #ef4444' : '0 0 20px #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Rocket color="white" size={20} style={{ transform: 'rotate(-45deg)' }} />
                        </div>
                      </div>

                      {/* Surface Node */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '-11px', position: 'relative', zIndex: 10 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: planet.padColor, boxShadow: `0 0 15px ${planet.padColor}`, border: '2px solid white' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: planet.padColor, textShadow: `0 0 10px ${planet.padColor}` }}>{planet.name.toUpperCase()}</span>
                      </div>
                      
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Status Bar — in normal document flow, no overlap */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '16px',
              padding: '12px 20px',
              background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
            }}>
              {/* Current Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: planet.padColor, boxShadow: `0 0 8px ${planet.padColor}` }} />
                <span style={{ color: '#9ca3af', fontSize: '0.9rem', letterSpacing: '1px' }}>{planet.name.toUpperCase()}</span>
              </div>

              {/* Flight Status */}
              <div style={{
                padding: '4px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                letterSpacing: '2px',
                fontWeight: 'bold',
                background: travelState === 'landed' ? 'rgba(74, 222, 128, 0.15)' 
                  : travelState === 'ascending' ? 'rgba(74, 222, 128, 0.2)' 
                  : travelState === 'descending' ? 'rgba(245, 158, 11, 0.2)' 
                  : travelState === 'warping' ? 'rgba(139, 92, 246, 0.2)'
                  : travelState === 'orbiting' ? 'rgba(56, 189, 248, 0.15)'
                  : 'rgba(239, 68, 68, 0.2)',
                color: travelState === 'landed' ? '#4ade80' 
                  : travelState === 'ascending' ? '#4ade80' 
                  : travelState === 'descending' ? '#f59e0b' 
                  : travelState === 'warping' ? '#8b5cf6'
                  : travelState === 'orbiting' ? '#38bdf8'
                  : '#ef4444',
                border: `1px solid ${travelState === 'landed' ? 'rgba(74, 222, 128, 0.3)' 
                  : travelState === 'ascending' ? 'rgba(74, 222, 128, 0.4)' 
                  : travelState === 'descending' ? 'rgba(245, 158, 11, 0.4)' 
                  : travelState === 'warping' ? 'rgba(139, 92, 246, 0.4)'
                  : travelState === 'orbiting' ? 'rgba(56, 189, 248, 0.3)'
                  : 'rgba(239, 68, 68, 0.4)'}`,
              }}>
                {travelState === 'landed' ? '● DOCKED' 
                  : travelState === 'ascending' ? '▲ ASCENDING' 
                  : travelState === 'descending' ? '▼ DESCENDING' 
                  : travelState === 'warping' ? '◆ WARP ACTIVE'
                  : travelState === 'orbiting' ? '○ IN ORBIT'
                  : '⚠ IGNITION'}
              </div>

              {/* Altimeter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#7dd3fc', fontSize: '0.8rem', letterSpacing: '1px' }}>ALT</span>
                <span style={{ fontFamily: 'monospace', fontSize: '1.3rem', color: '#e0f2fe', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
                  {String(Math.floor(altitude * 1000)).padStart(5, '0')}
                </span>
                <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold' }}>M</span>
              </div>
            </div>
          </Html>
        </group>
      )}

      {/* Glass Canopy (More spacious) */}
      {active && (
        <mesh position={[0, 0.5, -0.5]}>
          <sphereGeometry args={[3, 32, 32, 0, Math.PI, 0, Math.PI / 2]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.05} 
            roughness={0} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
