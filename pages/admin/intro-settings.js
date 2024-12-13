import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/intro-settings.module.css';

const IntroSettings = () => {
    const router = useRouter();
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [pageSettings, setPageSettings] = useState({
        backgroundColor: '#f5f5f5',
        headerBackgroundColor: '#ffffff',
        headerTextColor: '#000000',
        headerFontSize: '1.2rem',
        headerFontWeight: 'normal'
    });

    useEffect(() => {
        const fetchCurrentSettings = async () => {
            try {
                const response = await fetch('/api/intro-content');
                const data = await response.json();
                setSections(data.sections || []);
                setPageSettings(data.pageSettings || {
                    backgroundColor: '#f5f5f5',
                    headerBackgroundColor: '#ffffff',
                    headerTextColor: '#000000',
                    headerFontSize: '1.2rem',
                    headerFontWeight: 'normal'
                });
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchCurrentSettings();
    }, []);

    const handleAddSection = () => {
        setSections([...sections, {
            id: Date.now(),
            type: 'text', // 'text', 'image', 'video'
            content: '',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontSize: '1rem',
            fontWeight: 'normal'
        }]);
    };

    const handleRemoveSection = (index) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const handleSectionChange = (index, field, value) => {
        const newSections = [...sections];
        newSections[index] = {
            ...newSections[index],
            [field]: value
        };
        setSections(newSections);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setSaveError('');
            const response = await fetch('/api/intro-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sections, pageSettings })
            });
            
            if (!response.ok) {
                throw new Error('설정 저장 실패');
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveError('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderSectionContent = (section, index) => {
        switch (section.type) {
            case 'text':
                return (
                    <textarea
                        value={section.content}
                        onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                        className={styles.textarea}
                        placeholder="텍스트를 입력하세요"
                    />
                );
            case 'image':
                return (
                    <>
                        <input
                            type="url"
                            value={section.content}
                            onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                            placeholder="이미지 URL을 입력하세요"
                            className={styles.input}
                        />
                        {section.content && (
                            <div className={styles.imagePreviewContainer}>
                                <img 
                                    src={section.content}
                                    alt="미리보기"
                                    className={styles.imagePreview}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        setSaveError('이미지를 불러올 수 없습니다.');
                                    }}
                                    onLoad={(e) => {
                                        e.target.style.display = 'block';
                                        setSaveError('');
                                    }}
                                />
                            </div>
                        )}
                    </>
                );
            case 'video':
                return (
                    <>
                        <input
                            type="url"
                            value={section.content}
                            onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                            placeholder="YouTube 동영상 URL을 입력하세요"
                            className={styles.input}
                        />
                        {section.content && (
                            <div className={styles.videoContainer}>
                                <iframe
                                    src={section.content.replace('watch?v=', 'embed/')}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className={styles.videoPreview}
                                />
                            </div>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <h1>소개 페이지 설정</h1>
            <button 
                onClick={handleAddSection}
                className={styles.addButton}
                type="button"
            >
                새 섹션 추가
            </button>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.sectionContainer}>
                    <h3>페이지 기본 설정</h3>
                    <div className={styles.formGroup}>
                        <label>페이지 배경색</label>
                        <input
                            type="color"
                            value={pageSettings.backgroundColor}
                            onChange={(e) => setPageSettings(prev => ({
                                ...prev,
                                backgroundColor: e.target.value
                            }))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>헤더 배경색</label>
                        <input
                            type="color"
                            value={pageSettings.headerBackgroundColor}
                            onChange={(e) => setPageSettings(prev => ({
                                ...prev,
                                headerBackgroundColor: e.target.value
                            }))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>헤더 글자색</label>
                        <input
                            type="color"
                            value={pageSettings.headerTextColor}
                            onChange={(e) => setPageSettings(prev => ({
                                ...prev,
                                headerTextColor: e.target.value
                            }))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>헤더 글자 크기</label>
                        <select
                            value={pageSettings.headerFontSize}
                            onChange={(e) => setPageSettings(prev => ({
                                ...prev,
                                headerFontSize: e.target.value
                            }))}
                        >
                            <option value="1rem">작게</option>
                            <option value="1.2rem">보통</option>
                            <option value="1.5rem">크게</option>
                            <option value="2rem">매우 크게</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>헤더 글자 굵기</label>
                        <select
                            value={pageSettings.headerFontWeight}
                            onChange={(e) => setPageSettings(prev => ({
                                ...prev,
                                headerFontWeight: e.target.value
                            }))}
                        >
                            <option value="normal">보통</option>
                            <option value="bold">굵게</option>
                        </select>
                    </div>
                </div>

                {sections.map((section, index) => (
                    <div key={section.id} className={styles.sectionContainer}>
                        <div className={styles.sectionHeader}>
                            <h3>섹션 {index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => handleRemoveSection(index)}
                                className={styles.removeButton}
                            >
                                삭제
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <label>섹션 타입</label>
                            <select
                                value={section.type}
                                onChange={(e) => handleSectionChange(index, 'type', e.target.value)}
                                className={styles.select}
                            >
                                <option value="text">텍스트</option>
                                <option value="image">이미지</option>
                                <option value="video">동영상</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>콘텐츠</label>
                            {renderSectionContent(section, index)}
                        </div>

                        <div className={styles.formGroup}>
                            <label>배경색</label>
                            <input
                                type="color"
                                value={section.backgroundColor}
                                onChange={(e) => handleSectionChange(index, 'backgroundColor', e.target.value)}
                            />
                        </div>

                        {section.type === 'text' && (
                            <>
                                <div className={styles.formGroup}>
                                    <label>글자색</label>
                                    <input
                                        type="color"
                                        value={section.textColor}
                                        onChange={(e) => handleSectionChange(index, 'textColor', e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>글자 크기</label>
                                    <select
                                        value={section.fontSize}
                                        onChange={(e) => handleSectionChange(index, 'fontSize', e.target.value)}
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
                                        value={section.fontWeight}
                                        onChange={(e) => handleSectionChange(index, 'fontWeight', e.target.value)}
                                    >
                                        <option value="normal">보통</option>
                                        <option value="bold">굵게</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {saveError && <p className={styles.error}>{saveError}</p>}
                {saveSuccess && <p className={styles.success}>설정이 저장되었습니다!</p>}

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