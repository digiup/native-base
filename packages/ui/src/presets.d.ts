/** Twenty color variables per scheme, keyed by name: { "--primary": "oklch(…)", … }. */
export type Colors = Record<string, string>;

export interface Seed {
  /** Primary hue, 0–360. */
  hue: number;
  /** Primary chroma, 0–0.3. Below 0.02 the primary is black and white. */
  chroma: number;
  /** How much hue leaks into greys, 0–1. */
  tint: number;
  /** Hue for the greys; null follows `hue`. */
  tintHue: number | null;
}

export interface Theme {
  name: string;
  /** null for imported themes that were not generated. */
  seed: Seed | null;
  light: Colors;
  dark: Colors;
  /** Variables edited by hand; regeneration from the seed leaves them alone. */
  locked: string[];
}

export interface Style {
  name: string;
  /** Every non-color variable: --spacing, --radius, --corner-shape, --font-sans, … */
  vars: Record<string, string>;
}

export interface State {
  theme: Theme;
  style: Style;
}

export interface Include {
  theme: boolean;
  style: boolean;
}

export interface ThemePreset {
  name: string;
  note: string;
  seed: Seed;
}

export interface StylePreset {
  name: string;
  note: string;
  vars: Record<string, string>;
}

export declare const THEME_VARS: [name: string, label: string, group: string][];
export declare const THEME_VAR_NAMES: string[];
export declare const STYLE_VARS: { name: string; label: string; group: string; type: 'range' | 'choice'; hint?: string }[];
export declare const STYLE_VAR_NAMES: string[];
export declare const DEFAULT_STYLE: Record<string, string>;
export declare const THEME_PRESETS: ThemePreset[];
export declare const STYLE_PRESETS: StylePreset[];
export declare const FONT_STACKS: Record<string, string>;
export declare const SHADOWS: Record<string, string>;
export declare const SHADOWS_LG: Record<string, string>;
export declare const EASES: Record<string, string>;
export declare const CORNER_SHAPES: Record<string, string>;

/** Light and dark colors from four numbers. */
export declare function generateTheme(seed: Seed): { light: Colors; dark: Colors };
export declare function themeFrom(preset: ThemePreset): Theme;
/** Fills in variables added after a style was saved. */
export declare function styleFrom(preset: { name: string; vars: Record<string, string> }): Style;
/** "Indigo", "indigo" or "theme-indigo". */
export declare function findTheme(ref: string): ThemePreset | undefined;
/** "Béton", "beton" or "style-beton". */
export declare function findStyle(ref: string): StylePreset | undefined;
export declare function slug(name: string): string;

/** A `:root { … }` block with light-dark() colors. */
export declare function toCSS(state: State, include?: Include): string;
export declare function toJSON(state: State, include?: Include): string;
export declare function fileName(state: State, include: Include): string;
/** Our CSS or JSON, or a shadcn/ui theme. Partial results merge into an existing state. */
export declare function parse(text: string): { theme?: Partial<Theme> & { partial?: boolean }; style?: Partial<Style> & { partial?: boolean } };

/** The playground's #s=… code. */
export declare function encodeShare(state: State): string;
/** A playground URL, a hash or a bare code. */
export declare function decodeShare(text: string): State | null;
export declare function compact(state: State): unknown;
export declare function expand(data: unknown): State;

export declare function oklch(l: number, c: number, h: number, alpha?: number): string;
export declare function oklchToHex(l: number, c: number, h: number): string;
export declare function hexToOklch(hex: string): string;
