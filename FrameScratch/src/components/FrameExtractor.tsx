"use client";

import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { HatBlock, CommandBlock, ForeverWrap, ScratchStack } from "./ScratchBlock";
import { RangeSlider } from "./RangeSlider";
import { extractWav } from "@/lib/audio";

const MAX_RECOMMENDED_FRAMES = 400;
const MAX_CANVAS_DIM = 16384;
const MAX_CANVAS_AREA = 268435456;
const SETTINGS_KEY = "framescratch:settings";
const AUDIO_RATE = 22050;

type OutputMode = "costumes" | "sheet";

function sheetLayout(n: number, w: number, h: number) {
  const cols = Math.max(
    1,
    Math.min(n, Math.floor(MAX_CANVAS_DIM / w), Math.ceil(Math.sqrt(n)))
  );
  const rows = Math.ceil(n / cols);
  const ok =
    cols * w <= MAX_CANVAS_DIM &&
    rows * h <= MAX_CANVAS_DIM &&
    cols * w * rows * h <= MAX_CANVAS_AREA;
  return { cols, rows, ok };
}

export default function FrameExtractor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [fps, setFps] = useState(15);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [scale, setScale] = useState(100);
  const [format, setFormat] = useState<"png" | "jpeg">("jpeg");
  const [quality, setQuality] = useState(85);
  const [output, setOutput] = useState<OutputMode>("costumes");
  const [includeAudio, setIncludeAudio] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"frames" | "audio">("frames");
  const [frames, setFrames] = useState<string[]>([]);
  const [frameBlobs, setFrameBlobs] = useState<Blob[]>([]);
  const [frameSize, setFrameSize] = useState<{ w: number; h: number } | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioNote, setAudioNote] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  // Load saved settings once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.fps === "number") setFps(Math.min(30, Math.max(1, s.fps)));
        if ([100, 75, 50, 25].includes(s.scale)) setScale(s.scale);
        if (s.format === "png" || s.format === "jpeg") setFormat(s.format);
        if (typeof s.quality === "number") setQuality(Math.min(100, Math.max(30, s.quality)));
        if (s.output === "costumes" || s.output === "sheet") setOutput(s.output);
        if (typeof s.includeAudio === "boolean") setIncludeAudio(s.includeAudio);
      }
    } catch {

    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ fps, scale, format, quality, output, includeAudio })
      );
    } catch {

    }
  }, [loaded, fps, scale, format, quality, output, includeAudio]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    frames.forEach((url) => URL.revokeObjectURL(url));
    setFile(f);
    setFrames([]);
    setFrameBlobs([]);
    setFrameSize(null);
    setAudioBlob(null);
    setAudioNote(null);
    setWarning(null);
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

  const estimatedFrameCount = () => {
    const start = Math.max(0, trimStart);
    const end = Math.min(duration, trimEnd || duration);
    const clipLength = Math.max(0, end - start);
    return Math.floor(clipLength / (1 / fps));
  };

  const extractFrames = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !file) return;

    const estimated = estimatedFrameCount();
    if (estimated > MAX_RECOMMENDED_FRAMES) {
      const proceed = window.confirm(
        `This will extract ${estimated} frames, which may be slow or crash your browser tab depending on your device. Consider lowering FPS or trimming a shorter range.\n\nContinue anyway?`
      );
      if (!proceed) return;
    }

    frames.forEach((url) => URL.revokeObjectURL(url));

    setExtracting(true);
    setPhase("frames");
    setProgress(0);
    setWarning(null);
    setAudioBlob(null);
    setAudioNote(null);

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

    const capturedUrls: string[] = [];
    const capturedBlobs: Blob[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const t = start + i * interval;
      video.currentTime = t;
      await new Promise((res) => {
        video.onseeked = () => res(null);
      });
      ctx.drawImage(video, 0, 0, scaledW, scaledH);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, mime, q)
      );
      if (blob) {
        capturedBlobs.push(blob);
        capturedUrls.push(URL.createObjectURL(blob));
      }
      setProgress(Math.round(((i + 1) / totalFrames) * 100));
    }

    setFrames(capturedUrls);
    setFrameBlobs(capturedBlobs);
    setFrameSize({ w: scaledW, h: scaledH });

    if (includeAudio) {
      setPhase("audio");
      try {
        const wav = await extractWav(file, start, end);
        setAudioBlob(wav);
        if (wav.size > 10 * 1024 * 1024) {
          setAudioNote(
            "This audio is over 10 MB, which Scratch may refuse to upload. Try trimming a shorter range."
          );
        }
      } catch (err) {
        console.error(err);
        setAudioNote("No readable audio track was found in this video, so no sound was extracted.");
      }
    }

    setExtracting(false);

    if (totalFrames > MAX_RECOMMENDED_FRAMES) {
      setWarning(
        `Extracted ${totalFrames} frames. Large costume packs can be slow to zip, download, and later import into Scratch. Consider JPEG or a lower FPS if you run into issues.`
      );
    }
  };

  const extOf = (blob: Blob) => (blob.type === "image/png" ? "png" : "jpg");

  const downloadZip = async () => {
    if (frameBlobs.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const ext = extOf(frameBlobs[0]);
      frameBlobs.forEach((blob, i) => {
        const name = `a${String(i + 1).padStart(2, "0")}`;
        zip.file(`${name}.${ext}`, blob);
      });
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
      saveAs(blob, "costumes.zip");
    } catch (err) {
      alert(
        "The zip failed to generate, likely because there isn't enough memory available for this many/large frames. Try lowering resolution, using JPEG, or extracting fewer frames."
      );
      console.error(err);
    } finally {
      setZipping(false);
    }
  };

  const downloadSheet = async () => {
    if (frameBlobs.length === 0 || !frameSize) return;
    const { w, h } = frameSize;
    const layout = sheetLayout(frameBlobs.length, w, h);
    if (!layout.ok) {
      alert(
        "This sprite sheet would be larger than your browser can draw. Lower the resolution scale or extract fewer frames, then try again."
      );
      return;
    }
    setZipping(true);
    try {
      const sheet = document.createElement("canvas");
      sheet.width = layout.cols * w;
      sheet.height = layout.rows * h;
      const ctx = sheet.getContext("2d")!;

      for (let i = 0; i < frameBlobs.length; i++) {
        const bitmap = await createImageBitmap(frameBlobs[i]);
        ctx.drawImage(bitmap, (i % layout.cols) * w, Math.floor(i / layout.cols) * h);
        bitmap.close();
      }

      const mime = frameBlobs[0].type || "image/png";
      const q = mime === "image/jpeg" ? quality / 100 : undefined;
      const sheetBlob: Blob | null = await new Promise((resolve) =>
        sheet.toBlob(resolve, mime, q)
      );
      if (!sheetBlob) throw new Error("Sprite sheet could not be created");

      const ext = extOf(frameBlobs[0]);
      const meta = {
        image: `spritesheet.${ext}`,
        frameWidth: w,
        frameHeight: h,
        columns: layout.cols,
        rows: layout.rows,
        frameCount: frameBlobs.length,
        fps,
      };

      const zip = new JSZip();
      zip.file(`spritesheet.${ext}`, sheetBlob);
      zip.file("spritesheet.json", JSON.stringify(meta, null, 2));
      const out = await zip.generateAsync({ type: "blob", compression: "STORE" });
      saveAs(out, "spritesheet.zip");
    } catch (err) {
      alert(
        "The sprite sheet failed to generate, likely because there isn't enough memory. Try lowering resolution or extracting fewer frames."
      );
      console.error(err);
    } finally {
      setZipping(false);
    }
  };

  const downloadAudio = () => {
    if (audioBlob) saveAs(audioBlob, "audio.wav");
  };

  const waitTime = (1 / fps).toFixed(4);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const layout =
    frameSize && frames.length > 0
      ? sheetLayout(frames.length, frameSize.w, frameSize.h)
      : null;
  const audioMb =
    (Math.max(0, Math.min(duration, trimEnd || duration) - trimStart) * AUDIO_RATE * 2) / 1e6;

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
              <label className="block text-sm font-medium mb-1">
                2. Trim range ({fmt(trimStart)} - {fmt(trimEnd)})
              </label>
              <RangeSlider
                min={0}
                max={duration}
                step={0.1}
                start={trimStart}
                end={trimEnd}
                onChange={(s, e) => {
                  setTrimStart(s);
                  setTrimEnd(e);
                }}
              />
              <div className="flex justify-between text-xs text-slate-400 px-2.5">
                <span>0:00</span>
                <span>{fmt(duration)}</span>
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
                <option value="jpeg">JPEG (compressed, smaller, recommended)</option>
                <option value="png">PNG (lossless, much larger)</option>
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

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">6. Output</label>
              <select
                value={output}
                onChange={(e) => setOutput(e.target.value as OutputMode)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="costumes">Costume images (for Scratch)</option>
                <option value="sheet">Sprite sheet (for game engines and other tools)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">7. Audio</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer py-1.5">
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                Also extract the audio track as a WAV
              </label>
              {includeAudio && duration > 0 && (
                <p className={`text-xs mt-1 ${audioMb > 9.5 ? "text-amber-600" : "text-slate-400"}`}>
                  Estimated size: about {audioMb.toFixed(1)} MB
                  {audioMb > 9.5 ? " (Scratch caps sounds at roughly 10 MB, try a shorter range)" : ""}
                </p>
              )}
            </div>
          </div>

          {duration > 0 && estimatedFrameCount() > MAX_RECOMMENDED_FRAMES && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This will extract about {estimatedFrameCount()} frames. That may be slow or crash
              the tab on lower-memory devices - consider lowering FPS or trimming a shorter range.
            </p>
          )}

          <button
            onClick={extractFrames}
            disabled={!file || extracting}
            className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed w-fit"
          >
            {extracting
              ? phase === "audio"
                ? "Extracting audio..."
                : `Extracting... ${progress}%`
              : "Extract Frames"}
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
          {warning && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {warning}
            </p>
          )}
          {audioNote && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {audioNote}
            </p>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold">{frames.length} frames extracted</h2>
              <div className="flex flex-wrap gap-2">
                {output === "costumes" ? (
                  <button
                    onClick={downloadZip}
                    disabled={zipping}
                    className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {zipping ? "Zipping..." : "Download costumes.zip"}
                  </button>
                ) : (
                  <button
                    onClick={downloadSheet}
                    disabled={zipping}
                    className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {zipping ? "Building sheet..." : "Download sprite sheet"}
                  </button>
                )}
                {audioBlob && (
                  <button
                    onClick={downloadAudio}
                    className="bg-pink-500 hover:bg-pink-600 transition-colors text-white font-medium px-4 py-2 rounded-lg text-sm"
                  >
                    Download audio.wav
                  </button>
                )}
              </div>
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

          {output === "costumes" ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold mb-1">Build these blocks in Scratch</h2>
              <p className="text-sm text-slate-500 mb-4">
                Create a new sprite, unzip the download, and upload all {frames.length} images
                into its Costumes tab (they&apos;ll auto-sort as a01, a02...).
                {audioBlob
                  ? " Then open the Sounds tab, upload audio.wav, and stack these blocks:"
                  : " Then stack these blocks:"}
              </p>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <ScratchStack>
                  <HatBlock delay={0}>when clicked</HatBlock>
                  {audioBlob && (
                    <CommandBlock color="pink" delay={150}>start sound audio</CommandBlock>
                  )}
                  <ForeverWrap delay={audioBlob ? 350 : 250}>
                    <CommandBlock color="purple" animate={false}>next costume</CommandBlock>
                    <CommandBlock color="purple" animate={false}>wait {waitTime} seconds</CommandBlock>
                  </ForeverWrap>
                </ScratchStack>
              </div>
            </div>
          ) : (
            layout &&
            frameSize && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold mb-1">Sprite sheet details</h2>
                <p className="text-sm text-slate-500">
                  {layout.cols} x {layout.rows} grid, each frame {frameSize.w} x {frameSize.h}px,
                  full sheet {layout.cols * frameSize.w} x {layout.rows * frameSize.h}px at{" "}
                  {fps} FPS. The download includes a spritesheet.json with these values so you
                  can slice it in any engine.
                </p>
                {!layout.ok && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
                    This sheet is too large for your browser to draw. Lower the resolution scale
                    or extract fewer frames, then extract again.
                  </p>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}