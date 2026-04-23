import { z } from 'zod';
import { getCmsBlockContract } from '@/lib/cms/block-contracts';
import { isCmsBlockType } from '@/lib/cms/page-registry';

const draftObject = z.record(z.string(), z.unknown());

export function validateBlockDraftJson(
  blockType: string,
  draftJson: unknown,
): { ok: true } | { ok: false; error: string } {
  const parsed = draftObject.safeParse(draftJson);
  if (!parsed.success) {
    return { ok: false, error: 'Block draft must be a JSON object' };
  }
  if (!isCmsBlockType(blockType)) {
    return { ok: true };
  }
  const contract = getCmsBlockContract(blockType);
  const msg = contract.validateDraft(parsed.data);
  if (msg) return { ok: false, error: msg };
  return { ok: true };
}
