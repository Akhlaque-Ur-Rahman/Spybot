import Hero from '@/components/Hero';
import Challenges from '@/components/Challenges';
import Lifecycle from '@/components/Lifecycle';
import Benefits from '@/components/Benefits';
import DecisionFlow from '@/components/DecisionFlow';
import DemoSection from '@/components/DemoSection';

export default function Home() {
  return (
    <main>
      <Hero />
      <Challenges />
      <Lifecycle />
      <Benefits />
      <DecisionFlow />
      <DemoSection />
    </main>
  );
}
