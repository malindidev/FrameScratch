import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-500 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Runs entirely in your browser
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Turn any video into <span className="text-orange-500">Scratch costumes</span>
        </h1>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto">
          FrameScratch splits a clip into frame-by-frame images, packages them for
          Scratch&apos;s costume importer, and shows you the exact blocks to animate it.
        </p>
        <a
          href="#tool"
          className="inline-block mt-8 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium px-6 py-3 rounded-lg"
        >
          Start extracting frames
        </a>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Private by design",
    body: "Your video never leaves your device. Extraction happens locally with the browser's video and canvas APIs.",
  },
  {
    title: "Trim before you extract",
    body: "Drag a start and end handle so you only extract the part of the clip you actually need.",
  },
  {
    title: "Control size & format",
    body: "Choose PNG or compressed JPEG, and scale resolution down to keep your costume pack lightweight.",
  },
  {
    title: "Ready-made blocks",
    body: "We calculate the exact wait time for your chosen frame rate and show you the block stack to build in Scratch.",
  },
  {
    title: "Audio extraction",
    body: "Pull the soundtrack out as a Scratch-friendly WAV and get the matching sound block added to your stack.",
  },
  {
    title: "Sprite sheet mode",
    body: "Export every frame as one sprite sheet with a JSON file, ready for game engines and other tools.",
  },
];

export function Features() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-14">
      <h2 className="text-xl font-semibold text-center mb-8">What you get</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <div className="group h-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-orange-300">
              <div className="w-8 h-1 rounded-full bg-orange-200 mb-3 transition-all duration-300 group-hover:w-14 group-hover:bg-orange-500" />
              <h3 className="font-medium mb-1.5 transition-colors duration-300 group-hover:text-orange-600">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { n: "1", t: "Upload a clip", d: "Any common video format your browser can play." },
  { n: "2", t: "Set your options", d: "Trim range, frame rate, resolution, format, and audio." },
  { n: "3", t: "Extract & download", d: "Get a ZIP of numbered frames or a single sprite sheet." },
  { n: "4", t: "Import to Scratch", d: "Upload the images as costumes, then build the blocks shown." },
];

export function HowItWorks() {
  return (
    <section className="bg-white border-y border-slate-200">
      <div className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-xl font-semibold text-center mb-8">How it works</h2>
        <div className="grid sm:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="group text-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-semibold flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                  {s.n}
                </div>
                <h3 className="font-medium text-sm mb-1">{s.t}</h3>
                <p className="text-xs text-slate-500">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}