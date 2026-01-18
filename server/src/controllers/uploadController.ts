import { Request, Response } from 'express';

export const uploadVideo = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).send('No file uploaded');
            return;
        }
        res.send({
            message: 'File uploaded successfully',
            filePath: `/${req.file.path}`,
        });
    } catch (err) {
        res.status(500).send(err);
    }
};
