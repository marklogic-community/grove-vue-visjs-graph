import * as mlvisjs from 'ml-visjs-graph';
import { Graph } from 'ml-visjs-graph';

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
      handler: function () {
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
      handler: function () {
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
    inject("data-v-5f429f40_0", { source: "\n.mlvisjs-graph .graph-controls {\n  width: fit-content;\n}\n.mlvisjs-graph .graph-controls form {\n  padding: 0;\n}\n", map: {"version":3,"sources":["visjs-graph.vue"],"names":[],"mappings":";AAAA;EACE,mBAAmB;CACpB;AACD;EACE,WAAW;CACZ","file":"visjs-graph.vue","sourcesContent":[".mlvisjs-graph .graph-controls {\n  width: fit-content;\n}\n.mlvisjs-graph .graph-controls form {\n  padding: 0;\n}\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "/Users/gjosten/Projects/grove-vue-visjs-graph/src/components/visjs-graph.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) { component.functional = true; }
    }

    component._scopeId = scope;

    {
      var hook;
      if (style) {
        hook = function(context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook !== undefined) {
        if (component.functional) {
          // register for functional component in vue file
          var originalRender = component.render;
          component.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context)
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = component.beforeCreate;
          component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }
    }

    return component
  }
  /* style inject */
  function __vue_create_injector__() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
    var isOldIE =
      typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        var code = css.source;
        var index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          var el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) { el.setAttribute('media', css.media); }
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts
            .filter(Boolean)
            .join('\n');
        } else {
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) { style.element.removeChild(nodes[index]); }
          if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
          else { style.element.appendChild(textNode); }
        }
      }
    }
  }
  /* style inject SSR */
  

  
  var component = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    __vue_create_injector__,
    undefined
  );

// Import vue component

// Declare install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component(component.name, component);
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

export default component;
export { install };
