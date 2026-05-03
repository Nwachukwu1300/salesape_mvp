import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let ffmpeg: any = null;
let ffmpegStatic: string | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ffmpeg = require('fluent-ffmpeg');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ffmpegStatic = require('ffmpeg-static');
  if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
  }
} catch {
  ffmpeg = null;
}

export function isFfmpegAvailable(): boolean {
  return Boolean(ffmpeg);
}

export interface RenderOptions {
  inputPath: string;
  startSeconds: number;
  durationSeconds: number;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
}

function resolveAspectRatio(
  platform: RenderOptions['platform'],
  ratio?: RenderOptions['aspectRatio']
): RenderOptions['aspectRatio'] {
  if (ratio) return ratio;
  if (platform === 'youtube') return '16:9';
  if (platform === 'linkedin') return '1:1';
  return '9:16';
}

function aspectFilter(ratio: RenderOptions['aspectRatio']): string {
  switch (ratio) {
    case '16:9':
      return 'scale=1920:1080:force_original_aspect_ratio=cover,crop=1920:1080';
    case '1:1':
      return 'scale=1080:1080:force_original_aspect_ratio=cover,crop=1080:1080';
    case '4:5':
      return 'scale=1080:1350:force_original_aspect_ratio=cover,crop=1080:1350';
    case '9:16':
    default:
      return 'scale=1080:1920:force_original_aspect_ratio=cover,crop=1080:1920';
  }
}

export async function renderShortFormVideo(options: RenderOptions): Promise<{ outputPath: string }> {
  const outputPath = path.join(os.tmpdir(), `short-${options.platform}-${Date.now()}.mp4`);
  const ratio = resolveAspectRatio(options.platform, options.aspectRatio);

  if (!ffmpeg) {
    fs.copyFileSync(options.inputPath, outputPath);
    return { outputPath };
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg(options.inputPath)
      .setStartTime(Math.max(options.startSeconds, 0))
      .setDuration(Math.max(options.durationSeconds, 1))
      .videoFilters(aspectFilter(ratio))
      .outputOptions(['-preset veryfast', '-crf 23', '-r 30'])
      .on('end', () => resolve())
      .on('error', (err: any) => reject(err))
      .save(outputPath);
  });

  return { outputPath };
}
