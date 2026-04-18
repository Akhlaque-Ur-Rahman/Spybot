import styles from './DecisionFlow.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { Settings, Component, MousePointerClick, Shuffle, Zap, Lightbulb } from 'lucide-react';
import { renderCmsIcon, type CmsIconName } from '@/lib/cms/icon-map';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

const decisions = [
  {
    question: 'Is Aadhaar/PAN valid?',
    yes: 'Proceed to Financial Check',
    no: 'Trigger Video KYC Flow',
  },
  {
    question: 'Does Name Match > 80%?',
    yes: 'Approve & Create Account',
    no: 'Flag for Manual Verification',
  },
  {
    question: 'Is User on PEP/Sanctions List?',
    yes: 'Block & Report to Compliance',
    no: 'Finalize Onboarding Profile',
  },
];

const contextItems = [
  { icon: <Component size={20} strokeWidth={1.5} />, title: 'Modular Integration', desc: 'Plug and play Web SDKs or raw RESTful APIs' },
  { icon: <MousePointerClick size={20} strokeWidth={1.5} />, title: 'Drag-and-Drop Builder', desc: 'Design complex journeys instantly without writing a single line of code' },
  { icon: <Shuffle size={20} strokeWidth={1.5} />, title: 'Dynamic Routing', desc: 'Fallback to alternate ID checks if primary verification fails' },
  { icon: <Zap size={20} strokeWidth={1.5} />, title: 'Instant Execution', desc: 'Sub-second API responses ensure zero UI latency' },
];

type DecisionFlowItem = {
  question: string;
  yes: string;
  no: string;
};

type DecisionFlowCapability = {
  icon: CmsIconName;
  title: string;
  desc: CmsRichTextValue;
};

export default function DecisionFlow({
  label = 'Superflow Orchestration',
  title = 'No-Code',
  gradientText = 'Workflow Builder',
  subtitle = "Don't waste engineering months. Orchestrate complex onboarding journeys combining ID, income, and background checks via our drag-and-drop Superflow.",
  panelTitle = 'Superflow Canvas',
  panelBadge = 'ACTIVE',
  items = decisions,
  capabilitiesHeading = 'Superflow Capabilities:',
  capabilities,
  noteTitle = 'Developer Friendly',
  noteText = 'Prefer writing code? The entire platform is built API-first. You can bypass the No-Code builder and consume our REST APIs directly.',
}: {
  label?: string;
  title?: string;
  gradientText?: string;
  subtitle?: CmsRichTextValue;
  panelTitle?: string;
  panelBadge?: string;
  items?: DecisionFlowItem[];
  capabilitiesHeading?: string;
  capabilities?: DecisionFlowCapability[];
  noteTitle?: string;
  noteText?: CmsRichTextValue;
}) {
  const resolvedCapabilities = capabilities
    ? capabilities.map((item) => ({
        ...item,
        icon: renderCmsIcon(item.icon, 'small'),
      }))
    : contextItems;

  return (
    <section className={styles.section} id="superflow">
      <div className={`glow-orb glow-orb-teal ${styles.glow}`} style={{ width: 400, height: 400 }} aria-hidden="true" />
      <div className="container">
        <div className={styles.header}>
          <p className="section-label">{label}</p>
          <h2 className="section-title">
            {title}{' '}
            <span className="text-gradient">{gradientText}</span>
          </h2>
          <div className={`section-subtitle ${richTextStyles.prose}`} style={{ marginTop: 16 }}>
            {renderCmsRichText(subtitle)}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left — decision tree */}
          <div className={styles.treePanel}>
            <div className={styles.treePanelHeader}>
              <span className={styles.treePanelTitle}>{panelTitle}</span>
              <span className={`badge badge-teal badge-dot`} style={{ fontSize: '0.62rem' }}>{panelBadge}</span>
            </div>
            {items.map((d, i) => (
              <div key={i} className={styles.decisionNode}>
                <div className={styles.questionBubble}>
                  <span className={styles.questionIcon} aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
                    <Settings size={18} strokeWidth={1.5} />
                  </span>
                  <span>{d.question}</span>
                </div>
                <div className={styles.branches}>
                  <div className={styles.branch}>
                    <span className={styles.branchLabel} data-type="yes">YES</span>
                    <div className={styles.branchAction} data-type="yes">{d.yes}</div>
                  </div>
                  <div className={styles.branch}>
                    <span className={styles.branchLabel} data-type="no">NO</span>
                    <div className={styles.branchAction} data-type="no">{d.no}</div>
                  </div>
                </div>
                {i < items.length - 1 && <div className={styles.nodeConnector} aria-hidden="true" />}
              </div>
            ))}
          </div>

          {/* Right — context cards */}
          <div className={styles.contextPanel}>
            <p className={styles.contextHeading}>{capabilitiesHeading}</p>
            {resolvedCapabilities.map((item) => (
              <div key={item.title} className={styles.contextCard}>
                <span className={styles.contextIcon} aria-hidden="true">{item.icon}</span>
                <div>
                  <div className={styles.contextTitle}>{item.title}</div>
                  <div className={`${styles.contextDesc} ${richTextStyles.prose}`}>{renderCmsRichText(item.desc)}</div>
                </div>
              </div>
            ))}

            <div className={styles.aiNote}>
              <div className={styles.aiNoteIcon} aria-hidden="true">
                <Lightbulb size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className={styles.aiNoteTitle}>{noteTitle}</div>
                <div className={`${styles.aiNoteText} ${richTextStyles.prose}`}>{renderCmsRichText(noteText)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
