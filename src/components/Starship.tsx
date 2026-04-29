import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import { UserData } from './OnboardingForm';
import { calculateAge } from '@/lib/utils';
import { PLANETS, PlanetConfig } from '@/lib/planets';
import * as THREE from 'three';

interface Props {
  active: boolean;
  userData: UserData | null;
  onAltitudeChange: (altitude: number) => void;
  onPlanetChange: (planet: string) => void;
}

type TravelState = 'landed' | 'ascending' | 'orbiting' | 'warping' | 'descending';

export default function Starship({ active, userData, onAltitudeChange, onPlanetChange }: Props) {
  const shipRef = useRef<THREE.Group>(null);
  const [travelState, setTravelState] = useState<TravelState>('landed');
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
      setTravelState('ascending');
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
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(10px)',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <div>
              <h2 style={{ fontSize: '2.5rem', color: '#60a5fa', marginBottom: '16px', borderBottom: '1px solid #3b82f6', paddingBottom: '16px' }}>
                {travelState === 'orbiting' || travelState === 'warping' ? 'Navigation System' : `${planet.name} Surface`}
              </h2>
              
              {travelState === 'orbiting' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '32px' }}>
                  {Object.values(PLANETS).map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => handleNavigate(p.id)}
                      disabled={p.id === currentPlanetId}
                      style={{
                        background: p.id === currentPlanetId ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        border: `2px solid ${p.id === currentPlanetId ? '#3b82f6' : 'transparent'}`,
                        padding: '24px',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: p.id === currentPlanetId ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        pointerEvents: 'auto',
                        opacity: p.id === currentPlanetId ? 0.5 : 1
                      }}
                      onMouseOver={(e) => { if(p.id !== currentPlanetId) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)' }}
                      onMouseOut={(e) => { if(p.id !== currentPlanetId) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '1.5rem' }}>
                  <div>
                    <p style={{ color: '#9ca3af', marginBottom: '8px' }}>BIOMETRICS</p>
                    <p><strong>Age:</strong> {calculateAge(userData.birthdate, planet.yearLengthMultiplier)} {planet.name} Years</p>
                    <p><strong>Height:</strong> {userData.height} {userData.unit === 'metric' ? 'cm' : 'inches'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', marginBottom: '8px' }}>ENVIRONMENT</p>
                    <p><strong>Gravity:</strong> {travelState === 'warping' ? 'Microgravity' : `${planet.gravityMultiplier} G`}</p>
                    <p style={{ color: travelState === 'warping' ? '#4ade80' : 'white' }}>
                      <strong>Weight:</strong> {currentWeight} {userData.unit === 'metric' ? 'kg' : 'lbs'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '2rem', color: '#f87171' }}>
                ALT: {Math.floor(altitude * 1000)} M
              </div>
              
              {travelState === 'landed' && (
                <button 
                  onClick={handleLaunch}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '24px 48px',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
                    transition: 'all 0.2s',
                    pointerEvents: 'auto'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  INITIATE LAUNCH
                </button>
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
