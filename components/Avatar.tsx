"use client";
import React from 'react';
import { MdSmartToy } from 'react-icons/md';

type AvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  variant?: 'assistant' | 'user' | 'default';
};

const DEFAULT_SIZE = 40;

const getInitials = (name?: string | null) => {
  if (!name) return 'UB';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'UB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function Avatar({ name, imageUrl, size = DEFAULT_SIZE, variant = 'default' }: AvatarProps) {
  const initials = getInitials(name ?? undefined);
  const s = size;
  const fontSize = Math.max(12, Math.floor(s / 2.6));

  // If image provided, show it
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name || 'avatar'}
        style={{ width: s, height: s, borderRadius: '9999px', objectFit: 'cover' }}
      />
    );
  }

  // Assistant robot avatar using react-icons
  if (variant === 'assistant') {
    // Example: using MdSmartToy from react-icons/md
    // Install with: npm install react-icons
    // You can choose another icon if preferred
    // https://react-icons.github.io/react-icons/search?q=robot
    // import { MdSmartToy } from 'react-icons/md'; (add at top of file)
    return (
      <div
        style={{ width: s, height: s, borderRadius: '9999px', background: 'linear-gradient(135deg,#54BDBB,#54BCBA)' }}
        className="flex items-center justify-center"
        aria-hidden
        title="Assistente"
      >
        <MdSmartToy size={Math.floor(s * 0.6)} color="#fff" />
      </div>
    );
  }

  // Fallback: initials (name) or 'UB' with CLIENTE UBVA title
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: '9999px',
        background: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize,
      }}
      aria-hidden
      title={name || 'CLIENTE UBVA'}
    >
      {name ? initials : 'UB'}
    </div>
  );
}
