import Link from 'next/link';
import pageStyles from '@/components/admin/adminPage.module.css';

type GuideSection = {
  title: string;
  href?: string;
};

const sections: readonly GuideSection[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Content', href: '/admin/content' },
  { title: 'Publish', href: '/admin/publish' },
  { title: 'Navigation', href: '/admin/navigation' },
  { title: 'Footer', href: '/admin/footer' },
  { title: 'SEO', href: '/admin/seo' },
  { title: 'Media', href: '/admin/media' },
  { title: 'Forms', href: '/admin/forms' },
  { title: 'Users', href: '/admin/users' },
  { title: 'Settings', href: '/admin/settings' },
  { title: 'Audit', href: '/admin/audit' },
];

export default function AdminGuidePage() {
  return (
    <>
      <h1 className={pageStyles.pageTitle}>CMS Sections</h1>
      <p className={pageStyles.lead}>Open the area you want to update.</p>

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
          <p className={pageStyles.lead} style={{ margin: 0 }}>
            Manage {section.title.toLowerCase()}.
          </p>
        </section>
      ))}
    </>
  );
}
