import { PageShell } from "@/components/SiteChrome";

export const metadata = { title: "Privacy Policy - FrameScratch" };

export default function Privacy() {
  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-16 prose prose-slate">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="font-semibold mt-6 mb-2">How FrameScratch handles your video</h2>
        <p className="text-slate-700 mb-4">
          FrameScratch processes your video entirely in your browser. Your file is never uploaded
          to our servers - frame extraction happens locally using your browser&apos;s video and
          canvas APIs, and the resulting ZIP file is generated and downloaded directly on your
          device.
        </p>

        <h2 className="font-semibold mt-6 mb-2">What we don&apos;t collect</h2>
        <p className="text-slate-700 mb-4">
          We do not collect, store, or have access to the videos or images you process, and we do
          not require an account to use this tool.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Analytics</h2>
        <p className="text-slate-700 mb-4">
          We may use basic, privacy-respecting analytics (such as aggregate page-view counts) to
          understand overall site usage. This does not include the content of any video or image
          you process.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Third-party hosting</h2>
        <p className="text-slate-700 mb-4">
          This site is hosted on Vercel, which may log standard technical request data (such as IP
          address and timestamps) for security and performance purposes, per Vercel&apos;s own
          privacy policy.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Contact</h2>
        <p className="text-slate-700">
          Questions about this policy can be sent to the contact listed on our GitHub repository.
        </p>
      </div>
    </PageShell>
  );
}
