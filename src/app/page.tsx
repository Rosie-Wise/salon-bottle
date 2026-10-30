import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Hero } from '@/components/home/hero';
import { CustomizationStudio } from '@/components/studio/customization-studio';
import { HowItWorks } from '@/components/home/how-it-works';
import { ProductInfo } from '@/components/home/product-info';
import { Faq } from '@/components/home/faq';
import { Cta } from '@/components/home/cta';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <CustomizationStudio />
        <HowItWorks />
        <ProductInfo />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
