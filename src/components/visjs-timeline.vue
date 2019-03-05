<template>
  <div></div>
</template>

<script>
import * as mlvisjs from 'ml-visjs-graph';

// import 'vis/dist/vis.css';
// import 'ml-visjs-graph/less/ml-visjs-graph.js.less';

export default {
  name: 'visjs-timeline',
  components: {},
  props: {
    events: {
      type: Object
    },
    groups: {
      type: Array,
      required: true,
      default: () => []
    },
    items: {
      type: Array,
      required: true,
      default: () => []
    },
    options: {
      type: Object
    }
  },
  data() {
    return {
      loading: false
      // Do not add visjs objects here, or it will get wrapped with observers!!
      //timeline: null
    };
  },
  computed: {
    cleanEvents() {
      return this.observerClean(this.events);
    },
    cleanGroups() {
      return this.observerClean(this.groups);
    },
    cleanItems() {
      return this.observerClean(this.items);
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
    events() {
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
    options() {
      if (this.timeline) {
        this.timeline.setOptions(this.cleanOptions);
      }
    }
  },
  mounted() {
    var self = this;

    if (!mlvisjs) {
      throw 'Error: mlvisjs not found, required by mlVisjsTimeline directive';
    }

    this.timeline = new mlvisjs.Timeline(self.$el);
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
</script>

<style lang="less"></style>
