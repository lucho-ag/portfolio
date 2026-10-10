"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { createMasterTimeline } from "@/animation/timeline";
import { useScene } from "@/store/useScene";
import SequenceCanvas from "@/sequence/SequenceCanvas";
import Objects3D, { type SceneObjectProps } from "@/scene/Objects3D";
import ChannelSwitch from "./ChannelSwitch";
import Hud from "./Hud";
import PowerOn from "./PowerOn";
import SmoothScroll from "./SmoothScroll";

gsap.registerPlugin(useGSAP);

/**
 * Escenario pinneado con las capas (de atrás hacia adelante):
 * SequenceCanvas → Objects3D → Sections (children). CRTOverlay va en el layout.
 */
export default function Experience({ children, sceneData }: { children: ReactNode; sceneData: SceneObjectProps }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const booted = useScene((s) => s.booted);

  useGSAP(
    () => {
      if (!booted) return;
      const { dispose } = createMasterTimeline(stageRef.current!);
      return dispose;
    },
    { scope: stageRef, dependencies: [booted], revertOnUpdate: true },
  );

  return (
    <>
      <SmoothScroll />
      <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
        <SequenceCanvas />
        <Objects3D {...sceneData} />
        <div className="relative z-20 h-full w-full">{children}</div>
        <PowerOn />
      </div>
      <ChannelSwitch />
      <Hud />
    </>
  );
}
