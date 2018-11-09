import { shallowMount } from '@vue/test-utils';
import VisjsGraph from '@/components/visjs-graph.vue';

describe('visjs-graph.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(VisjsGraph, {
      propsData: { msg }
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
