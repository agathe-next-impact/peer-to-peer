'use client';

import React from 'react';
import DOMPurify from 'dompurify';

// ---------------------------------------------------------------------------
// Types for the Strapi v4 Blocks JSON format
// ---------------------------------------------------------------------------

interface TextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

interface LinkNode {
  type: 'link';
  url: string;
  children: InlineNode[];
}

type InlineNode = TextNode | LinkNode;

interface ParagraphBlock {
  type: 'paragraph';
  children: InlineNode[];
}

interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

interface ListItemBlock {
  type: 'list-item';
  children: InlineNode[];
}

interface ListBlock {
  type: 'list';
  format: 'ordered' | 'unordered';
  children: ListItemBlock[];
}

interface ImageBlock {
  type: 'image';
  image: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
  children?: InlineNode[];
}

interface QuoteBlock {
  type: 'quote';
  children: InlineNode[];
}

interface CodeBlock {
  type: 'code';
  children: InlineNode[];
}

type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StrapiBlocksRendererProps {
  content: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitize(html: string): string {
  if (typeof window === 'undefined') {
    // During SSR, DOMPurify requires a DOM — return the raw text as a fallback.
    // The component is marked 'use client', so this path is rarely hit.
    return html;
  }
  return DOMPurify.sanitize(html);
}

function isBlockArray(value: unknown): value is Block[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'type' in value[0];
}

// ---------------------------------------------------------------------------
// Inline rendering
// ---------------------------------------------------------------------------

function renderInlineNode(node: InlineNode, index: number): React.ReactNode {
  if (node.type === 'link') {
    return (
      <a
        key={index}
        href={sanitize(node.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-700 underline hover:text-primary-900"
      >
        {node.children.map((child, i) => renderInlineNode(child, i))}
      </a>
    );
  }

  // TextNode
  const text = node as TextNode;
  if (!text.text) return null;

  let element: React.ReactNode = text.text;

  if (text.code) {
    element = (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
        {element}
      </code>
    );
  }
  if (text.bold) {
    element = <strong>{element}</strong>;
  }
  if (text.italic) {
    element = <em>{element}</em>;
  }
  if (text.underline) {
    element = <u>{element}</u>;
  }
  if (text.strikethrough) {
    element = <s>{element}</s>;
  }

  return <React.Fragment key={index}>{element}</React.Fragment>;
}

function renderInlineNodes(children: InlineNode[]): React.ReactNode[] {
  return children.map((child, i) => renderInlineNode(child, i));
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------

function renderBlock(block: Block, index: number): React.ReactNode {
  switch (block.type) {
    case 'paragraph':
      return <p key={index}>{renderInlineNodes(block.children)}</p>;

    case 'heading': {
      const Tag = `h${block.level}` as keyof Pick<
        JSX.IntrinsicElements,
        'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      >;
      return <Tag key={index}>{renderInlineNodes(block.children)}</Tag>;
    }

    case 'list': {
      const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={index}>
          {block.children.map((item, i) => (
            <li key={i}>{renderInlineNodes(item.children)}</li>
          ))}
        </ListTag>
      );
    }

    case 'image': {
      const { url, alternativeText, width, height } = block.image;
      return (
        <figure key={index}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sanitize(url)}
            alt={alternativeText || ''}
            width={width}
            height={height}
            className="rounded-lg"
            loading="lazy"
          />
          {alternativeText && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {alternativeText}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'quote':
      return (
        <blockquote key={index}>
          {renderInlineNodes(block.children)}
        </blockquote>
      );

    case 'code':
      return (
        <pre key={index} className="overflow-x-auto rounded-lg bg-muted p-4">
          <code className="text-sm font-mono">
            {block.children.map((child) => (child as TextNode).text).join('')}
          </code>
        </pre>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StrapiBlocksRenderer({ content }: StrapiBlocksRendererProps) {
  if (content === null || content === undefined) {
    return null;
  }

  // Legacy: plain string content
  if (typeof content === 'string') {
    if (!content.trim()) return null;
    return (
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitize(content) }}
      />
    );
  }

  // Strapi Blocks JSON format
  if (isBlockArray(content)) {
    return (
      <div className="prose prose-lg max-w-none">
        {content.map((block, index) => renderBlock(block, index))}
      </div>
    );
  }

  // Unknown format — render nothing
  return null;
}
