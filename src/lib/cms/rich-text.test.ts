import test from 'node:test';
import assert from 'node:assert/strict';
import {
  legacyPlainTextToDoc,
  sanitizeCmsHref,
  validateCmsRichTextDoc,
  validateCmsRichTextField,
} from './rich-text';

test('sanitizeCmsHref allows site paths and https', () => {
  assert.equal(sanitizeCmsHref('/contact'), '/contact');
  assert.equal(sanitizeCmsHref('https://example.com/x'), 'https://example.com/x');
  assert.equal(sanitizeCmsHref('mailto:a@b.co'), 'mailto:a@b.co');
  assert.equal(sanitizeCmsHref('javascript:alert(1)'), null);
  assert.equal(sanitizeCmsHref('//evil.com'), null);
  assert.equal(sanitizeCmsHref('data:text/html,hi'), null);
});

test('validateCmsRichTextField accepts plain string', () => {
  assert.equal(validateCmsRichTextField('Hello'), null);
});

test('validateCmsRichTextDoc rejects disallowed nodes', () => {
  const bad = { type: 'doc', content: [{ type: 'bulletList' }] };
  assert.ok(validateCmsRichTextDoc(bad));
});

test('validateCmsRichTextDoc accepts minimal valid doc', () => {
  const ok = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }],
  };
  assert.equal(validateCmsRichTextDoc(ok), null);
});

test('validateCmsRichTextDoc rejects bad link href', () => {
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'x',
            marks: [{ type: 'link', attrs: { href: 'javascript:void(0)' } }],
          },
        ],
      },
    ],
  };
  assert.ok(validateCmsRichTextDoc(doc));
});

test('legacyPlainTextToDoc splits newlines into paragraphs', () => {
  const doc = legacyPlainTextToDoc('a\n\nb');
  assert.equal(doc.type, 'doc');
  assert.ok(Array.isArray(doc.content));
  assert.equal(doc.content?.length, 3);
});
