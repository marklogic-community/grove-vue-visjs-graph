import * as mlvisjs from 'ml-visjs-graph';
import { Graph, Timeline } from 'ml-visjs-graph';

//

// import 'vis/dist/vis.css';
// import 'ml-visjs-graph/less/ml-visjs-graph.js.less';

var script = {
  name: 'visjs-graph',
  components: {},
  props: {
    edges: {
      type: Array,
      required: true,
      default: function () { return []; }
    },
    events: {
      type: Object
    },
    layout: {
      type: String,
      default: function () { return 'standard'; }
    },
    nodes: {
      type: Array,
      required: true,
      default: function () { return []; }
    },
    options: {
      type: Object
    },
    styling: {
      type: String,
      default: function () { return 'fontawesome'; }
    }
  },
  data: function data() {
    return {
      loading: false
      // Do not add visjs graph here, or it will get wrapped with observers!!
      //graph: null
    };
  },
  computed: {
    cleanEdges: function cleanEdges() {
      return this.observerClean(this.edges);
    },
    cleanEvents: function cleanEvents() {
      return this.observerClean(this.events);
    },
    cleanNodes: function cleanNodes() {
      return this.observerClean(this.nodes);
    },
    cleanOptions: function cleanOptions() {
      return this.observerClean(this.options);
    }
  },
  methods: {
    observerClean: function observerClean(obj) {
      var this$1 = this;

      if (Array.isArray(obj)) {
        return obj.map(function (item) { return this$1.observerClean(item); });
      } else if (Object.prototype.toString.call(obj) === '[object Date]') {
        return new Date(obj.valueOf());
      } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce(
          function (res, e) {
            var obj$1;

            return Object.assign(res, ( obj$1 = {}, obj$1[e] = this$1.observerClean(obj[e]), obj$1 ));
        },
          {}
        );
      } else {
        return obj;
      }
    },
    sleep: function sleep(ms) {
      return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    }
  },
  watch: {
    edges: {
      handler: function() {
        if (this.graph) {
          this.graph.network.setData(null, null, this.cleanEdges, null);
        }
      },
      deep: true
    },
    events: function events() {
      if (this.graph) {
        this.graph.network.setEvents(this.cleanEvents);
      }
    },
    layout: function layout(newLayout) {
      if (this.graph) {
        this.graph.setLayout(newLayout);
      }
    },
    nodes: {
      handler: function() {
        if (this.graph) {
          this.graph.network.setData(this.cleanNodes, null, null, null);
        }
      },
      deep: true
    },
    options: function options() {
      if (this.graph) {
        this.graph.network.setOptions(this.cleanOptions);
      }
    },
    styling: function styling(newStyling) {
      if (this.graph) {
        this.graph.setStyling(newStyling);
      }
    }
  },
  mounted: function mounted() {
    var self = this;

    if (!mlvisjs) {
      throw 'Error: mlvisjs not found, required by mlVisjsGraph directive';
    }

    new Graph(
      self.$el,
      null,
      null,
      function done(graph) {
        if (self.nodes.length || self.edges.length) {
          graph.network.setData(self.cleanNodes, null, self.cleanEdges, null);
        }
        if (self.events) {
          graph.network.setEvents(self.cleanEvents);
        }
        if (self.options) {
          graph.network.setOptions(self.cleanOptions);
        }
        if (self.layout) {
          graph.setLayout(self.layout);
        }
        if (self.styling) {
          graph.setStyling(self.styling);
        }
        self.graph = graph;
        self.sleep(100).then(function () {
          if (self.options) {
            graph.network.setOptions(self.cleanOptions);
          }
        });
      },
      function fail(failure) {
        throw failure;
      }
    );
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) { style.element.setAttribute('media', css.media); }
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) { style.element.removeChild(nodes[index]); }
      if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }else { style.element.appendChild(textNode); }
    }
  }
}

