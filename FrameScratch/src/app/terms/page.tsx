import { PageShell } from "@/components/SiteChrome";

export const metadata = { title: "Terms of Service - FrameScratch" };

export default function Terms() {
  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-16 prose prose-slate">
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="font-semibold mt-6 mb-2">Use of this tool</h2>
        <p className="text-slate-700 mb-4">
          FrameScratch is provided as a free, browser-based tool to convert video clips into
          image sequences for use as Scratch costumes. You are responsible for ensuring you have
          the rights to any video content you process.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Copyright</h2>
        <p className="text-slate-700 mb-4">
          Do not use this tool to extract frames from copyrighted material you do not own or have
          permission to use. FrameScratch does not host, store, or distribute any video or image
          content - all processing happens locally in your browser, and you are solely
          responsible for how you use the output.
        </p>

        <h2 className="font-semibold mt-6 mb-2">No warranty</h2>
        <p className="text-slate-700 mb-4">
          This tool is provided &quot;as is&quot; without warranty of any kind. We do not
          guarantee uninterrupted availability or that output will be error-free.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Limitation of liability</h2>
        <p className="text-slate-700 mb-4">
          FrameScratch and its creators are not liable for any damages arising from use of this
          tool, including but not limited to copyright claims arising from user-submitted content.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Changes</h2>
        <p className="text-slate-700">
          These terms may be updated from time to time. Continued use of the site constitutes
          acceptance of the current terms.
        </p>
      </div>
    </PageShell>
  );
}
