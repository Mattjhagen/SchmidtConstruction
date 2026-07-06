import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LocalBusinessSchema from '@/components/marketing/LocalBusinessSchema';
import AdminPreviewBar from '@/components/admin/AdminPreviewBar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessSchema />
      <AdminPreviewBar />
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  );
}
