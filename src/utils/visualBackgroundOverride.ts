import { useEffect, useLayoutEffect } from 'react';
import * as THREE from 'three';

const DEFAULT_CREAM_HEX = '#f0eee6';
const DEFAULT_CREAM_HEX_NUMBER = 0xf0eee6;

const overrideStack: string[] = [];
let currentOverrideHex: string | null = null;
let currentOverrideNumber: number | null = null;
let patchesApplied = false;
let styleElement: HTMLStyleElement | null = null;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const HEX_MATCH = /^#([0-9a-f]{3,8})$/i;
const RGB_MATCH = /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)$/i;

interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export const DEFAULT_VISUAL_BACKGROUND = DEFAULT_CREAM_HEX;

export function useVisualBackgroundOverride(color: string | null) {
  useIsomorphicLayoutEffect(() => {
    if (!color) {
      return;
    }

    const normalized = pushVisualBackgroundOverride(color);
    return () => {
      popVisualBackgroundOverride(normalized);
    };
  }, [color]);
}

function pushVisualBackgroundOverride(color: string) {
  ensurePatches();
  const normalized = normalizeHex(color);
  overrideStack.push(normalized);
  applyOverride(normalized);
  return normalized;
}

function popVisualBackgroundOverride(color: string) {
  const index = overrideStack.lastIndexOf(color);
  if (index !== -1) {
    overrideStack.splice(index, 1);
  }
  const nextColor = overrideStack.length > 0 ? overrideStack[overrideStack.length - 1] : null;
  applyOverride(nextColor);
}

function ensurePatches() {
  if (patchesApplied || typeof window === 'undefined') {
    return;
  }
  patchesApplied = true;
  patchCanvasRenderingContext();
  patchCSSStyleDeclaration();
  patchElementSetAttribute();
  patchCanvasGradient();
  patchThreeBackgroundHandling();
}

function applyOverride(hex: string | null) {
  currentOverrideHex = hex;
  currentOverrideNumber = hex ? parseInt(hex.slice(1), 16) : null;

  if (typeof document !== 'undefined') {
    ensureStyleElement();
    const root = document.documentElement;

    if (hex) {
      root.classList.add('visual-bg-override');
      root.style.setProperty('--visual-bg-override-color', hex);
      updateExistingInlineStyles();
    } else {
      root.classList.remove('visual-bg-override');
      root.style.removeProperty('--visual-bg-override-color');
    }
  }
}

function normalizeHex(color: string): string {
  let value = color.trim().toLowerCase();

  if (value === 'white') {
    return '#ffffff';
  }

  const hexCandidate = normalizeHexString(value);
  if (hexCandidate) {
    return hexCandidate;
  }

  const rgbCandidate = parseRgb(value);
  if (rgbCandidate) {
    return rgbToHex(rgbCandidate.r, rgbCandidate.g, rgbCandidate.b);
  }

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = value;
      const resolved = ctx.fillStyle;
      const resolvedHex = normalizeHexString(resolved) ?? rgbStringToHex(resolved);
      if (resolvedHex) {
        return resolvedHex;
      }
    }
  }

  return DEFAULT_CREAM_HEX;
}

function normalizeHexString(value: string): string | null {
  if (!HEX_MATCH.test(value)) {
    return null;
  }
  const hex = value.toLowerCase();
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (hex.length === 7) {
    return hex;
  }
  if (hex.length === 9) {
    return hex.slice(0, 7);
  }
  return null;
}

function parseRgb(value: string): RGBColor | null {
  const match = value.match(RGB_MATCH);
  if (!match) {
    return null;
  }
  return {
    r: parseFloat(match[1]),
    g: parseFloat(match[2]),
    b: parseFloat(match[3]),
    a: match[4] !== undefined ? parseFloat(match[4]) : undefined,
  };
}

