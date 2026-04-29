import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import { UserData } from './OnboardingForm';
import { calculateAge } from '@/lib/utils';
import { PLANETS, PlanetConfig } from '@/lib/planets';
import { User, Ruler, Weight, Rocket, Activity, Navigation, AlertTriangle } from 'lucide-react';
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

  const handleNavigate = (planetId: string) => {
    if (travelState === 'orbiting') {
      setTravelState('warping');
      
      // Simulate warp delay
      setTimeout(() => {
        setCurrentPlanetId(planetId);
        onPlanetChange(planetId);
        setTravelState('descending');
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
              background: 'rgba(0, 5, 20, 0.8)',
              border: '2px solid #3b82f6',
              borderRadius: '16px',
              padding: '32px',
              color: 'white',
              fontFamily: 'var(--font-outfit), sans-serif',
              boxShadow: travelState === 'pre-launch' ? '0 0 40px rgba(239, 68, 68, 0.8) inset' : '0 0 20px rgba(59, 130, 246, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(10px)',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.5rem', color: travelState === 'pre-launch' ? '#ef4444' : '#60a5fa', marginBottom: '16px', borderBottom: `1px solid ${travelState === 'pre-launch' ? '#ef4444' : '#3b82f6'}`, paddingBottom: '16px', transition: 'all 0.2s' }}>
                {travelState === 'orbiting' || travelState === 'warping' ? <><Navigation size={36} /> Solar Navigation System</> : <><Activity size={36} /> {planet.name} Surface</>}
              </h2>
              
              {travelState === 'orbiting' ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '32px' }}>
                  {Object.values(PLANETS).map((p) => {
                    // Create CSS gradients for planets
                    const planetGradient = 
                      p.id === 'earth' ? 'radial-gradient(circle at 30% 30%, #4ade80, #1e3a8a)' :
                      p.id === 'mars' ? 'radial-gradient(circle at 30% 30%, #fb923c, #991b1b)' :
                      'radial-gradient(circle at 30% 30%, #e5e7eb, #4b5563)'; // Moon

                    return (
                      <div 
                        key={p.id}
                        onClick={() => p.id !== currentPlanetId && handleNavigate(p.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '16px',
                          cursor: p.id === currentPlanetId ? 'default' : 'pointer',
                          opacity: p.id === currentPlanetId ? 0.5 : 1,
                          pointerEvents: 'auto',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => { if(p.id !== currentPlanetId) e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseOut={(e) => { if(p.id !== currentPlanetId) e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <div style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: planetGradient,
                          boxShadow: `0 0 20px ${p.padColor}88, inset -10px -10px 20px rgba(0,0,0,0.5)`,
                          border: p.id === currentPlanetId ? '4px solid #3b82f6' : 'none'
                        }} />
                        <div style={{ textAlign: 'center' }}>
                          <h3 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>{p.name}</h3>
                          <p style={{ color: '#9ca3af', fontSize: '1.2rem', margin: '4px 0 0 0' }}>{p.gravityMultiplier} G</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', fontSize: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: '#9ca3af', margin: 0, borderBottom: '1px solid #333', paddingBottom: '8px' }}>BIOMETRICS</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User color="#60a5fa" />
                      <span><strong>Age:</strong> {calculateAge(userData.birthdate, planet.yearLengthMultiplier)} {planet.name} Yrs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Ruler color="#60a5fa" />
                      <span><strong>Height:</strong> {userData.height} {userData.unit === 'metric' ? 'cm' : 'in'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: '#9ca3af', margin: 0, borderBottom: '1px solid #333', paddingBottom: '8px' }}>ENVIRONMENT</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Activity color="#4ade80" />
                      <span><strong>Gravity:</strong> {travelState === 'warping' ? 'Microgravity' : `${planet.gravityMultiplier} G`}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Weight color={travelState === 'warping' ? '#4ade80' : '#60a5fa'} />
                      <span style={{ color: travelState === 'warping' ? '#4ade80' : 'white' }}>
                        <strong>Weight:</strong> {currentWeight} {userData.unit === 'metric' ? 'kg' : 'lbs'}
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
