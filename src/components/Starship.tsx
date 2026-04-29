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

  return (
    <group ref={shipRef} position={[0, 0, 0]}>
      {/* Make the camera a child of the ship so it moves with it. 
          Position it higher (y=0.5) to act as the pilot's head, giving a better view of the station. */}
      <PerspectiveCamera makeDefault position={[0, 0.5, 0]} fov={60} />
      
      {/* The Touchscreen Dashboard */}
      {active && userData && (
        <group position={[0, 0.2, -1.3]} rotation={[-Math.PI / 12, 0, 0]}>
          {/* Dashboard Physical Frame */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[2.2, 1.4, 0.1]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* HTML Touchscreen */}
          <Html 
            transform 
            position={[0, 0, 0.01]} 
            distanceFactor={1.5}
            zIndexRange={[100, 0]}
            style={{
              width: '800px',
              height: '500px',
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
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', fontSize: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <p style={{ color: '#9ca3af', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', fontSize: '1.2rem', letterSpacing: '1px' }}>BIOMETRICS</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px' }}><User color="#60a5fa" size={28} /></div>
                      <span><strong>Age:</strong> {calculateAge(userData.birthdate, planet.yearLengthMultiplier)} <span style={{fontSize: '1.2rem', color: '#9ca3af'}}>{planet.name} Yrs</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px' }}><Ruler color="#60a5fa" size={28} /></div>
                      <span><strong>Height:</strong> {userData.height} <span style={{fontSize: '1.2rem', color: '#9ca3af'}}>{userData.unit === 'metric' ? 'cm' : 'in'}</span></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <p style={{ color: '#9ca3af', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', fontSize: '1.2rem', letterSpacing: '1px' }}>ENVIRONMENT</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '12px', background: 'rgba(74, 222, 128, 0.2)', borderRadius: '12px' }}><Activity color="#4ade80" size={28} /></div>
                      <span><strong>Gravity:</strong> {travelState === 'warping' ? 'Microgravity' : `${planet.gravityMultiplier} G`}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '12px', background: travelState === 'warping' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(59, 130, 246, 0.2)', borderRadius: '12px' }}>
                        <Weight color={travelState === 'warping' ? '#4ade80' : '#60a5fa'} size={28} />
                      </div>
                      <span style={{ color: travelState === 'warping' ? '#4ade80' : 'white' }}>
                        <strong>Weight:</strong> {currentWeight} <span style={{fontSize: '1.2rem', color: '#9ca3af'}}>{userData.unit === 'metric' ? 'kg' : 'lbs'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '2rem', color: travelState === 'pre-launch' ? '#ef4444' : '#f87171', background: 'rgba(0,0,0,0.5)', padding: '12px 24px', borderRadius: '8px' }}>
                <Rocket /> ALT: {Math.floor(altitude * 1000)} M
              </div>
              
              {travelState === 'landed' && (
                <button 
                  onClick={handleLaunch}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                    color: 'white',
                    border: '1px solid #f87171',
                    padding: '20px 48px',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.2s',
                    pointerEvents: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.8)' }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.4)' }}
                >
                  <AlertTriangle /> INITIATE LAUNCH
                </button>
              )}
              {travelState === 'pre-launch' && (
                <div style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 20px #ef4444', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <AlertTriangle size={48} /> ENGINE IGNITION... T-MINUS {countdown}
                </div>
              )}
              {travelState === 'ascending' && (
                <div style={{ color: '#4ade80', fontSize: '2rem', fontWeight: 'bold', textShadow: '0 0 10px #4ade80' }}>
                  ASCENDING...
                </div>
              )}
              {travelState === 'descending' && (
                <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', textShadow: '0 0 10px #f59e0b' }}>
                  DESCENDING...
                </div>
              )}
              {travelState === 'warping' && (
                <div style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', textShadow: '0 0 10px #8b5cf6' }}>
                  WARP DRIVE ACTIVE
                </div>
              )}
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