var browser = createInjector;

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div")
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-0ebb59c4_0", { source: ".mlvisjs-graph .graph-controls {\n  width: fit-content;\n}\n.mlvisjs-graph .graph-controls form {\n  padding: 0;\n}\n", map: {"version":3,"sources":["visjs-graph.vue"],"names":[],"mappings":"AAAA;EACE,kBAAkB;AACpB;AACA;EACE,UAAU;AACZ","file":"visjs-graph.vue","sourcesContent":[".mlvisjs-graph .graph-controls {\n  width: fit-content;\n}\n.mlvisjs-graph .graph-controls form {\n  padding: 0;\n}\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var VisjsGraph = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

//

// import 'vis/dist/vis.css';
// import 'ml-visjs-graph/less/ml-visjs-graph.js.less';

var script$1 = {
  name: 'visjs-timeline',
  components: {},
  props: {
    events: {
      type: Object
    },
    groups: {
      type: Array,
      required: true,
      default: function () { return []; }
    },
    items: {
      type: Array,
      required: true,
      default: function () { return []; }
    },
    options: {
      type: Object
    }
  },
  data: function data() {
    return {
      loading: false
      // Do not add visjs objects here, or it will get wrapped with observers!!
      //timeline: null
    };
  },
  computed: {
    cleanEvents: function cleanEvents() {
      return this.observerClean(this.events);
    },
    cleanGroups: function cleanGroups() {
      return this.observerClean(this.groups);
    },
    cleanItems: function cleanItems() {
      return this.observerClean(this.items);
    },
    cleanOptions: function cleanOptions() {
      return this.observerClean(this.options);
    }
  },
  methods: {
    observerClean: function observerClean(obj) {
      var this$1 = this;

      if (Array.isArray(obj)) {
        return obj.map(function (item) { return this$1.observerClean(item); });
      } else if (Object.prototype.toString.call(obj) === '[object Date]') {
        return new Date(obj.valueOf());
      } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce(
          function (res, e) {
            var obj$1;

            return Object.assign(res, ( obj$1 = {}, obj$1[e] = this$1.observerClean(obj[e]), obj$1 ));
        },
          {}
        );
      } else {
        return obj;
      }
    },
    sleep: function sleep(ms) {
      return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    }
  },
  watch: {
    events: function events() {
      if (this.timeline) {
        this.timeline.setEvents(this.cleanEvents);
      }
    },
    groups: {
      handler: function() {
        if (this.timeline) {
          this.timeline.setData(null, null, this.cleanGroups, null);
        }
      },
      deep: true
    },
    items: {
      handler: function() {
        if (this.timeline) {
          this.timeline.setData(this.cleanItems, null, null, null);
        }
      },
      deep: true
    },
    options: function options() {
      if (this.timeline) {
        this.timeline.setOptions(this.cleanOptions);
      }
    }
  },
  mounted: function mounted() {
    var self = this;

    if (!mlvisjs) {
      throw 'Error: mlvisjs not found, required by mlVisjsTimeline directive';
    }

    this.timeline = new Timeline(self.$el);
    if (this.timeline) {
      if (self.items.length || self.groups.length) {
        this.timeline.setData(self.cleanItems, null, self.cleanGroups, null);
      }
      if (self.events) {
        this.timeline.setEvents(self.cleanEvents);
      }
      if (self.options) {
        this.timeline.setOptions(self.cleanOptions);
      }
    }
  }
};

/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div")
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  var __vue_inject_styles__$1 = undefined;
  /* scoped */
  var __vue_scope_id__$1 = undefined;
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var VisjsTimeline = normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    undefined,
    undefined
  );

// Import vue component

// Declare install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component(VisjsGraph.name, VisjsGraph);
  Vue.component(VisjsTimeline.name, VisjsTimeline);
}

// Create module definition for Vue.use()
var plugin = {
  install: install
};

// Auto-install when vue is found (eg. in browser via <script> tag)
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  /* eslint no-undef: 0 */
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default VisjsGraph;
export { install, VisjsGraph, VisjsTimeline };
