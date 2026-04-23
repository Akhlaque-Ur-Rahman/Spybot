'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextAreaField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';

export type SettingRow = { id: string; key: string; valueJson: unknown };

export default function SettingsEditorClient({ settings }: { settings: SettingRow[] }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [textByKey, setTextByKey] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const s of settings) {
      o[s.key] = JSON.stringify(s.valueJson ?? {}, null, 2);
    }
    return o;
  });
  const [saving, setSaving] = useState<string | null>(null);

  async function save(key: string) {
    const raw = textByKey[key] ?? '{}';
    let valueJson: unknown;
    try {
      valueJson = JSON.parse(raw) as unknown;
    } catch (err) {
      logAdminClientError('SettingsEditorClient.save parse', err, { key });
      push('Data format is not valid. Please check and try again.', 'error');
      return;
    }
    setSaving(key);
    try {
      await fetchJson('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ key, valueJson }),
      });
      push('Setting saved.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('SettingsEditorClient.save', e, { key });
      push(e instanceof Error ? e.message : 'Could not save setting. Please try again.', 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {settings.map((s) => (
        <article key={s.id} className={pageStyles.card}>
          <h3 className={pageStyles.cardTitle}>{s.key}</h3>
          <TextAreaField
            label="Data"
            value={textByKey[s.key] ?? '{}'}
            onChange={(v) => setTextByKey((p) => ({ ...p, [s.key]: v }))}
          />
          <button type="button" className={pageStyles.btn} style={{ marginTop: 12 }} disabled={saving === s.key} onClick={() => save(s.key)}>
            {saving === s.key ? 'Saving…' : 'Save setting'}
          </button>
        </article>
      ))}
    </div>
  );
}
