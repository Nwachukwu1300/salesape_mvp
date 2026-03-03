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
}

export async function renderShortFormVideo(options: RenderOptions): Promise<{ outputPath: string }> {
  const outputPath = path.join(os.tmpdir(), `short-${options.platform}-${Date.now()}.mp4`);

  if (!ffmpeg) {
    fs.copyFileSync(options.inputPath, outputPath);
    return { outputPath };
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg(options.inputPath)
      .setStartTime(Math.max(options.startSeconds, 0))
      .setDuration(Math.max(options.durationSeconds, 1))
      .videoFilters('scale=1080:1920:force_original_aspect_ratio=cover,crop=1080:1920')
      .outputOptions(['-preset veryfast', '-crf 23', '-r 30'])
      .on('end', () => resolve())
      .on('error', (err: any) => reject(err))
      .save(outputPath);
  });

  return { outputPath };
}

