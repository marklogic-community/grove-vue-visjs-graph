<template>
  <div></div>
</template>

<script>
import * as mlvisjs from 'ml-visjs-graph';

// import 'vis/dist/vis.css';
// import 'ml-visjs-graph/less/ml-visjs-graph.js.less';

export default {
  name: 'visjs-graph',
  components: {},
  props: {
    edges: {
      type: Array,
      required: true,
      default: () => []
    },
    events: {
      type: Object
    },
    layout: {
      type: String,
      default: () => 'standard'
    },
    nodes: {
      type: Array,
      required: true,
      default: () => []
    },
    options: {
      type: Object
    },
    styling: {
      type: String,
      default: () => 'fontawesome'
    }
  },
  data() {
    return {
      loading: false
      // Do not add visjs graph here, or it will get wrapped with observers!!
      //graph: null
    };
  },
  computed: {
    cleanEdges() {
      return this.observerClean(this.edges);
    },
    cleanEvents() {
      return this.observerClean(this.events);
    },
    cleanNodes() {
      return this.observerClean(this.nodes);
    },
    cleanOptions() {
      return this.observerClean(this.options);
    }
  },
  methods: {
    observerClean(obj) {
      if (Array.isArray(obj)) {
        return obj.map(item => this.observerClean(item));
      } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce(
          (res, e) => Object.assign(res, { [e]: this.observerClean(obj[e]) }),
          {}
        );
      } else {
        return obj;
      }
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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
    events() {
      if (this.graph) {
        this.graph.network.setEvents(this.cleanEvents);
      }
    },
    layout(newLayout) {
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
    options() {
      if (this.graph) {
        this.graph.network.setOptions(this.cleanOptions);
      }
    },
    styling(newStyling) {
      if (this.graph) {
        this.graph.setStyling(newStyling);
      }
    }
  },
  mounted() {
    var self = this;

    if (!mlvisjs) {
      throw 'Error: mlvisjs not found, required by mlVisjsGraph directive';
    }

    new mlvisjs.Graph(
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
        self.sleep(100).then(() => {
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
</script>

<style lang="less">
.mlvisjs-graph .graph-controls {
  //display: none;
  width: fit-content;

  form {
    padding: 0;
  }
}
</style>
