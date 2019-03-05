// Import vue component
import VisjsGraph from './components/visjs-graph.vue';
import VisjsTimeline from './components/visjs-timeline.vue';

// Declare install function executed by Vue.use()
export function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component(VisjsGraph.name, VisjsGraph);
  Vue.component(VisjsTimeline.name, VisjsTimeline);
}

// Create module definition for Vue.use()
const plugin = {
  install
};

// Auto-install when vue is found (eg. in browser via <script> tag)
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  /* eslint no-undef: 0 */
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// To allow use as module (npm/webpack/etc.) export component
export default VisjsGraph;
export { VisjsGraph, VisjsTimeline };
