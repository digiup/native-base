export interface Size {
  bytes: number;
  gzip: number;
  brotli: number;
}

export interface Example {
  title: string;
  /** Raw HTML, exactly what you (or your model) would write. */
  code: string;
  /** false for snippets that only make sense as code, e.g. a <script> or <html> tag. */
  live: boolean;
  /** o200k_base token count of `code`. */
  tokens: number;
}

export interface RegistryItem {
  name: string;
  title: string;
  category: 'Foundations' | 'Forms' | 'Display' | 'Overlays' | 'Disclosure';
  description: string;
  registryDependencies: string[];
  /** Markup hooks and what they do. */
  api: Record<string, string>;
  /** Platform features the component is built on. */
  native: string[];
  /** Readable source CSS. */
  source: string;
  /** Minified CSS. */
  css: string;
  examples: Example[];
  size: Size;
}

export interface Registry {
  name: string;
  version: string;
  description: string;
  rules: string[];
  items: RegistryItem[];
  bundle: { size: Size };
  llms: { tokens: number; size: Size };
}

export declare const registry: Registry;
export declare const items: RegistryItem[];
export declare function getItem(name: string): RegistryItem | undefined;
export declare function resolve(names: string[]): RegistryItem[];
export declare function css(names: string[]): string;
