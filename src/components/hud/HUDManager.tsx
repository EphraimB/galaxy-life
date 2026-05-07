import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { HandState } from '@/hooks/useHandTracker';
import { useGestureEngine } from '@/hooks/useGestureEngine';
import { usePostureAwareness } from '@/hooks/usePostureAwareness';
import HUDMirror from './HUDMirror';
import { User, Globe, FileText, Settings, Rocket, Orbit, ArrowDownToLine, Activity, Target, Book, BrainCircuit, ChevronRight } from 'lucide-react';
import styles from './hud.module.css';
import { WORLDS } from '@/lib/worlds';
import { UserData } from '../OnboardingForm';
import { FlightState } from '../GraphicalEnvironment';

interface HUD3DProps {
  handState: HandState;
  facePos?: { x: number; y: number };
  isFaceTracking: boolean;
  userData: UserData;
  currentPlanetId: string;
  flightState: FlightState;
  onLaunch: () => void;
  onDescend: () => void;
  onWarp: (planetId: string) => void;
}

export function HUDManager3D({ handState, facePos, isFaceTracking, userData, currentPlanetId, flightState, onLaunch, onDescend, onWarp }: HUD3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const gesture = useGestureEngine(handState);
  const posture = usePostureAwareness({ facePos, isTracking: isFaceTracking });

  useFrame(() => {
    if (!groupRef.current) return;
    const targetRotX = posture === 'standing' ? -Math.PI / 16 : 0;
    const targetPosY = posture === 'standing' ? 0.2 : 0;
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05);
  });

  const activeWorld = WORLDS[currentPlanetId] || WORLDS.earth;
  const gravity = activeWorld.gravity;
  const adjustedWeight = (userData.weight * gravity).toFixed(1);
  const weightUnit = userData.unit === 'metric' ? 'KG' : 'LBS';
  
  const planets = ['earth', 'moon', 'mars'];
  const handleWarp = () => {
    const currentIndex = planets.indexOf(currentPlanetId);
    const nextIndex = (currentIndex + 1) % planets.length;
    onWarp(planets[nextIndex]);
  };

  const panelStyle = {
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff'
  };

  return (
    <group ref={groupRef}>
        {/* Left Side: Ship Stats */}
        <Html transform position={[-2.4, 1.4, -1.8]} rotation={[0, Math.PI / 6, 0]} scale={0.12}>
          <div style={{ ...panelStyle, width: '280px', pointerEvents: 'none' }}>
            <div style={{ marginTop: '0px', paddingTop: '10px' }}>
              <div className={styles.subtitle} style={{ color: '#fff' }}>S.S. HORIZON</div>
              <div className={styles.subtitle}>CLASS: EXPLORER</div>
              <div className={styles.subtitle}>CREW: 1</div>
            </div>
          </div>
        </Html>

        {/* Center: Planetary Data */}
        <Html transform position={[0, 1.7, -2.0]} rotation={[0, 0, 0]} scale={0.14}>
          <div style={{ width: '400px', background: 'transparent', pointerEvents: 'none', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '2px', color: '#fff', textTransform: 'uppercase', textShadow: '0 0 20px rgba(56,189,248,0.8)' }}>
              {activeWorld.name}
            </h1>
            <div className={styles.subtitle} style={{ marginBottom: '20px', color: '#38bdf8' }}>
              {flightState.toUpperCase()}
            </div>
            
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', marginBottom: '30px' }}>
              Currently in orbit or landed on {activeWorld.name}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}><Target size={14} /> YOUR WEIGHT HERE</div>
                <div className={styles.dataValue}>{adjustedWeight} {weightUnit}</div>
              </div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}><Activity size={14} /> GRAVITY</div>
                <div className={styles.dataValue}>{gravity} G</div>
              </div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}><Orbit size={14} /> STATUS</div>
                <div className={styles.dataValue}>{flightState.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </Html>

        {/* Right Side: Actions and Mirror */}
        <Html transform position={[2.4, 1.4, -1.8]} rotation={[0, -Math.PI / 6, 0]} scale={0.12}>
          <div style={{ display: 'flex', gap: '20px', height: '480px' }}>
            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '120px' }}>
              {flightState === 'landed' && (
                <div className={styles.actionButton} onClick={onLaunch} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                  <Rocket className={styles.actionIcon} size={28} />
                  <div className={styles.actionText}>LAUNCH</div>
                </div>
              )}
              {flightState === 'orbiting' && (
                <>
                  <div className={styles.actionButton} onClick={handleWarp} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                    <Orbit className={styles.actionIcon} size={28} />
                    <div className={styles.actionText}>WARP</div>
                  </div>
                  <div className={styles.actionButton} onClick={onDescend} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                    <ArrowDownToLine className={styles.actionIcon} size={28} />
                    <div className={styles.actionText}>DESCEND</div>
                  </div>
                </>
              )}
              {(flightState === 'launching' || flightState === 'descending') && (
                <div className={styles.actionButton} style={{ opacity: 0.5 }}>
                  <Rocket className={styles.actionIcon} size={28} />
                  <div className={styles.actionText}>STAND BY</div>
                </div>
              )}
            </div>

            {/* Mirror Stats */}
            <div style={{ ...panelStyle, width: '280px', height: '100%', display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }} className={styles.subtitle}>MIRROR</div>
              <div style={{ flexGrow: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'transparent' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                <User size={24} color="#94a3b8" />
                <div>
                  <div className={styles.subtitle}>CURRENT STATE</div>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                    {flightState === 'landed' ? 'SURFACE G-FORCE' : flightState === 'orbiting' ? 'ORBIT - WEIGHTLESS' : 'TRANSIT'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Html>

        {/* Bottom Bar: System Navigation */}
        <Html transform position={[0, 0.7, -1.7]} rotation={[-Math.PI / 4, 0, 0]} scale={0.12}>
          <div style={{ ...panelStyle, display: 'flex', gap: '40px', padding: '12px 40px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#38bdf8', borderRadius: '50%', padding: '8px' }}>
                <Target size={16} color="#0f172a" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>EXPERIENCE</div>
                <div className={styles.subtitle}>How it feels</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={20} color="#94a3b8" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>BIOMETRICS</div>
                <div className={styles.subtitle}>Body response</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Book size={20} color="#94a3b8" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>PLANET DATA</div>
                <div className={styles.subtitle}>Stats & environment</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrainCircuit size={20} color="#94a3b8" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>AI DESCRIPTION</div>
                <div className={styles.subtitle}>Analysis & insights</div>
              </div>
            </div>
          </div>
        </Html>

        {/* Original 3D Mirror placed inside the Right Panel's empty box */}
        <group position={[2.42, 1.45, -1.82]} rotation={[0, -Math.PI / 6, 0]}>
          <group position={[0, 0, 0.1]} scale={1.2}>
            <HUDMirror facePos={facePos} handState={handState} />
          </group>
        </group>
    </group>
  );
}
