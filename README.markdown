# MarkLogic Grove Vue Visjs Graph

This library provides Vue components providing an interactive graph visualization of nodes and edges, as well an interactive timeline visualization of (grouped) items. It is a wrapper for the [vanilla JS `ml-visjs-graph` library](https://github.com/grtjn/ml-visjs-graph.js), which itself is based on the [VisJS Network library](http://visjs.org/docs/network/) and the [VisJS Timeline library](http://visjs.org/docs/timeline/).

The library is part of the MarkLogic Grove project, but could work in any Vue application.

## QuickStart

First, add the `grove-vue-visjs-graph` dependency via npm. (In a Grove Project, you will want to do this inside the `ui` directory.)

    npm install --save git+https://project.marklogic.com/repo/scm/~gjosten/grove-vue-visjs-graph.git

For now you also need to install ml-visjs-graph directly:

    npm install --save ml-visjs-graph

The latter depends on the vis package, which will get installed as dependency.

Then, in your Vue application, import `VisjsGraph` and/or `VisjsTimeline` as well as necessary styling:

```javascript
// Either add this to ui/src/main.js to add it globally:
import { VisjsGraph, VisjsTimeline } from 'grove-vue-visjs-graph';
import 'vis/dist/vis.css';
import 'ml-visjs-graph/less/ml-visjs-graph.js.less';
Vue.component(VisjsGraph.name, VisjsGraph);
Vue.component(VisjsTimeline.name, VisjsTimeline);

// Or do this in a Vue page/component to add it there only:
import { VisjsGraph, VisjsTimeline } from 'grove-vue-visjs-graph';
import 'vis/dist/vis.css';
import 'ml-visjs-graph/less/ml-visjs-graph.js.less';

export default {
  ...,
  components: {
    ...,
    VisjsGraph,
    VisjsTimeline
  },
  ...
};
```

After that you can start using the directly, which could look for example like this:

Graph:
```html
            <visjs-graph :nodes="nodes" :edges="edges" :options="graphOptions" layout="standard" :events="graphEvents"></visjs-graph>
```

Timeline:
```html
            <visjs-timeline :items="items" :groups="groups" :options="timelineOptions" :events="timelineEvents"></visjs-timeline>
```

## Recommended setup for grove-vue-template for VisjsGraph and VisjsTimeline

It is easiest to import the component globally via main.js as described in previous section. Then add this to the template of the DetailPage (`ui/src/views/DetailPage.vue`) within the existing `b-tabs`, at last position:

```html
          <b-tab title="Graph”>
            <visjs-graph v-if="tabIndex === 3" :nodes="nodes" :edges="edges" :options="graphOptions" layout="standard" :events="graphEvents"></visjs-graph>
          </b-tab>
```

Note: same might apply to Timeline, haven't tested yet.

Note that `tabIndex === 3` to enforce that the graph is only painted when the tab is open. The graph won't show properly if painted while hidden, as it relies on panel sizes and such.

Graph:

At minimum, you need to initialize `nodes`, `edges`, `graphOptions`, and `graphEvents`. Though, it can be convenient to use `nodesCache`, and `edgesCache`, and use so-called computed `nodes` and `edges`. The cache object can be used to quickly check if a node or edge exists, and you can fetch its details very quickly from it. It would look like this:

```javascript
  data() {
    return {
      ...,
      nodesCache: {},
      edgesCache: {},
      graphOptions: {},
      graphEvents: {}
    };
  },
  computed: {
    ...,
    nodes() {
      return Object.values(this.nodesCache);
    },
    edges() {
      return Object.values(this.edgesCache);
    }
  }
```

Timeline:

At minimum, you need to initialize `items`, `groups`, `timelineOptions`, and `timelineEvents`. Though, it can be convenient to use `itemsCache`, and `groupsCache`, and use so-called computed `items` and `groups`. The cache object can be used to quickly check if an item or a group exists, and you can fetch its details very quickly from it. It would look like this:

```javascript
  data() {
    return {
      ...,
      itemsCache: {},
      groupsCache: {},
      timelineOptions: {},
      timelineEvents: {}
    };
  },
  computed: {
    ...,
    items() {
      return Object.values(this.itemsCache);
    },
    groups() {
      return Object.values(this.groupsCache);
    }
  }
```

All component properties are automatically monitored for changes via the `Observer` pattern. Computed properties are automatically recalculated when a depending property gets changed, but really only when it changes!

## Adding interaction with MarkLogic for VisjsGraph

The component includes a library that can make appropriate MarkLogic calls to `/v1/graphs/sparql`. Eventually, we would like to replace this library with a default Grove middle-tier endpoint. For now, you'll need to enable the legacy proxy (the `whitelistProxyRoute` from the `legacy-routes` package) in Grove. You can find the config in `middle-tier/routes/index.js`:

```javascript
const enableLegacyProxy = true;
```

In that same file, you configure that legacy proxy. Add or uncomment at least the following:

```javascript
        {
          endpoint: '/graphs/sparql',
          methods: ['post'], // no need for 'get'
          authed: true
        }
```

And make sure commas between other endpoint rules are applied correctly.

When you have the middle-tier running in development mode (with a straight `npm start`), it will restart automatically. If not, restart it manually to enable the change.

Next, you can start using it in the DetailPage. Start with importing the GraphApi, near the top of the script tag inside `ui/src/views/DetailPage.vue`:

```javascript
import GraphApi from 'grove-vue-visjs-graph/src/api/GraphApi.js';
```

Next, you add a method to update the nodes and edges, just for convenience:

```javascript
  methods: {
    ...,
    updateGraph(response) {
      const self = this;
      self.nodesCache = response.nodes;
      self.edgesCache = response.edges;
    }
  }
```

And then you use it to first initialize the graph by feeding it the result of `GraphApi.expand`:

```javascript
  created() {
    const self = this;
    this.$store
      .dispatch('crud/' + self.type + '/view', {
        id: self.id,
        view: 'metadata'
      })
      .then(function(response) {
        if (!response.isError) {
          var metadata = JSON.parse(response.response);

          ...

          GraphApi.expand([metadata.uri]).then(self.updateGraph);
        }
      });
  },
```

Next, do the same in graphEvents to intercept double-click:

```javascript
      graphEvents: {
        doubleClick(params) {
          if (params.nodes[0]) {
            GraphApi.expand(params.nodes, self.nodesCache, self.edgesCache).then(self.updateGraph);
          }
        }
      }
```

Note that nodesCache and edgesCache are passed in here, which is needed to prevent edges from being added multiple times, and getting miscounted.

VisJS provides many event hooks for you to add behavior or draw on the canvas, `doubleClick` is just one of them. See the [VisJS documentation](http://visjs.org/docs/network/#Events) for other events. `click` and `onContext` are useful ones as well, and you can inspect the event argument to look for modifier keys.

## Styling your VisjsGraph

To give some pointers about polishing how the graph looks, and feels: you can do a lot of tweaking with graphOptions. Most interesting is setting a different default, and leveraging groups. The GraphApi by default looks for `rdf:type` links, and uses the object iri as group name for the nodes. Something like the following gives you nice fancy fontawesome icons when running this against the sample-data that comes with the grove ui templates:

```javascript
      graphOptions: {
        nodes: {
          shape: 'dot'
        },
        groups: {
          'http://xmlns.com/foaf/0.1/Person': {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf007', // fa-user icon
              color: 'green'
            }
          }
        }
      },
```

For more detail on available options, see: [http://visjs.org/docs/network/#options](http://visjs.org/docs/network/#options)

### Directive options

Out of the box, grove-vue-visjs-graph does not add any defaults on top of visjs, but ml-visjs-graph does. It tries to bundle some experience with bigger graphs, and large updates. You can override however, and you can also influence how the graph is displayed initially. ml-visjs-graph provides a ui toolbar that allows enabling/disabling physics, and picking a different layout for instance, but you can also influence them with directive options. One for layout is given above. A full list of available layouts include:

- "standard" (force-directed)
- "hierarchyTop"
- "hierarchyBottom"
- "hierarchyLeft"
- "hierarchyRight"

Next to that you can specify physics, or just turn it off by passing in `physics="false"`.

## Further Reading

It is recommended to becoming familiar with the [documentation for a VisJS network](http://visjs.org/docs/network/) and [VisJS timeline](http://visjs.org/docs/timeline/) to take full benefit of these components.
