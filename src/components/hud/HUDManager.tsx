import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { HandState } from '@/hooks/useHandTracker';
import { useGestureEngine } from '@/hooks/useGestureEngine';
import { usePostureAwareness } from '@/hooks/usePostureAwareness';
import HUDMirror from './HUDMirror';
import { User, Globe, FileText, Settings, Rocket, Orbit, ArrowDownToLine, Activity, Target, Book, BrainCircuit, ChevronRight } from 'lucide-react';
import styles from './hud.module.css';

interface Props {
  handState: HandState;
  facePos?: { x: number; y: number };
  isFaceTracking: boolean;
  onSelectPlanet: (worldId: string) => void;
}

export default function HUDManager({ handState, facePos, isFaceTracking, onSelectPlanet }: Props) {
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

  return (
    <group ref={groupRef}>
      {/* 3D Elements */}
      <group position={[2.8, 1.4, -1.7]} rotation={[0, -Math.PI / 8, 0]}>
        <group position={[0, 0, 0.1]} scale={1.2}>
          <HUDMirror facePos={facePos} handState={handState} />
        </group>
      </group>

      {/* Fullscreen 2D UI Overlay */}
      <Html fullscreen zIndexRange={[100, 0]}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px', boxSizing: 'border-box' }}>
          
          {/* TOP BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'auto' }}>
            {/* Left Menu */}
            <div className={styles.glassPanel} style={{ width: '280px' }}>
              <div className={`${styles.menuItem} ${styles.active}`}>
                <User className={styles.menuIcon} size={20} />
                <div className={styles.menuText}>OVERVIEW</div>
                <ChevronRight className={styles.menuChevron} size={16} />
              </div>
              <div className={styles.menuItem} onClick={() => onSelectPlanet('earth')}>
                <Globe className={styles.menuIcon} size={20} />
                <div className={styles.menuText}>PLANETS</div>
                <ChevronRight className={styles.menuChevron} size={16} />
              </div>
              <div className={styles.menuItem}>
                <FileText className={styles.menuIcon} size={20} />
                <div className={styles.menuText}>MISSIONS</div>
                <ChevronRight className={styles.menuChevron} size={16} />
              </div>
              <div className={styles.menuItem}>
                <Settings className={styles.menuIcon} size={20} />
                <div className={styles.menuText}>SHIP SYSTEMS</div>
                <ChevronRight className={styles.menuChevron} size={16} />
              </div>
              <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className={styles.subtitle} style={{ color: '#fff' }}>S.S. HORIZON</div>
                <div className={styles.subtitle}>CLASS: EXPLORER</div>
                <div className={styles.subtitle}>CREW: 1</div>
              </div>
            </div>

            {/* Center Info */}
            <div className={styles.glassPanel} style={{ width: '400px', background: 'transparent', border: 'none', boxShadow: 'none', pointerEvents: 'none' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '2px', color: '#fff' }}>AEGIS PRIME</h1>
              <div className={styles.subtitle} style={{ marginBottom: '20px' }}>TERRESTRIAL PLANET</div>
              
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', marginBottom: '30px' }}>
                A temperate world with vast oceans, diverse ecosystems, and breathable atmosphere. Conditions are ideal for human life.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div className={styles.dataRow}>
                  <div className={styles.dataLabel}><Target size={14} /> YOUR WEIGHT HERE</div>
                  <div className={styles.dataValue}>67.3 KG</div>
                </div>
                <div className={styles.dataRow}>
                  <div className={styles.dataLabel}><Activity size={14} /> GRAVITY</div>
                  <div className={styles.dataValue}>0.82 G</div>
                </div>
                <div className={styles.dataRow}>
                  <div className={styles.dataLabel}><Orbit size={14} /> MOVEMENT</div>
                  <div className={styles.dataValue}>LIGHT</div>
                </div>
              </div>

              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', marginTop: '20px' }}>
                You would feel lighter, your steps would be more effortless, and jumping would take you higher.
              </p>
            </div>

            {/* Right Side (Actions & Mirror Glass) */}
            <div style={{ display: 'flex', gap: '20px', height: '480px' }}>
              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '120px' }}>
                <div className={styles.actionButton}>
                  <Rocket className={styles.actionIcon} size={28} />
                  <div className={styles.actionText}>LAUNCH</div>
                </div>
                <div className={styles.actionButton}>
                  <Orbit className={styles.actionIcon} size={28} />
                  <div className={styles.actionText}>WARP</div>
                </div>
                <div className={styles.actionButton}>
                  <ArrowDownToLine className={styles.actionIcon} size={28} />
                  <div className={styles.actionText}>DESCEND</div>
                </div>
              </div>

              {/* Mirror Panel Frame (3D avatar renders behind this CSS) */}
              <div className={styles.glassPanel} style={{ width: '280px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }} className={styles.subtitle}>MIRROR</div>
                <div style={{ flexGrow: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'transparent' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                  <User size={24} color="#94a3b8" />
                  <div>
                    <div className={styles.subtitle}>CURRENT STATE</div>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>ORBIT - WEIGHTLESS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
            <div className={styles.glassPanel} style={{ display: 'flex', gap: '40px', padding: '12px 40px' }}>
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
          </div>

        </div>
      </Html>
    </group>
  );
}
