import React, { useMemo } from 'react';

// 🥞 Strict Z-Index Layering Dictionary
// Ensures back hair is always behind the body, and accessories are always on top.
const LAYER_DEPTH: Record<string, number> = {
  background: 0,
  back_hair: 10,
  body: 20,
  face: 30, // Eyes, blush, mouths
  clothing_bottom: 40,
  clothing_top: 50,
  clothing_one_piece: 60, // Overrides top/bottom if present
  front_hair: 70,
  accessory: 80,
  effect: 90, // Sparkles, floating items
};

export interface AvatarAsset {
  id: string;
  type: keyof typeof LAYER_DEPTH;
  image_url: string;
}

interface AvatarCanvasProps {
  assets: AvatarAsset[];
  className?: string; // Allows passing custom sizes/margins from parent
}

export default function AvatarCanvas({ assets, className = '' }: AvatarCanvasProps) {
  // Sort assets dynamically based on the LAYER_DEPTH dictionary
  const sortedLayers = useMemo(() => {
    return [...assets].sort((a, b) => 
      (LAYER_DEPTH[a.type] || 0) - (LAYER_DEPTH[b.type] || 0)
    );
  }, [assets]);

  return (
    <div 
      className={`relative aspect-square w-full max-w-[1024px] mx-auto overflow-hidden bg-[var(--bg-app)] rounded-[32px] border-4 border-[var(--border-subtle)] shadow-sm ${className}`}
    >
      {/* 📍 Unified Canvas Pinning 
        Because all AI generations share the 1024x1024 canvas, 
        we simply pin them to inset-0 (top 0, left 0, right 0, bottom 0).
      */}
      {sortedLayers.map((layer) => (
        <img
          key={layer.id}
          src={layer.image_url}
          alt={`avatar-layer-${layer.type}`}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300"
          style={{ zIndex: LAYER_DEPTH[layer.type] || 0 }}
        />
      ))}

      {/* ✨ Optional: Soft Kawaii Gloss Overlay (gives it that premium trading card feel) */}
      <div 
        className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/30 z-[100]" 
        aria-hidden="true"
      />
    </div>
  );
}
