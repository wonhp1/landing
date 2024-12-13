import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/index.module.css';
import { useRouter } from 'next/router';

const Home = () => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch('/api/intro-content');
                const data = await response.json();
                setSections(data.sections || []);
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        };

        fetchSections();
    }, []);

    const handleLogin = async () => {
        try {
            const response = await fetch('/api/auth/verify-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.isValid) {
                router.push('/admin');
            } else {
                setError('비밀번호가 틀렸습니다.');
                setPassword('');
            }
        } catch (error) {
            console.error('Error verifying admin password:', error);
            setError('인증 중 오류가 발생했습니다.');
            setPassword('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const togglePasswordInput = () => {
        setShowPasswordInput((prev) => !prev);
        setPassword('');
        setError('');
    };

    const renderSection = (section) => {
        switch (section.type) {
            case 'text':
                return (
                    <div 
                        style={{
                            backgroundColor: section.backgroundColor,
                            color: section.textColor,
                            fontSize: section.fontSize,
                            fontWeight: section.fontWeight,
                            padding: '20px',
                            borderRadius: '10px',
                            margin: '20px 0'
                        }}
                    >
                        {section.content}
                    </div>
                );
            case 'image':
                return (
                    <div className={styles.imageSection}>
                        <img 
                            src={section.content}
                            alt="소개 이미지"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '10px',
                                backgroundColor: section.backgroundColor,
                                padding: '10px'
                            }}
                        />
                    </div>
                );
            case 'video':
                return (
                    <div className={styles.videoSection}>
                        <div className={styles.videoWrapper}>
                            <iframe
                                src={section.content.includes('youtube.com/watch?v=') 
                                    ? section.content.replace('youtube.com/watch?v=', 'youtube.com/embed/')
                                    : section.content.includes('youtu.be/')
                                    ? section.content.replace('youtu.be/', 'youtube.com/embed/')
                                    : section.content}
                                title="YouTube video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{
                                    backgroundColor: section.backgroundColor,
                                    padding: '10px',
                                    borderRadius: '10px'
                                }}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1 className={styles.title}>김경원 트레이너 홈페이지</h1>
            </div>

            <div className={styles.introSections}>
                {sections.map((section, index) => (
                    <div key={section.id || index} className={styles.section}>
                        {renderSection(section)}
                    </div>
                ))}
            </div>
            
            <div className={styles.buttonContainer}>
                <Link href="/reservations">
                    <button className={styles.button}>스케줄 예약 및 변경</button>
                </Link>
                <button 
                    onClick={togglePasswordInput}
                    className={`${styles.button} ${styles.adminLoginButton}`}
                    style={{ 
                        fontSize: '0.8rem',
                        padding: '8px 16px'
                    }}
                >
                    관리자 페이지
                </button>
            </div>

            {showPasswordInput && (
                <div className={styles.passwordInputContainer}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="비밀번호"
                        className={styles.input}
                    />
                    <button 
                        onClick={handleLogin} 
                        className={`${styles.button} ${styles.loginButton}`}
                        style={{ 
                            padding: '8px 16px',
                            fontSize: '0.9rem'
                        }}
                    >
                        로그인
                    </button>
                    {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
                </div>
            )}
        </div>
    );
};

export default Home;
