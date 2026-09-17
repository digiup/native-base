import component from './pages/component.js';
import { FRAMEWORK_NAMES, guide } from './pages/frameworks.js';
import { gettingStarted, registryGuide, theming } from './pages/guides.js';
import home from './pages/home.js';
import kitchenSink from './pages/kitchen-sink.js';

/** URL → render function. Every route becomes a real HTML document, so cross-document view transitions apply. */
export function routes(site) {
  const map = new Map([
    ['/', () => home(site)],
    ['/docs/', () => gettingStarted(site)],
    ['/docs/registry/', () => registryGuide(site)],
    ['/docs/theming/', () => theming(site)],
    ['/kitchen-sink/', () => kitchenSink(site)],
  ]);
  for (const name of FRAMEWORK_NAMES) map.set(`/docs/${name}/`, () => guide(name)(site));
  for (const item of site.registry.items) map.set(`/docs/${item.name}/`, () => component(site, item));
  return map;
}
