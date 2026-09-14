import registry from 'virtual:native-base/registry';

export { registry };
export const items = registry.items;

export function getItem(name) {
  return registry.items.find((item) => item.name === name);
}

/** The named items plus their dependencies, in cascade order. */
export function resolve(names) {
  const wanted = new Set();
  const visit = (name) => {
    if (wanted.has(name)) return;
    const item = getItem(name);
    if (!item) throw new Error(`Unknown native-base item "${name}"`);
    item.registryDependencies.forEach(visit);
    wanted.add(name);
  };
  names.forEach(visit);
  return registry.items.filter((item) => wanted.has(item.name));
}

/** Minified CSS for a custom bundle, e.g. css(["dialog", "select"]). */
export function css(names) {
  return resolve(names)
    .map((item) => item.css)
    .join('');
}
