'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextAreaField, TextField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import type { NavMenuItem } from '@/lib/cms/types';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';
import type { CmsFooterSettings } from '@/lib/cms/footer-settings';

type ColumnState = { heading: string; links: NavMenuItem[] };

export default function FooterEditorClient({ footer }: { footer: CmsFooterSettings }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();

  const initialColumns = useMemo<ColumnState[]>(
    () =>
      Object.entries(footer.columns).map(([heading, links]) => ({
        heading,
        links: links.map((l) => ({ ...l })),
      })),
    [footer.columns]
  );

  const [columns, setColumns] = useState<ColumnState[]>(() => initialColumns);
  const [socialLinks, setSocialLinks] = useState<NavMenuItem[]>(() => footer.socialLinks.map((item) => ({ ...item })));
  const [legalName, setLegalName] = useState(footer.companyDetails.legalName);
  const [addressLinesText, setAddressLinesText] = useState(footer.companyDetails.addressLines.join('\n'));
  const [phone, setPhone] = useState(footer.companyDetails.phone);
  const [cin, setCin] = useState(footer.companyDetails.cin);
  const [certificationsText, setCertificationsText] = useState(footer.companyDetails.certifications.join('\n'));
  const [trustItemsText, setTrustItemsText] = useState(footer.trustItems.join('\n'));
  const [creditPrefix, setCreditPrefix] = useState(footer.credit.prefix);
  const [creditLabel, setCreditLabel] = useState(footer.credit.linkLabel);
  const [creditHref, setCreditHref] = useState(footer.credit.href);
  const [saving, setSaving] = useState(false);

  function updateLink(colIdx: number, linkIdx: number, patch: Partial<NavMenuItem>) {
    setColumns((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      const links = [...col.links];
      links[linkIdx] = { ...links[linkIdx]!, ...patch };
      next[colIdx] = { ...col, links };
      return next;
    });
  }

  function moveLink(colIdx: number, linkIdx: number, delta: number) {
    setColumns((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      const links = [...col.links];
      const t = linkIdx + delta;
      if (t < 0 || t >= links.length) return prev;
      const tmp = links[linkIdx]!;
      links[linkIdx] = links[t]!;
      links[t] = tmp;
      next[colIdx] = { ...col, links };
      return next;
    });
  }

  function addLink(colIdx: number) {
    setColumns((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      next[colIdx] = { ...col, links: [...col.links, { label: 'New link', href: '/' }] };
      return next;
    });
  }

  function removeLink(colIdx: number, linkIdx: number) {
    setColumns((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      next[colIdx] = { ...col, links: col.links.filter((_, i) => i !== linkIdx) };
      return next;
    });
  }

  function updateSocial(linkIdx: number, patch: Partial<NavMenuItem>) {
    setSocialLinks((prev) => prev.map((item, i) => (i === linkIdx ? { ...item, ...patch } : item)));
  }

  function addSocial() {
    setSocialLinks((prev) => [...prev, { label: 'Social', href: 'https://' }]);
  }

  function removeSocial(linkIdx: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== linkIdx));
  }

  function textLines(value: string) {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, NavMenuItem[]> = {};
      for (const col of columns) {
        payload[col.heading.trim() || 'Column'] = col.links.map((l) => ({
          label: l.label.trim(),
          href: l.href.trim(),
          description: l.description ?? null,
        }));
      }
      await fetchJson('/api/admin/footer', {
        method: 'PATCH',
        body: JSON.stringify({
          columns: payload,
          socialLinks: socialLinks.map((l) => ({ label: l.label.trim(), href: l.href.trim() })),
          companyDetails: {
            legalName: legalName.trim(),
            addressLines: textLines(addressLinesText),
            phone: phone.trim(),
            cin: cin.trim(),
            certifications: textLines(certificationsText),
          },
          trustItems: textLines(trustItemsText),
          credit: {
            prefix: creditPrefix.trim(),
            linkLabel: creditLabel.trim(),
            href: creditHref.trim(),
          },
        }),
      });
      push('Footer saved.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('FooterEditorClient.save', e);
      push(e instanceof Error ? e.message : 'Could not save footer. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={pageStyles.card}>
      <div className={pageStyles.row} style={{ justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <h2 className={pageStyles.cardTitle} style={{ margin: 0 }}>
          Footer columns
        </h2>
        <button type="button" className={pageStyles.btn} disabled={saving} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save footer'}
        </button>
      </div>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <div className={pageStyles.card} style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
          <h3 className={pageStyles.cardTitle}>Company details</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <TextField label="Legal name" value={legalName} onChange={setLegalName} />
            <TextAreaField label="Address lines (one per line)" value={addressLinesText} onChange={setAddressLinesText} rows={4} />
            <TextField label="Phone" value={phone} onChange={setPhone} />
            <TextField label="CIN" value={cin} onChange={setCin} />
            <TextAreaField label="Certifications (one per line)" value={certificationsText} onChange={setCertificationsText} rows={3} />
            <TextAreaField label="Trust line items (one per line)" value={trustItemsText} onChange={setTrustItemsText} rows={4} />
          </div>
        </div>

        <div className={pageStyles.card} style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
          <h3 className={pageStyles.cardTitle}>Social links</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {socialLinks.map((link, linkIdx) => (
              <li key={`social-${linkIdx}`} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <TextField label="Label" value={link.label} onChange={(v) => updateSocial(linkIdx, { label: v })} />
                  <TextField label="URL" value={link.href} onChange={(v) => updateSocial(linkIdx, { href: v })} />
                </div>
                <div className={pageStyles.row} style={{ marginTop: 8 }}>
                  <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => removeSocial(linkIdx)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={addSocial}>
            Add social link
          </button>
        </div>

        <div className={pageStyles.card} style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
          <h3 className={pageStyles.cardTitle}>Credit</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <TextField label="Prefix" value={creditPrefix} onChange={setCreditPrefix} />
            <TextField label="Link label" value={creditLabel} onChange={setCreditLabel} />
            <TextField label="Link URL" value={creditHref} onChange={setCreditHref} />
          </div>
        </div>

        {columns.map((col, colIdx) => (
          <div key={col.heading} className={pageStyles.card} style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
            <TextField
              label="Column heading"
              value={col.heading}
              onChange={(v) =>
                setColumns((prev) => {
                  const next = [...prev];
                  next[colIdx] = { ...next[colIdx]!, heading: v };
                  return next;
                })
              }
            />
            <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-3) 0 0' }}>
              {col.links.map((link, linkIdx) => (
                <li key={`${colIdx}-${linkIdx}`} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <TextField
                      label="Label"
                      value={link.label}
                      onChange={(v) => updateLink(colIdx, linkIdx, { label: v })}
                    />
                    <TextField label="URL" value={link.href} onChange={(v) => updateLink(colIdx, linkIdx, { href: v })} />
                  </div>
                  <div className={pageStyles.row} style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                      onClick={() => moveLink(colIdx, linkIdx, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                      onClick={() => moveLink(colIdx, linkIdx, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                      onClick={() => removeLink(colIdx, linkIdx)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => addLink(colIdx)}>
              Add link
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
