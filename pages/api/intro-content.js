import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'intro-content.json');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const introContent = JSON.parse(fileData);
            res.status(200).json(introContent);
        } catch (error) {
            console.error('Error reading intro content:', error);
            res.status(500).json({ error: '서버 오류가 발생했습니다.' });
        }
    } else if (req.method === 'POST') {
        try {
            const content = req.body;
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
            res.status(200).json({ message: '성공적으로 저장되었습니다.' });
        } catch (error) {
            console.error('Error saving intro content:', error);
            res.status(500).json({ error: '서버 오류가 발생했습니다.' });
        }
    } else {
        res.status(405).json({ error: '허용되지 않는 메소드입니다.' });
    }
} 