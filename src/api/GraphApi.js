import { polyfill } from 'es6-promise';
import 'isomorphic-fetch';

polyfill();

var api = '/v1/graphs/sparql';

function buildUrl(path, params) {
  var url = new URL(api + path, window.location.href);
  if (params) {
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
        params[key].map(param => url.searchParams.append(key, param));
      } else {
        url.searchParams.append(key, params[key]);
      }
    });
  }
  return url;
}

function sparql(query, bindings) {
  var params = bindings;
  var body = query;
  return fetch(buildUrl('', params), {
    method: 'POST',
    headers: {
      'content-type': 'application/sparql-query',
      accept: 'application/sparql-results+json'
    },
    body: body,
    credentials: 'same-origin'
  }).then(
    response => {
      return response.json();
    },
    error => {
      return error;
    }
  );
}

function toLabel(iri) {
  return iri.replace(/^(.*[/#])?([^/#]+)$/, '$2');
}

function filterSemIris(iris) {
  return iris.filter(function(iri) {
    return iri.substring(0, 4) === 'http' || iri.substring(0, 1) === '/';
  });
}

function filterStrIris(iris) {
  return iris.filter(function(iri) {
    return iri.substring(0, 4) !== 'http' && iri.substring(0, 1) !== '/';
  });
}

export default {
  name: 'GraphApi',
  expand(iris, nodes, edges) {
    if (!iris || !iris.length) {
      return new Promise(resolve => resolve({ nodes: [], edges: [] }));
    }

    nodes = nodes || {};
    edges = edges || {};

    var semIris = filterSemIris(iris);
    var strIris = filterStrIris(iris);
    var bindings = {
      'bind:subjects': semIris,
      'bind:revSubjects': semIris,
      'bind:subjects:string': strIris,
      'bind:revSubjects:string': strIris
    };

    iris.forEach(function(iri) {
      if (!nodes[iri]) {
        nodes[iri] = {
          id: iri,
          label: toLabel(iri)
        };
      }
    });

    return sparql(
      ' \
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n\
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n\
      PREFIX ssw: <http://schema.semantic-web.at/ppt/> \n\
      PREFIX prov: <http://www.w3.org/ns/prov#>\n\
      SELECT DISTINCT \n\
        ?subjectIri \n\
        ?predicateIri \n\
        ?predicateType \n\
        (COALESCE(?predicateLabel, ?predicateSkosLabel, ?predicateType, ?predicateIri) AS ?predicate) \n\
        ?forward \n\
        ?objectIri \n\
      WHERE { \n\
        { \n\
          # forward links \n\
          ?subjectIri ?predicateIri ?objectIri . \n\
          FILTER( ?subjectIri = ?subjects ) \n\
          BIND( true as ?forward ) \n\
        } \n\
        UNION { \n\
          # reverse links \n\
          ?objectIri ?predicateIri ?subjectIri . \n\
          FILTER( ?subjectIri = ?revSubjects ) \n\
          BIND( false as ?forward ) \n\
        } \n\
        OPTIONAL { \n\
          ?predicateIri rdfs:label ?predicateLabel . \n\
        } \n\
        OPTIONAL { \n\
          ?predicateIri skos:prefLabel ?predicateSkosLabel . \n\
        } \n\
        OPTIONAL { \n\
          ?predicateIri a ?predicateType . \n\
        } \n\
        FILTER( !(?predicateIri = (rdf:type, ssw:propagateType, skos:broader, skos:narrower, rdfs:label, skos:prefLabel, skos:altLabel)) ) \n\
        FILTER( ISIRI(?objectIri) ) \n\
      } LIMIT ' +
        iris.length +
        '00 \n\
    ',
      bindings
    ).then(function(response) {
      response.results.bindings.forEach(function(binding) {
        var fromId = binding.subjectIri.value;
        var toId = binding.objectIri.value;
        var predicateId = binding.predicateIri.value;
        var predicateGroup = binding.predicateType
          ? binding.predicateType.value
          : 'unknown';
        var predicateLabel = toLabel(binding.predicate.value);

        if (binding.forward.value === 'false') {
          // reverse link, flip to and from
          var tmp = toId;
          toId = fromId;
          fromId = tmp;
        }

        if (!nodes[fromId]) {
          nodes[fromId] = {
            id: fromId,
            label: toLabel(fromId),
            group: 'unknown'
          };
        }

        if (!nodes[toId]) {
          nodes[toId] = {
            id: toId,
            label: toLabel(toId),
            group: 'unknown'
          };
        }

        var edgeId = fromId + '-' + predicateId + '-' + toId;
        edges[edgeId] = {
          id: edgeId,
          label: predicateLabel,
          group: predicateGroup,
          from: fromId,
          to: toId
        };
      });

      var iris = Object.keys(nodes);
      var semIris = filterSemIris(iris);
      var strIris = filterStrIris(iris);
      var bindings = {
        'bind:subjects': semIris,
        'bind:subjects:string': strIris
      };

      // jshint multistr: true
      return sparql(
        ' \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n\
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n\
        PREFIX ssw: <http://schema.semantic-web.at/ppt/> \n\
        SELECT DISTINCT \n\
          ?subjectIri \n\
          (COALESCE(?subjectSkosType1, ?subjectSkosType2, ?subjectSkosType3, ?subjectSkosType4, ?subjectSkosType5, ?subjectSkosType6, ?subjectRdfType) AS ?subjectType) \n\
          (COALESCE(?subjectLabel, ?subjectSkosLabel, ?subjectIri) AS ?subject) \n\
        WHERE { \n\
          { \n\
            ?subjectIri ?p ?o. \n\
          } UNION { \n\
            ?o ?p ?subjectIri. \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri a ?subjectRdfType . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri rdfs:label ?subjectLabel . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:prefLabel ?subjectSkosLabel . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri ssw:propagateType ?subjectSkosType1 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/ssw:propagateType ?subjectSkosType2 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/ssw:propagateType ?subjectSkosType3 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/skos:broader/ssw:propagateType ?subjectSkosType4 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/skos:broader/skos:broader/ssw:propagateType ?subjectSkosType5 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/skos:broader/skos:broader/skos:broader/ssw:propagateType ?subjectSkosType6 . \n\
          } \n\
          FILTER( ?subjectIri = ?subjects ) \n\
        } \n\
      ',
        bindings
      ).then(function(response) {
        // jshint multistr: false

        response.results.bindings.forEach(function(binding) {
          var subjectId = binding.subjectIri.value;
          var subjectGroup = binding.subjectType
            ? binding.subjectType.value
            : 'unknown';
          var subjectLabel = toLabel(binding.subject.value);

          if (!nodes[subjectId]) {
            nodes[subjectId] = {
              id: subjectId,
              label: subjectLabel,
              group: subjectGroup
            };
          } else {
            nodes[subjectId].label = subjectLabel;
            nodes[subjectId].group = subjectGroup;
          }
        });

        // reset visibleLinks
        Object.keys(nodes).forEach(function(key) {
          var node = nodes[key];
          node.visibleLinks = 0;
        });

        // recalc visibleLinks from scratch
        Object.keys(edges).forEach(function(key) {
          var edge = edges[key];
          nodes[edge.from].visibleLinks += 1;
          nodes[edge.to].visibleLinks += 1;
        });

        var iris = Object.keys(nodes);
        var semIris = filterSemIris(iris);
        var strIris = filterStrIris(iris);
        var bindings = {
          'bind:subjects': semIris,
          'bind:revSubjects': semIris,
          'bind:subjects:string': strIris,
          'bind:revSubjects:string': strIris
        };

        // jshint multistr: true
        return sparql(
          ' \
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n\
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
          PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n\
          PREFIX ssw: <http://schema.semantic-web.at/ppt/> \n\
          SELECT DISTINCT \n\
            ?subjectIri \n\
            (COUNT(?predicateIri) AS ?linkCount) \n\
          WHERE { \n\
            { \n\
              # forward links \n\
              ?subjectIri ?predicateIri ?objectIri . \n\
              FILTER( ?subjectIri = ?subjects ) \n\
            } \n\
            UNION { \n\
              # reverse links \n\
              ?objectIri ?predicateIri ?subjectIri . \n\
              FILTER( ?subjectIri = ?revSubjects ) \n\
            } \n\
            FILTER( !(?predicateIri = (rdf:type, ssw:propagateType, skos:broader, skos:narrower, rdfs:label, skos:prefLabel, skos:altLabel)) ) \n\
            FILTER( ISIRI(?objectIri) ) \n\
          } GROUP BY ?subjectIri \n\
        ',
          bindings
        ).then(function(response) {
          // jshint multistr: false

          response.results.bindings.forEach(function(binding) {
            var subjectId = binding.subjectIri.value;
            var linkCount = +binding.linkCount.value;

            var node = nodes[subjectId];

            if (!node) {
              node = nodes[subjectId] = {
                id: subjectId,
                label: toLabel(subjectId),
                group: 'unknown',
                totalLinks: linkCount
              };
            } else {
              node.totalLinks = linkCount;
            }

            if (node.totalLinks) {
              node.orbs = node.orbs || {};
              node.orbs.NE = {
                label: node.totalLinks
              };
            }
            if (node.visibleLinks) {
              node.orbs = node.orbs || {};
              node.orbs.NW = {
                label: node.visibleLinks
              };
              var nodeSize = 20 + Math.log10(node.visibleLinks) * 40;
              node.icon = { size: nodeSize };
            }
          });

          return {
            nodes: { ...nodes },
            edges: { ...edges }
          };
        });
      });
    });
  }
};