function rgbStringToHex(value: string): string | null {
  const rgb = parseRgb(value);
  if (!rgb) {
    return null;
  }
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function rgbToHex(r: number, g: number, b: number) {
  const toChannel = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`;
}

function hexToRgb(hex: string): RGBColor | null {
  const normalized = normalizeHexString(hex);
  if (!normalized || normalized.length !== 7) {
    return null;
  }
  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function ensureStyleElement() {
  if (styleElement || typeof document === 'undefined') {
    return;
  }
  styleElement = document.createElement('style');
  styleElement.id = 'visual-bg-override-style';
  styleElement.textContent = `
.visual-bg-override body {
  background-color: var(--visual-bg-override-color, ${DEFAULT_CREAM_HEX}) !important;
}
.visual-bg-override .bg-\\[\\#F0EEE6\\],
.visual-bg-override .bg-\\[\\#f0eee6\\] {
  background-color: var(--visual-bg-override-color, ${DEFAULT_CREAM_HEX}) !important;
}
`;
  document.head.appendChild(styleElement);
}

function updateExistingInlineStyles() {
  if (!currentOverrideHex || typeof document === 'undefined') {
    return;
  }
  const elements = document.querySelectorAll<HTMLElement>('[style]');
  elements.forEach(element => {
    const original = element.getAttribute('style');
    if (!original) {
      return;
    }
    const updated = replaceCreamTokens(original);
    if (updated !== original) {
      element.setAttribute('style', updated);
    }
  });
}

function replaceCreamTokens(value: string): string {
  if (!currentOverrideHex) {
    return value;
  }
  const replacement = currentOverrideHex;
  return value
    .replace(/#([0-9a-f]{3,8})/gi, (match) => {
      const normalized = normalizeHexString(match);
      if (!normalized) {
        return match;
      }
      if (normalized === DEFAULT_CREAM_HEX) {
        return replacement;
      }
      const rgb = hexToRgb(normalized);
      if (rgb && isCreamish(rgb.r, rgb.g, rgb.b)) {
        return replacement;
      }
      return match;
    })
    .replace(/rgba?\([^)]*\)/gi, (match) => {
      const rgb = parseRgb(match);
      if (!rgb) {
        return match;
      }
      if (isCreamish(rgb.r, rgb.g, rgb.b)) {
        return formatRgba(255, 255, 255, rgb.a);
      }
      return match;
    });
}

function formatRgba(r: number, g: number, b: number, a?: number) {
  if (a === undefined || Number.isNaN(a) || a >= 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function isCreamish(r: number, g: number, b: number) {
  return Math.abs(r - 240) <= 6 && Math.abs(g - 238) <= 6 && Math.abs(b - 230) <= 6;
}

function mapCanvasColor(value: any) {
  if (!currentOverrideHex || typeof value !== 'string') {
    return value;
  }
  const hexCandidate = normalizeHexString(value.trim().toLowerCase());
  if (hexCandidate) {
    if (hexCandidate === DEFAULT_CREAM_HEX) {
      return currentOverrideHex;
    }
    const rgbFromHex = hexToRgb(hexCandidate);
    if (rgbFromHex && isCreamish(rgbFromHex.r, rgbFromHex.g, rgbFromHex.b)) {
      return currentOverrideHex;
    }
  }
  const rgb = parseRgb(value);
  if (rgb && isCreamish(rgb.r, rgb.g, rgb.b)) {
    return formatRgba(255, 255, 255, rgb.a);
  }
  return value;
}

function patchCanvasRenderingContext() {
  const CanvasCtx = (window as any).CanvasRenderingContext2D;
  if (!CanvasCtx) {
    return;
  }
  const proto = CanvasCtx.prototype;
  if ((proto as any).__visualBgPatched) {
    return;
  }

  const fillStyleDescriptor = Object.getOwnPropertyDescriptor(proto, 'fillStyle');
  if (fillStyleDescriptor?.set && fillStyleDescriptor?.get) {
    Object.defineProperty(proto, 'fillStyle', {
      configurable: fillStyleDescriptor.configurable,
      enumerable: fillStyleDescriptor.enumerable,
      get: fillStyleDescriptor.get.bind(proto),
      set(value: any) {
        fillStyleDescriptor.set!.call(this, mapCanvasColor(value));
      },
    });
  }

  const strokeStyleDescriptor = Object.getOwnPropertyDescriptor(proto, 'strokeStyle');
  if (strokeStyleDescriptor?.set && strokeStyleDescriptor?.get) {
    Object.defineProperty(proto, 'strokeStyle', {
      configurable: strokeStyleDescriptor.configurable,
      enumerable: strokeStyleDescriptor.enumerable,
      get: strokeStyleDescriptor.get.bind(proto),
      set(value: any) {
        strokeStyleDescriptor.set!.call(this, mapCanvasColor(value));
      },
    });
  }

  (proto as any).__visualBgPatched = true;
}

function patchCanvasGradient() {
  const CanvasGradient = (window as any).CanvasGradient;
  if (!CanvasGradient) {
    return;
  }
  const proto = CanvasGradient.prototype as CanvasGradient & { __visualBgPatched?: boolean };
  if ((proto as any).__visualBgPatched) {
    return;
  }

  const originalAddColorStop = proto.addColorStop;
  proto.addColorStop = function(offset: number, color: string) {
    const mapped = typeof color === 'string' ? mapCanvasColor(color) : color;
    return originalAddColorStop.call(this, offset, mapped);
  } as typeof CanvasGradient.prototype.addColorStop;

  (proto as any).__visualBgPatched = true;
}

function patchCSSStyleDeclaration() {
  const CSSStyle = (window as any).CSSStyleDeclaration;
  if (!CSSStyle) {
    return;
  }
  const proto = CSSStyle.prototype;
  if ((proto as any).__visualBgPatched) {
    return;
  }

  const originalSetProperty = proto.setProperty;
  proto.setProperty = function(property: string, value: string | null, priority?: string) {
    const nextValue = typeof value === 'string' ? replaceCreamTokens(value) : value;
    return originalSetProperty.call(this, property, nextValue, priority);
  };

  patchStyleProperty(proto, 'background');
  patchStyleProperty(proto, 'backgroundColor');

  (proto as any).__visualBgPatched = true;
}

function patchStyleProperty(proto: CSSStyleDeclaration, property: 'background' | 'backgroundColor') {
  const descriptor = Object.getOwnPropertyDescriptor(proto, property);
  if (!descriptor?.set || !descriptor?.get) {
    return;
  }
  Object.defineProperty(proto, property, {
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    get: descriptor.get.bind(proto),
    set(value: string) {
      descriptor.set!.call(this, replaceCreamTokens(value));
    },
  });
}

function patchElementSetAttribute() {
  const proto = Element.prototype as Element & { __visualBgPatched?: boolean };
  if (proto.__visualBgPatched) {
    return;
  }
  const originalSetAttribute = proto.setAttribute;
  proto.setAttribute = function(name: string, value: string) {
    const nextValue = name === 'style' ? replaceCreamTokens(value) : value;
    return originalSetAttribute.call(this, name, nextValue);
  };
  proto.__visualBgPatched = true;
}

function patchThreeBackgroundHandling() {
  if (!THREE?.Color) {
    return;
  }

  const colorProto = THREE.Color.prototype as THREE.Color & { __visualBgPatched?: boolean };
  if (!colorProto.__visualBgPatched) {
    const originalSet = colorProto.set;
    colorProto.set = function(value: THREE.ColorRepresentation) {
      return originalSet.call(this, mapThreeColorValue(value));
    } as typeof THREE.Color.prototype.set;
    colorProto.__visualBgPatched = true;
  }

  const rendererProto = THREE.WebGLRenderer?.prototype as THREE.WebGLRenderer & { __visualBgPatched?: boolean };
  if (rendererProto && !rendererProto.__visualBgPatched) {
    const originalSetClearColor = rendererProto.setClearColor;
    rendererProto.setClearColor = function(color: THREE.ColorRepresentation, alpha?: number) {
      return originalSetClearColor.call(this, mapThreeColorValue(color), alpha);
    } as typeof THREE.WebGLRenderer.prototype.setClearColor;
    rendererProto.__visualBgPatched = true;
  }
}

function mapThreeColorValue(value: THREE.ColorRepresentation): THREE.ColorRepresentation {
  if (!currentOverrideHex) {
    return value;
  }

  if (typeof value === 'number') {
    if (value === DEFAULT_CREAM_HEX_NUMBER && currentOverrideNumber !== null) {
      return currentOverrideNumber;
    }
    return value;
  }

  if (typeof value === 'string') {
    const hexCandidate = normalizeHexString(value.trim().toLowerCase());
    if (hexCandidate && hexCandidate === DEFAULT_CREAM_HEX) {
      return currentOverrideHex;
    }
    const rgbCandidate = parseRgb(value);
    if (rgbCandidate && isCreamish(rgbCandidate.r, rgbCandidate.g, rgbCandidate.b)) {
      return currentOverrideHex;
    }
    return value;
  }

  if (typeof value === 'object' && value && (value as THREE.Color).isColor && typeof (value as THREE.Color).getHex === 'function') {
    const hexValue = (value as THREE.Color).getHex();
    if (hexValue === DEFAULT_CREAM_HEX_NUMBER && currentOverrideNumber !== null) {
      return currentOverrideHex;
    }
  }

  return value;
}
