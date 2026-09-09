import { PageShell } from "@/components/SiteChrome";

export const metadata = { title: "FAQ - FrameScratch" };

const faqs = [
  {
    q: "How do I import the images into Scratch as costumes?",
    a: "Unzip the downloaded costumes.zip. In the Scratch editor, add a new sprite, open its Costumes tab, click the upload (folder) icon, and select all the extracted images at once - Scratch will import them in order as a01, a02, a03, and so on.",
  },
  {
    q: "Why does the block stack use 'wait' with a specific number?",
    a: "Scratch's 'next costume' block advances one frame per click, so the wait time controls playback speed - we calculate wait = 1 / your chosen FPS so the costumes flip at the same rate they were extracted, keeping the motion smooth.",
  },
  {
    q: "How many frames should I extract?",
    a: "Scratch can technically handle hundreds of costumes per sprite - but very large costume counts slow down the editor and increase project file size. For short clips (under 15 seconds) at 10-15 FPS works well. For longer clips, consider trimming to just the part you need.",
  },
  {
    q: "PNG or JPEG - which should I pick?",
    a: "PNG keeps full quality but produces larger files - JPEG compresses the images, which is useful if you're extracting a lot of frames and want a smaller ZIP and faster Scratch upload. Start around 80-85% quality for a good balance.",
  },
  {
    q: "Is my video uploaded anywhere?",
    a: "No. All extraction happens locally in your browser using the HTML5 video and canvas APIs. Your file never leaves your device - see our Privacy Policy for details.",
  },
  {
    q: "Can I add sound too?",
    a: "FrameScratch focuses on the visual frames. To add audio, export or trim your original audio separately, upload it to Scratch's Sounds tab for the same sprite, and use a 'play sound until done' block alongside your costume loop - similar to how the original project layered a broadcast + sound block.",
  },
];

export default function FAQ() {
  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Frequently Asked Questions</h1>
        <div className="flex flex-col gap-6">
          {faqs.map((f) => (
            <div key={f.q} className="border-b border-slate-200 pb-6">
              <h2 className="font-semibold mb-2">{f.q}</h2>
              <p className="text-sm text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
