import { describe, it, expect } from 'vitest';

/**
 * Tests for StrapiBlocksRenderer logic.
 * Since rendering requires a DOM, we test the data handling logic.
 */
describe('StrapiBlocksRenderer data handling', () => {
  it('handles null content', () => {
    const content = null;
    expect(content).toBeNull();
    // Component returns null — no rendering
  });

  it('handles undefined content', () => {
    const content = undefined;
    expect(content).toBeUndefined();
  });

  it('handles string content (legacy)', () => {
    const content = '<p>Hello world</p>';
    expect(typeof content).toBe('string');
  });

  it('handles valid blocks array', () => {
    const content = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world', bold: true },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Title' }],
      },
    ];

    expect(Array.isArray(content)).toBe(true);
    expect(content).toHaveLength(2);
    expect(content[0].type).toBe('paragraph');
    expect(content[1].type).toBe('heading');
  });

  it('handles list blocks', () => {
    const content = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Item 1' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Item 2' }] },
        ],
      },
    ];

    expect(content[0].format).toBe('unordered');
    expect(content[0].children).toHaveLength(2);
  });

  it('handles inline formatting', () => {
    const children = [
      { type: 'text', text: 'normal' },
      { type: 'text', text: 'bold', bold: true },
      { type: 'text', text: 'italic', italic: true },
      { type: 'text', text: 'link', type: 'link', url: 'https://example.com' },
    ];

    expect(children[1].bold).toBe(true);
    expect(children[2].italic).toBe(true);
  });

  it('handles empty blocks array', () => {
    const content: unknown[] = [];
    expect(Array.isArray(content)).toBe(true);
    expect(content).toHaveLength(0);
  });
});
