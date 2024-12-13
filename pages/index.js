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
    const [introContent, setIntroContent] = useState(null);

    useEffect(() => {
        // 소개 콘텐츠 데이터 가져오기
        const fetchIntroContent = async () => {
            try {
                const response = await fetch('/api/intro-content');
                const data = await response.json();
                setIntroContent(data);
            } catch (error) {
                console.error('Error fetching intro content:', error);
            }
        };

        fetchIntroContent();
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

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1 className={styles.title}>김경원 트레이너 홈페이지</h1>
            </div>

            {introContent && (
                <div className={styles.introSection}>
                    {introContent.imageUrl && (
                        <div className={styles.imageContainer}>
                            <Image
                                src={introContent.imageUrl}
                                alt="프로필 이미지"
                                width={300}
                                height={300}
                                objectFit="cover"
                                className={styles.profileImage}
                            />
                        </div>
                    )}
                    <div 
                        className={styles.introText}
                        style={{
                            backgroundColor: introContent.backgroundColor || 'transparent',
                            color: introContent.textColor || '#000',
                            fontSize: introContent.fontSize || '1rem',
                            fontWeight: introContent.fontWeight || 'normal',
                            padding: '20px',
                            borderRadius: '10px',
                            margin: '20px 0'
                        }}
                        dangerouslySetInnerHTML={{ __html: introContent.text }}
                    />
                </div>
            )}
            
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
                <div style={{ marginTop: '20px' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="비밀번호"
                        className={styles.input}
                    />
                    <button onClick={handleLogin} className={styles.button}>로그인</button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}
        </div>
    );
};

export default Home;
