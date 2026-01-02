"use client";

import React from 'react';

export default function SelectAll() {
  const toggleAll = (checked: boolean) => {
    const nodes = document.querySelectorAll<HTMLInputElement>('.user-select');
    nodes.forEach(n => { n.checked = checked; });
  };

  return (
    <input
      type="checkbox"
      onChange={(e) => toggleAll(e.currentTarget.checked)}
      aria-label="Select all users"
    />
  );
}
