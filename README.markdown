# MarkLogic Grove Vue Visjs Graph

This library provides Vue components providing an interactive graph
visualization of nodes and edges. It is a wrapper for the [vanilla JS
ml-visjs-graph.js library](https://github.com/grtjn/ml-visjs-graph.js), which
itself is based on the [VisJS Network library](http://visjs.org/docs/network/).

The library is part of the MarkLogic Grove project, but could work in any Vue application.

## QuickStart

First, add the `grove-vue-visjs-graph` dependency via npm. (In a Grove Project, you will want to do this inside the `ui` directory.)

    npm install --save git+https://project.marklogic.com/repo/scm/~gjosten/grove-vue-visjs-graph.git

Then, in your application, import the `VisjsGraph` and start to use it.

```javascript
// ... other imports ...
import { GraphContainer } from 'grove-react-visjs-graph';

// ...
// ... other stuff in the parent component
  <GraphContainer startingUris={['/sample-data/data-268.json']} />
// ...
```

The `startingUris` refers to RDF URIs (see the "Data Source" section below for details.)

The `GraphContainer` is a convenience container, which attempts to fetch graph data and pass it down to the more generic `Graph` component. The follow section describes the default behavior of the `GraphContainer` and how to customize it.

However, you may also choose not to use the `GraphContainer` at all, but instead to use your own container together with the more generic `Graph` component. There is a section on using the `Graph` component further below.

## `GraphContainer`

### `GraphContainer` Defaults

#### Data Source

The provided `GraphContainer` calls a backend service, providing subject IRIs as a parameter. By default, it expects to access a MarkLogic REST endpoint at `/v1/resources/visjs`. It provides an `rs:subjects` array parameter to this endpoint, and expects to receive back the Visjs-style serialization of nodes and edges.

A usable example of such an endpoint is available in the [mlpm-visjs-graph repository](https://github.com/patrickmcelwee/mlpm-visjs-graph). You will need to install [visjs.xqy](https://github.com/patrickmcelwee/mlpm-visjs-graph/blob/master/visjs.xqy) as a REST resource and [visjs-lib.xqy](https://github.com/patrickmcelwee/mlpm-visjs-graph/blob/master/visjs-lib.xqy) as a server-side javascript module. You can customize the behavior by editing these files directly, particularly the SPARQL queries in visjs-lib.xqy.

See the README in the mlpm-visjs-graph library on how to install it on MarkLogic.

You will then either have to setup an endpoint in your Grove middle-tier that calls this REST extension, or add a legacy proxy (not recommended in general). (Eventually, we hope to spec out and ship a middle-tier endpoint.)

To add a proxy in an out-of-the-box Grove middle-tier, open `routes/index.js` and inside the `whitelist`, add:

    {
      endpoint: '/resources/visjs,
      methods: ['get'],
      authed: true
    }

NOTE: Eventually, we would like to replace this library with a default Grove middle-tier endpoint.

#### Events

The provided `GraphContainer` also sets up a single doubleClick event, which fetches nodes and edges for the node that was double-clicked and adds them to the graph.

The underlying ml-visjs-graph.ng library also sets up an `afterDrawing` event, which draws a custom orb in the top-left of each node, which contains a number specifying how many relationships that node has (or whatever else you wish to interpret the `linkCount` property on each node to mean).

### `GraphContainer` Customization

### Data Source

To change the basic behavior pass in a `fetchData()` function, which takes an array of URIs as its only argument and returns a Visjs-style serialization of nodes and edges.

```javascript
const myFetchData = uris => {
  // Inspect the source of visjs examples to see what properties nodes and
  // edges can have. Note that you can use arrays and do not need to
  // instantiate a visjs DataSet.
  // http://visjs.org/network_examples.html
  // Normally, of course, you will call out to a data service in MarkLogic,
  // a MarkLogic Grove middle-tier, or some other backend API.
  // Note that you need to return a Promise.
  return Promise.resolve({
    nodes: [
      {
        id: '1',
        label: 'The Number 1!',
        group: 'number', // optional
        linkCount: 8 // we look for this to add an small orb to the icon
      },
      {
        id: '2',
        label: 'The Only Even Prime!',
        group: 'number', // optional
        linkCount: 16 // we look for this to add an small orb to the icon
      }
    ],
    edges: [
      {
        id: 'more-2-1',
        label: 'moreThan',
        from: '2',
        to: '1'
      }
    ]
  });
};

// ...
  <GraphContainer
    startingUris={['https://marklogic.com#MarkLogicGrove']}
    fetchData={myFetchData}
  />
// ...
```

See the VisJS [nodes](http://visjs.org/docs/network/nodes.html) and [edges](http://visjs.org/docs/network/edges.html) documentation for additional VisJS properties you can add. You may also add additional, non-VisJS properties if you wish (for example, to provide content to a summary pane when a node is clicked).

### Events

VisJS provides [many event hooks for you to add behavior or draw on the canvas](http://visjs.org/docs/network/#Events). See above for the events added by default. You can override these or add additional event hooks by passing an object as an `events` option to the `<GraphContainer />`. (If you want to remove one of the event hooks defined in this library, you will have to specify an empty, 'no-op' function.)

For example, here is an 'oncontext' event handler (fired when you right-click on a node):

```javascript
<GraphContainer
  startingUris={['https://marklogic.com#MarkLogicGrove']}
  events={{
    oncontext: params => {
      params.event.preventDefault();
      console.log('Visjs right-click action called with params: ', params);
    }
  }}
/>
```

### Display options

TODO: add physics on-off, physics solver and layout as props to Graph

VisJS provides a [robust set of options to change how your graph is displayed](http://visjs.org/docs/network/#options). We have specified a default set of options in the [underlying ml-visjs-graph.js library](https://github.com/grtjn/ml-visjs-graph.js/blob/master/src/mlvisjs.global.js#L50). You can override these by passing a VisJS options object as an `options` prop to your `<GraphContainer />`. (Only the specific options you name will be changed. If you want to return to the VisJS default for an option that we have set in the visjsGraphCtrl, you will have to specify that explicitly.)

For example:

```javascript
<GraphContainer
  startingUris={['https://marklogic.com#MarkLogicGrove']}
  options={{
    edges: {
      color: {
        color: 'red'
      }
    },
    nodes: {
      color: {
        background: 'orange'
      }
    }
  }}
/>
```

#### Specify Layout

The underlying ml-visjs-graph.js library provides a few different layout options. Those include:

- "standard" (force-directed)
- "hierarchyTop"
- "hierarchyBottom"
- "hierarchyLeft"
- "hierarchyRight"

You can specify which layout you want, by passing in, for example,
`layout="'hierarchyTop'"`. The default is 'standard'.

```javascript
<GraphContainer
  startingUris={['https://marklogic.com#MarkLogicGrove']}
  layout={'hierarchyTop'}
/>
```

#### Specify Physics

You can also specify a different physics for the 'standard' (default) layout: `physics={ 'barnesHut' }`

Or turn off physics initially with `physics={false}`.

## `Graph` Component

Instead of using the provided `GraphContainer`, you can use the lower-level `Graph` component instead, which gives you more control on how to fetch data to initialize the graph and to update it. See the `GraphContainer` itself for an example of how to use it.

It takes props similar to the `GraphContainer` for events and display options.

In addition, it takes a `data` prop, which is additive. Any new data gets added to the existing visjs graph.

## More Information

I recommend becoming familiar with the [documentation for a VisJS network](http://visjs.org/docs/network/).

