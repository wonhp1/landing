import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '허용되지 않는 메소드입니다.' });
    }

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        
        // uploads 디렉토리가 없으면 생성
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            uploadDir,
            keepExtensions: true,
            filename: (name, ext) => `${Date.now()}${ext}`
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('File upload error:', err);
                return res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
            }

            const file = files.image;
            if (!file) {
                return res.status(400).json({ error: '이미지 파일이 없습니다.' });
            }

            const imageUrl = `/uploads/${path.basename(file.filepath)}`;
            res.status(200).json({ imageUrl });
        });
    } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
} 