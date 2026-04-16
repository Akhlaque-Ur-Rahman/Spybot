export type CmsPageSection = {
  id: string;
  key: string;
  label: string;
  blocks: Array<{
    id: string;
    key: string;
    type: string;
    draftJson: unknown;
    liveJson: unknown;
    position: number;
  }>;
};

export type CmsPage = {
  id: string;
  key: string;
  title: string;
  slug: string;
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sections: CmsPageSection[];
};

export type NavMenuItem = {
  label: string;
  href: string;
  description?: string | null;
};
