import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/intro-settings.module.css';

const IntroSettings = () => {
    const router = useRouter();
    const [settings, setSettings] = useState({
        text: '',
        imageUrl: '',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: '1rem',
        fontWeight: 'normal'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // 현재 설정 가져오기
        const fetchCurrentSettings = async () => {
            try {
                const response = await fetch('/api/intro-content');
                const data = await response.json();
                setSettings(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchCurrentSettings();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsLoading(true);
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setSettings(prev => ({ ...prev, imageUrl: data.imageUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await fetch('/api/intro-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });
            alert('설정이 저장되었습니다.');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1>소개 페이지 설정</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>소개 텍스트</label>
                    <textarea
                        value={settings.text}
                        onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>이미지 업로드</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={styles.fileInput}
                    />
                    {settings.imageUrl && (
                        <img 
                            src={settings.imageUrl} 
                            alt="미리보기" 
                            className={styles.imagePreview}
                        />
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label>배경색</label>
                    <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>글자색</label>
                    <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>글자 크기</label>
                    <select
                        value={settings.fontSize}
                        onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                    >
                        <option value="0.8rem">작게</option>
                        <option value="1rem">보통</option>
                        <option value="1.2rem">크게</option>
                        <option value="1.5rem">매우 크게</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>글자 굵기</label>
                    <select
                        value={settings.fontWeight}
                        onChange={(e) => setSettings(prev => ({ ...prev, fontWeight: e.target.value }))}
                    >
                        <option value="normal">보통</option>
                        <option value="bold">굵게</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? '저장 중...' : '설정 저장'}
                </button>
            </form>
        </div>
    );
};

export default IntroSettings; 