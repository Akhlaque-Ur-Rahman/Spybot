import Link from 'next/link';
import pageStyles from '@/components/admin/adminPage.module.css';

const sections = [
  {
    title: 'Recommended workflow',
    points: [
      'Start in Overview to see page counts, form activity, and quick shortcuts.',
      'Open Content to import default pages or create a new page.',
      'Edit page details, update blocks, reorder sections, then use Preview draft to review the page.',
      'Publish from the page editor or from Publish queue when the draft is ready.',
      'Use Navigation, Footer, and SEO after content changes so menus and metadata stay aligned.',
    ],
  },
  {
    title: 'Overview',
    href: '/admin',
    points: [
      'Shows totals for pages, forms, media, users, and navigation menus.',
      'Lists recently updated pages, latest submissions, and recent audit activity.',
      'Use the quick action buttons to jump into each CMS section.',
    ],
  },
  {
    title: 'Content',
    href: '/admin/content',
    points: [
      'Import default pages from the site template or create a new custom page.',
      'Open any page to change its title, public URL, and section/block content.',
      'Use Save page details for title and URL changes, and Save all changes for block drafts.',
      'Preview draft opens the unpublished draft view before you push it live.',
      'You can reorder sections, add new sections, duplicate pages, and remove custom pages.',
    ],
  },
  {
    title: 'Publish',
    href: '/admin/publish',
    points: [
      'Draft pages appear in the publish queue.',
      'Publish moves the latest draft content and page details live.',
      'Recent versions lets you rollback to a previous published version if needed.',
    ],
  },
  {
    title: 'Navigation',
    href: '/admin/navigation',
    points: [
      '`header-main` is the main public navbar.',
      '`header-utility` is the slim top bar above the main navbar.',
      'Main menu item order, labels, and URLs are editable. Company, Industries, Solution, and Resources keep dropdown panels while the item still maps to that section.',
      'If you add a completely custom main menu item, it is shown as a normal link without a dropdown.',
      'Utility links are simple links only.',
    ],
  },
  {
    title: 'Footer',
    href: '/admin/footer',
    points: [
      'Controls footer column headings and the links inside each column.',
      'Use it when the bottom-of-site navigation needs to match new pages or campaigns.',
    ],
  },
  {
    title: 'SEO',
    href: '/admin/seo',
    points: [
      'Set per-page meta title and meta description.',
      'On-page headings and body copy still come from Content.',
    ],
  },
  {
    title: 'Media',
    href: '/admin/media',
    points: [
      'Add media assets by URL with optional alt text and tags.',
      'Search, filter, sort, and page through the media library when reusing assets.',
    ],
  },
  {
    title: 'Forms',
    href: '/admin/forms',
    points: [
      'Review incoming form submissions.',
      'Open Details to inspect the payload and update each submission status.',
    ],
  },
  {
    title: 'Users',
    href: '/admin/users',
    points: [
      'Owners can create CMS users and assign OWNER, EDITOR, or REVIEWER roles.',
      'Use this page to update access when team responsibilities change.',
    ],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    points: [
      'Global settings are edited as raw JSON.',
      'Invalid JSON is rejected, so change this page carefully.',
    ],
  },
  {
    title: 'Audit',
    href: '/admin/audit',
    points: [
      'Audit log shows recent CMS actions and who performed them.',
      'Use it to verify changes after publishing or access updates.',
    ],
  },
] as const;

export default function AdminGuidePage() {
  return (
    <>
      <h1 className={pageStyles.pageTitle}>CMS Guide</h1>
      <p className={pageStyles.lead}>
        This page explains what each CMS section does and the normal editing flow for day-to-day content work.
      </p>

      {sections.map((section) => (
        <section key={section.title} className={pageStyles.card}>
          <div className={pageStyles.sectionHead}>
            <h2 className={pageStyles.cardTitle}>{section.title}</h2>
            {section.href ? (
              <Link href={section.href} className={pageStyles.sectionLink}>
                Open section
              </Link>
            ) : null}
          </div>
          <ul className={pageStyles.list}>
            {section.points.map((point) => (
              <li key={point} className={pageStyles.listItem}>
                {point}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
