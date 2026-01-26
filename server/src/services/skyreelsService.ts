/**
 * SkyReels API Service
 * Provides video generation capabilities using SkyReels AI
 * API Documentation: https://www.skyreels.ai/document
 */

const SKYREELS_BASE_URL = 'https://apis.skyreels.ai';

interface SkyReelsTaskResponse {
    code: number;
    msg: string;
    data?: {
        task_id: string;
        status?: string;
        video_url?: string;
    };
}

/**
 * Get the SkyReels API key from environment
 */
function getApiKey(): string {
    const apiKey = process.env.SKYREELS_API_KEY;
    if (!apiKey) {
        throw new Error('SKYREELS_API_KEY not configured');
    }
    return apiKey;
}

/**
 * Generate a talking avatar video
 * @param text - The text for the avatar to speak
 * @param avatarImageUrl - Optional URL to a custom avatar image
 */
export const generateTalkingAvatar = async (
    text: string,
    avatarImageUrl?: string
): Promise<{ taskId: string; message: string }> => {
    const apiKey = getApiKey();

    try {
        const response = await fetch(`${SKYREELS_BASE_URL}/api/open/v1/avatar/single`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                text: text,
                ...(avatarImageUrl && { avatar_image_url: avatarImageUrl }),
            }),
        });

        const result: SkyReelsTaskResponse = await response.json();

        if (result.code !== 0 || !result.data?.task_id) {
            throw new Error(result.msg || 'Failed to create avatar video task');
        }

        return {
            taskId: result.data.task_id,
            message: 'Avatar video generation started. Use the taskId to check status.',
        };
    } catch (error: any) {
        console.error('SkyReels Avatar Error:', error.message);
        throw error;
    }
};

/**
 * Generate video from an image with a prompt
 * @param prompt - Description of the video to generate
 * @param imageUrl - URL of the source image
 */
export const generateVideoFromImage = async (
    prompt: string,
    imageUrl: string
): Promise<{ taskId: string; message: string }> => {
    const apiKey = getApiKey();

    try {
        const response = await fetch(`${SKYREELS_BASE_URL}/api/open/v1/video/reference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                prompt: prompt,
                image_url: imageUrl,
            }),
        });

        const result: SkyReelsTaskResponse = await response.json();

        if (result.code !== 0 || !result.data?.task_id) {
            throw new Error(result.msg || 'Failed to create video generation task');
        }

        return {
            taskId: result.data.task_id,
            message: 'Video generation started. Use the taskId to check status.',
        };
    } catch (error: any) {
        console.error('SkyReels Video Generation Error:', error.message);
        throw error;
    }
};

/**
 * Check the status of a video generation task
 * @param taskId - The task ID returned from generation
 */
export const checkTaskStatus = async (
    taskId: string
): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    message: string;
}> => {
    const apiKey = getApiKey();

    try {
        const response = await fetch(`${SKYREELS_BASE_URL}/api/open/v1/task/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                task_id: taskId,
            }),
        });

        const result: SkyReelsTaskResponse = await response.json();

        if (result.code !== 0) {
            throw new Error(result.msg || 'Failed to query task status');
        }

        const status = result.data?.status?.toLowerCase() || 'pending';

        let normalizedStatus: 'pending' | 'processing' | 'completed' | 'failed';
        if (status === 'success' || status === 'completed') {
            normalizedStatus = 'completed';
        } else if (status === 'failed' || status === 'error') {
            normalizedStatus = 'failed';
        } else if (status === 'processing' || status === 'running') {
            normalizedStatus = 'processing';
        } else {
            normalizedStatus = 'pending';
        }

        return {
            status: normalizedStatus,
            ...(result.data?.video_url && { videoUrl: result.data.video_url }),
            message: `Task is ${normalizedStatus}`,
        };
    } catch (error: any) {
        console.error('SkyReels Status Check Error:', error.message);
        throw error;
    }
};

/**
 * Wait for video completion with polling
 * @param taskId - The task ID to wait for
 * @param maxWaitMs - Maximum time to wait in milliseconds (default: 5 minutes)
 * @param pollIntervalMs - How often to check status (default: 5 seconds)
 */
export const waitForVideoCompletion = async (
    taskId: string,
    maxWaitMs: number = 300000,
    pollIntervalMs: number = 5000
): Promise<{ videoUrl: string; message: string }> => {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
        const status = await checkTaskStatus(taskId);

        if (status.status === 'completed' && status.videoUrl) {
            return {
                videoUrl: status.videoUrl,
                message: 'Video generation completed!',
            };
        }

        if (status.status === 'failed') {
            throw new Error('Video generation failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error('Video generation timed out');
};
