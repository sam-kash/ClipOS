import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// Set FFmpeg path if not in system PATH (Windows)
// ffmpeg.setFfmpegPath('C:/ffmpeg/bin/ffmpeg.exe');

/**
 * Get video metadata (duration, resolution, etc.)
 */
export const getVideoMetadata = (filePath: string): Promise<ffmpeg.FfprobeData> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
};

/**
 * Extract audio from video for transcription
 */
export const extractAudio = (inputPath: string, outputPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Ensure output directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        ffmpeg(inputPath)
            .output(outputPath)
            .noVideo()
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .on('start', (cmd) => {
                console.log('🎵 Extracting audio:', cmd);
            })
            .on('end', () => {
                console.log('✅ Audio extracted:', outputPath);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('❌ Audio extraction failed:', err);
                reject(err);
            })
            .run();
    });
};

/**
 * Generate SRT file content from transcription
 */
export const generateSRT = (transcription: string): string => {
    // Parse whisper output or create simple SRT
    // This handles both raw text and SRT format
    if (transcription.includes('-->')) {
        return transcription; // Already SRT format
    }

    // Convert plain text to SRT format (basic implementation)
    const words = transcription.split(' ');
    const wordsPerSegment = 8;
    let srt = '';
    let segmentIndex = 1;

    for (let i = 0; i < words.length; i += wordsPerSegment) {
        const segment = words.slice(i, i + wordsPerSegment).join(' ');
        const startTime = Math.floor(i / 3); // Rough timing
        const endTime = startTime + 3;

        srt += `${segmentIndex}\n`;
        srt += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        srt += `${segment}\n\n`;
        segmentIndex++;
    }

    return srt;
};

const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},000`;
};

/**
 * Burn captions onto video using FFmpeg
 */
export const burnCaptions = (
    videoPath: string,
    srtPath: string,
    outputPath: string,
    style: 'default' | 'bold' | 'minimal' | 'colorful' = 'default'
): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Ensure output directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Caption styles
        const styles: Record<string, string> = {
            default: "FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1",
            bold: "FontName=Impact,FontSize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Bold=1",
            minimal: "FontName=Helvetica,FontSize=20,PrimaryColour=&H00FFFFFF,Outline=1",
            colorful: "FontName=Arial,FontSize=26,PrimaryColour=&H0000FFFF,OutlineColour=&H00FF00FF,Outline=2,Shadow=2",
        };

        const subtitleStyle = styles[style] || styles.default;

        // Escape path for FFmpeg filter (Windows paths need escaping)
        const escapedSrtPath = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

        ffmpeg(videoPath)
            .outputOptions([
                `-vf subtitles='${escapedSrtPath}':force_style='${subtitleStyle}'`,
                '-c:a copy',
            ])
            .output(outputPath)
            .on('start', (cmd) => {
                console.log('🔥 Burning captions:', cmd);
            })
            .on('progress', (progress) => {
                console.log(`📊 Processing: ${progress.percent?.toFixed(1)}%`);
            })
            .on('end', () => {
                console.log('✅ Captions burned:', outputPath);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('❌ Caption burn failed:', err);
                reject(err);
            })
            .run();
    });
};

/**
 * Create video thumbnail
 */
export const createThumbnail = (videoPath: string, outputPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        ffmpeg(videoPath)
            .screenshots({
                count: 1,
                folder: dir,
                filename: path.basename(outputPath),
                size: '320x180',
            })
            .on('end', () => {
                console.log('✅ Thumbnail created:', outputPath);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('❌ Thumbnail failed:', err);
                reject(err);
            });
    });
};
