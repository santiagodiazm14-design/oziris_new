"use client";

import React, { useRef, useState, useMemo } from "react";

interface WaveformSeekbarProps {
  currentTime: number;
  duration: number;
  trackId?: string;
  onSeek: (timeInSeconds: number) => void;
}

// Generate realistic deterministic waveform heights based on trackId seed
function generateWaveformHeights(seed: string, totalBars: number = 100): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const heights: number[] = [];
  for (let i = 0; i < totalBars; i++) {
    // Generate pseudo-random organic music wave curves
    const wave1 = Math.sin((i / totalBars) * Math.PI * 4 + hash);
    const wave2 = Math.cos((i / totalBars) * Math.PI * 8);
    const randomFactor = Math.abs((Math.sin(hash * (i + 1)) * 10000) % 1);
    
    // Mix components to get realistic beat dynamics (intros, drops, buildups)
    let height = 0.25 + 0.35 * Math.abs(wave1) + 0.25 * Math.abs(wave2) + 0.15 * randomFactor;
    // Boost middle section to simulate drop/climax
    if (i > totalBars * 0.2 && i < totalBars * 0.8) {
      height = Math.min(1.0, height * 1.35);
    }
    heights.push(Math.max(0.15, Math.min(1.0, height)));
  }
  return heights;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const WaveformSeekbar: React.FC<WaveformSeekbarProps> = ({
  currentTime,
  duration,
  trackId = "default-seed",
  onSeek,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const bars = useMemo(() => generateWaveformHeights(trackId, 120), [trackId]);

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const calculateSeekTime = (clientX: number) => {
    if (!containerRef.current || duration <= 0) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    return ratio * duration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const seekTime = calculateSeekTime(e.clientX);
    onSeek(seekTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (containerRef.current && duration > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      setHoverPosition(ratio * 100);
    }

    if (isDragging) {
      const seekTime = calculateSeekTime(e.clientX);
      onSeek(seekTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerLeave = () => {
    setHoverPosition(null);
  };

  return (
    <div className="w-full flex items-center gap-3 select-none px-2 py-1">
      {/* Current Time */}
      <span className="text-[11px] font-mono font-semibold text-purple-300 w-10 text-right shrink-0">
        {formatTime(currentTime)}
      </span>

      {/* Waveform Bar Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="relative flex-1 h-7 flex items-center justify-between gap-[2px] cursor-pointer group py-1"
      >
        {bars.map((heightRatio, index) => {
          const barPercent = (index / bars.length) * 100;
          const isPlayed = barPercent <= progressPercent;
          const isHovered = hoverPosition !== null && barPercent <= hoverPosition && !isPlayed;

          return (
            <div
              key={index}
              style={{ height: `${Math.round(heightRatio * 100)}%` }}
              className={`w-[2px] sm:w-[3px] rounded-full transition-all duration-75 ${
                isPlayed
                  ? "bg-gradient-to-t from-purple-600 via-violet-400 to-cyan-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  : isHovered
                  ? "bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  : "bg-zinc-800/90 group-hover:bg-zinc-700/80"
              }`}
            />
          );
        })}

        {/* Hover Time Tooltip */}
        {hoverPosition !== null && duration > 0 && (
          <div
            style={{ left: `${hoverPosition}%` }}
            className="absolute -top-7 -translate-x-1/2 bg-[#0e0e14] border border-purple-500/40 text-cyan-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg shadow-[0_0_12px_rgba(147,51,234,0.3)] pointer-events-none z-10 backdrop-blur-md"
          >
            {formatTime((hoverPosition / 100) * duration)}
          </div>
        )}
      </div>

      {/* Duration */}
      <span className="text-[11px] font-mono font-medium text-zinc-500 w-10 text-left shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
};
