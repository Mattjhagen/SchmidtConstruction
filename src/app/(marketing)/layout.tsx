import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LocalBusinessSchema from '@/components/marketing/LocalBusinessSchema';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessSchema />
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  );
}
