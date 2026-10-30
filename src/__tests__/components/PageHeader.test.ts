import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PageHeader from '@/components/PageHeader.vue';

describe('PageHeader', () => {
  it('zobrazí nadpis, popis a štítok a použije zadanú farbu', () => {
    const wrapper = mount(PageHeader, {
        props: { color: '#ff0000', label: 'Trips', title: 'My trips', description: 'All your plans' },
    });

    expect(wrapper.find('h1').text()).toBe('My trips');
    expect(wrapper.text()).toContain('All your plans');
    expect(wrapper.text()).toContain('Trips');
    expect(wrapper.find('.tag-mono').attributes('style')).toContain('color');
  });
});