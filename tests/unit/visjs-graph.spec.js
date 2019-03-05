import { shallowMount } from '@vue/test-utils';
import VisjsGraph from '@/components/visjs-graph.vue';

describe('visjs-graph.vue', () => {
  it('mounts without errors', () => {
    const nodes = [];
    const edges = [];
    /*const wrapper =*/
    shallowMount(VisjsGraph, {
      propsData: { nodes, edges }
    });
    expect(1).toBe(1);
  });
});
