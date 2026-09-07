import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bannerNeedsMobileMedia,
  isCmsBannerLayout,
  resolveBannerArtDirectedClip,
  validateBannerDraft,
} from './banner';
import { validateBlockDraftJson } from './block-draft-validation';
import { defaultDraftForBlockType } from './default-block-drafts';

const clip = {
  src: '/media/vtials_pivc.webm',
  title: 'Desktop',
  description: 'Desktop clip',
};

const mobileClip = {
  src: '/media/trading-hero.jpg',
  title: 'Mobile',
  description: 'Mobile clip',
};

test('isCmsBannerLayout accepts curated layouts only', () => {
  assert.equal(isCmsBannerLayout('fullVideo'), true);
  assert.equal(isCmsBannerLayout('splitTextMedia'), true);
  assert.equal(isCmsBannerLayout('hero'), false);
  assert.equal(bannerNeedsMobileMedia('fullVideo'), true);
  assert.equal(bannerNeedsMobileMedia('fullImage'), false);
});

test('validateBannerDraft requires media src', () => {
  assert.equal(validateBannerDraft({ layout: 'splitTextMedia' }), 'banner: media src required');
  assert.equal(validateBannerDraft({ layout: 'splitTextMedia', media: clip }), null);
});

test('validateBannerDraft requires mobile media for fullVideo', () => {
  assert.equal(
    validateBannerDraft({ layout: 'fullVideo', media: clip }),
    'banner: mobile media src required for full video',
  );
  assert.equal(
    validateBannerDraft({ layout: 'fullVideo', media: clip, mobileMedia: { src: '' } }),
    'banner: mobile media src required for full video',
  );
  assert.equal(validateBannerDraft({ layout: 'fullVideo', media: clip, mobileMedia: mobileClip }), null);
});

test('validateBannerDraft allows fullImage without mobile media', () => {
  assert.equal(validateBannerDraft({ layout: 'fullImage', media: { src: '/media/trading-hero.jpg', title: 'x', description: 'y' } }), null);
});

test('validateBannerDraft requires secondary media for dual layouts', () => {
  assert.equal(
    validateBannerDraft({ layout: 'splitImageVideo', media: clip }),
    'banner: secondary media src required',
  );
  assert.equal(
    validateBannerDraft({ layout: 'splitImageVideo', media: clip, secondaryMedia: mobileClip }),
    null,
  );
});

test('validateBannerDraft rejects unknown layout', () => {
  assert.equal(validateBannerDraft({ layout: 'wide', media: clip }), 'banner: layout must be a known banner layout');
});

test('default banner draft passes the block contract', () => {
  const draft = defaultDraftForBlockType('banner');
  const result = validateBlockDraftJson('banner', draft);
  assert.deepEqual(result, { ok: true });
});

test('fullVideo draft without mobile media fails contract', () => {
  const result = validateBlockDraftJson('banner', { layout: 'fullVideo', media: clip });
  assert.equal(result.ok, false);
  if (result.ok) throw new Error('expected failure');
  assert.match(result.error, /mobile media/);
});

test('resolveBannerArtDirectedClip prefers mobile clip on small viewports', () => {
  const desktop = { ...clip };
  const mobile = { ...mobileClip };
  assert.equal(resolveBannerArtDirectedClip(desktop, mobile, true)?.src, mobile.src);
  assert.equal(resolveBannerArtDirectedClip(desktop, mobile, false)?.src, desktop.src);
  assert.equal(resolveBannerArtDirectedClip(desktop, { src: '', title: '', description: '' }, true)?.src, desktop.src);
});
