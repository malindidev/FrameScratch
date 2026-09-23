"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { HatBlock, CommandBlock, ForeverWrap, ScratchStack } from "./ScratchBlock";

export default function FrameExtractor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [fps, setFps] = useState(15);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [scale, setScale] = useState(100);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(85);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFrames([]);
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(f);
      videoRef.current.onloadedmetadata = () => {
        const d = videoRef.current!.duration;
        setDuration(d);
        setTrimStart(0);
        setTrimEnd(d);
      };
    }
  };

  const extractFrames = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    setExtracting(true);
    setProgress(0);

    await new Promise((res) => {
      if (video.readyState >= 1) res(null);
      else video.onloadedmetadata = () => res(null);
    });

    const start = Math.max(0, trimStart);
    const end = Math.min(duration, trimEnd || duration);
    const clipLength = Math.max(0, end - start);
    const interval = 1 / fps;
    const totalFrames = Math.floor(clipLength / interval);

    const scaledW = Math.round(video.videoWidth * (scale / 100));
    const scaledH = Math.round(video.videoHeight * (scale / 100));
    canvas.width = scaledW;
    canvas.height = scaledH;
    const ctx = canvas.getContext("2d")!;

    const mime = format === "png" ? "image/png" : "image/jpeg";
    const q = format === "jpeg" ? quality / 100 : undefined;

    const captured: string[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const t = start + i * interval;
      video.currentTime = t;
      await new Promise((res) => {
        video.onseeked = () => res(null);
      });
      ctx.drawImage(video, 0, 0, scaledW, scaledH);
      captured.push(canvas.toDataURL(mime, q));
      setProgress(Math.round(((i + 1) / totalFrames) * 100));
    }

    setFrames(captured);
    setExtracting(false);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const ext = format === "png" ? "png" : "jpg";
    frames.forEach((dataUrl, i) => {
      const name = `a${String(i + 1).padStart(2, "0")}`;
      const base64 = dataUrl.split(",")[1];
      zip.file(`${name}.${ext}`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "costumes.zip");
  };

  const waitTime = (1 / fps).toFixed(4);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div id="tool" className="max-w-4xl mx-auto px-6 py-14 scroll-mt-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Extract frames</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Everything below runs locally in your browser - nothing is uploaded.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">1. Upload a video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleUpload}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:font-medium hover:file:bg-orange-600 file:cursor-pointer cursor-pointer"
            />
          </div>

          <video ref={videoRef} className="hidden" muted />
          <canvas ref={canvasRef} className="hidden" />

          {duration > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                2. Trim range ({fmt(trimStart)} - {fmt(trimEnd)})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={trimStart}
                  onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd))}
                  className="w-full accent-orange-500"
                />
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">3. Frames per second</label>
              <input
                type="number"
                value={fps}
                min={1}
                max={30}
                onChange={(e) => setFps(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">4. Resolution scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value={100}>100% (original)</option>
                <option value={75}>75%</option>
                <option value={50}>50%</option>
                <option value={25}>25%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">5. Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}
                className="border border-slate-300 rounded-lg px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="png">PNG (lossless, larger)</option>
                <option value="jpeg">JPEG (compressed, smaller)</option>
              </select>
            </div>
          </div>

          {format === "jpeg" && (
            <div>
              <label className="block text-sm font-medium mb-2">JPEG quality: {quality}%</label>
              <input
                type="range"
                min={30}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full max-w-xs accent-orange-500"
              />
            </div>
          )}

          <button
            onClick={extractFrames}
            disabled={!file || extracting}
            className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed w-fit"
          >
            {extracting ? `Extracting... ${progress}%` : "Extract Frames"}
          </button>

          {extracting && (
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {frames.length > 0 && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{frames.length} frames extracted</h2>
              <button
                onClick={downloadZip}
                className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                Download costumes.zip
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2 max-h-56 overflow-y-auto">
              {frames.slice(0, 32).map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={f}
                  alt={`frame ${i}`}
                  className="rounded-md border border-slate-200 object-cover aspect-video"
                />
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-1">Build these blocks in Scratch</h2>
            <p className="text-sm text-slate-500 mb-4">
              Create a new sprite, import all {frames.length} images from the zip into its
              Costumes tab (they&apos;ll auto-sort as a01, a02...), then stack these blocks:
            </p>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <ScratchStack>
                <HatBlock delay={0}>when clicked</HatBlock>
                <ForeverWrap delay={250}>
                  <CommandBlock color="purple" animate={false}>next costume</CommandBlock>
                  <CommandBlock color="purple" animate={false}>wait {waitTime} seconds</CommandBlock>
                </ForeverWrap>
              </ScratchStack>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
