import FrameExtractor from "@/components/FrameExtractor";
import { PageShell } from "@/components/SiteChrome";
import { Hero, Features, HowItWorks } from "@/components/Landing";

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <Features />
      <HowItWorks />
      <FrameExtractor />
    </PageShell>
  );
}
