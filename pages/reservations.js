'use client';
import React, { useState, useEffect } from 'react';
import ReservationCalendar from '../components/ReservationCalendar';
import Link from 'next/link';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { useRouter } from 'next/navigation';

const getKSTDate = (date = new Date()) => {
    const kstOffset = 9 * 60;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (kstOffset * 60000));
};

const isSameKSTDate = (date1, date2) => {
    const kstDate1 = getKSTDate(date1);
    const kstDate2 = getKSTDate(date2);
    return kstDate1.toDateString() === kstDate2.toDateString();
};

const isKSTWeekend = (date) => {
    const kstDate = getKSTDate(date);
    return kstDate.getDay() === 0 || kstDate.getDay() === 6;
};

const ReservationItem = ({ reservation, onEdit }) => {
    const [date, time, memberId, name, eventId] = reservation;
    const today = getKSTDate();
    const reservationDate = getKSTDate(new Date(`${date}T${time}`));
    const isToday = isSameKSTDate(reservationDate, today);

    const formattedDate = reservationDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    });

    const formatTime = (time) => {
        const hour = parseInt(time);
        const hour24 = `${hour}:00`;
        
        if (hour < 12) {
            return `${hour24} (오전 ${hour}시)`;
        } else if (hour === 12) {
            return `${hour24} (오후 12시)`;
        } else {
            return `${hour24} (오후 ${hour - 12}시)`;
        }
    };

    return (
        <div className="reservation-card">
            <div className="card-header">
                <div className="date-badge">
                    <span className="emoji">📅</span> {formattedDate}
                </div>
                <div className="time-badge">
                    <span className="emoji">⏰</span> {formatTime(time.replace(':00', ''))}
                </div>
            </div>
            <div className="card-body">
                <div className="member-info">
                    <div className="name">
                        <span className="emoji">👤</span> {name}
                    </div>
                    <div className="member-id">
                        <span className="emoji">🆔</span> #{memberId}
                    </div>
                </div>
                <button 
                    onClick={() => onEdit(reservation)}
                    disabled={isToday}
                    className={`edit-button ${isToday ? 'disabled' : ''}`}
                >
                    {isToday ? '당일 변경 불가' : '예약 변경'}
                </button>
            </div>

            <style jsx>{`
                .reservation-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border: 1px solid #eaeaea;
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-bottom: 16px;
                }

                .reservation-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }

                .card-header {
                    background: #f8f9fa;
                    padding: 16px;
                    border-bottom: 1px solid #eaeaea;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .date-badge {
                    font-weight: 600;
                    color: #495057;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .time-badge {
                    background: #e7f1ff;
                    color: #0056b3;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 1rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .card-body {
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .member-info {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #212529;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .member-id {
                    color: #6c757d;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .emoji {
                    font-size: 1.2em;
                    line-height: 1;
                }

                .edit-button {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .edit-button:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                .edit-button.disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                    opacity: 0.8;
                }

                @media (max-width: 768px) {
                    .reservation-card {
                        margin: 10px;
                    }

                    .card-header {
                        padding: 12px;
                        flex-direction: column;
                        gap: 8px;
                        align-items: flex-start;
                    }

                    .time-badge {
                        align-self: flex-end;
                    }

                    .card-body {
                        padding: 15px;
                        flex-direction: column;
                        gap: 15px;
                        align-items: flex-start;
                    }

                    .edit-button {
                        width: 100%;
                        padding: 12px;
                    }

                    .date-badge, .time-badge {
                        font-size: 0.95rem;
                    }

                    .name {
                        font-size: 1.1rem;
                    }

                    .member-id {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
};

const ReservationsPage = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberId, setMemberId] = useState('');
    const [searchMemberId, setSearchMemberId] = useState('');
    const [message, setMessage] = useState('');
    const [mounted, setMounted] = useState(false);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [myReservations, setMyReservations] = useState([]);
    const [showReservations, setShowReservations] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [reservationDates, setReservationDates] = useState([]);
    const [messageVisible, setMessageVisible] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');
    const [searchMessageType, setSearchMessageType] = useState('');
    const [searchMessageVisible, setSearchMessageVisible] = useState(false);
    const [showSearchMessage, setShowSearchMessage] = useState(false);
    const [messageType, setMessageType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();
    const [disabledDates, setDisabledDates] = useState([]);
    const [availableHours, setAvailableHours] = useState({
        weekday: { start: "14", end: "22" },
        weekend: { start: "10", end: "17" }
    });
    const [reservationPeriod, setReservationPeriod] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        const initializePage = async () => {
            setMounted(true);
            setIsLoading(false);
            setShowReservations(true);
        };
        initializePage();
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (!response.ok) {
                    throw new Error('설정을 불러오는데 실패했습니다');
                }
                const data = await response.json();
                
                setDisabledDates(data.disabledDates.map(date => new Date(date)));
                setHolidays(data.holidays.map(date => new Date(date)));
                if (data.availableHours) {
                    setAvailableHours(data.availableHours);
                }
                if (data.reservationPeriod) {
                    setReservationPeriod(data.reservationPeriod);
                }
            } catch (error) {
                console.error('설정을 불러오는데 실패했습니다:', error);
                setDisabledDates([]);
            }
        };
        
        loadSettings();
        const interval = setInterval(loadSettings, 60000);
        return () => clearInterval(interval);
    }, []);

    const checkBookedTimes = async (date) => {
        if (!date) return;
        
        setIsLoading(true);
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            const response = await fetch(`/api/reservations?date=${formattedDate}`);
            if (response.ok) {
                const data = await response.json();
                setBookedTimes(data.bookedTimes || []);
            }
        } catch (error) {
            console.error('예약 현황 확인 중 오류 발생:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        checkBookedTimes(date);
    };

    const getTimeOptions = () => {
        if (!selectedDate) return [];
        
        const options = [];
        const now = getKSTDate();
        const selectedKSTDate = getKSTDate(selectedDate);
        const isToday = isSameKSTDate(selectedKSTDate, now);
        const currentHour = now.getHours();
        
        const minimumHour = isToday && availableHours.sameDay?.enabled
            ? currentHour + (availableHours.sameDay?.minHoursAfter || 2)
            : 0;

        const isHoliday = holidays.some(holiday => {
            const h = getKSTDate(new Date(holiday));
            const d = getKSTDate(selectedDate);
            return isSameKSTDate(h, d);
        });

        let timeRange;
        if (isHoliday) {
            timeRange = availableHours.holiday;
        } else {
            const isWeekend = isKSTWeekend(selectedDate);
            timeRange = isWeekend ? availableHours.weekend : availableHours.weekday;
        }
        
        for (let hour = parseInt(timeRange.start); hour <= parseInt(timeRange.end); hour++) {
            if (hour < minimumHour) continue;

            const formattedTime = hour < 12 ? 
                `${hour}:00 (오전 ${hour}시)` : 
                hour === 12 ? 
                    `${hour}:00 (오후 12시)` : 
                    `${hour}:00 (오후 ${hour-12}시)`;

            const isBooked = bookedTimes.includes(hour);
            
            options.push({
                value: `${hour}:00`,
                label: isBooked ? `${formattedTime} - 예약됨` : formattedTime,
                disabled: isBooked,
                className: isBooked ? 'booked-time' : ''
            });
        }
        return options;
    };

    // 메시지를 표시하는 공통 함수
    const showTemporaryMessage = (messageText, isError = false) => {
        setMessage(messageText);
        setMessageType(isError ? 'error' : 'success');
        setMessageVisible(true);
        setShowMessage(true);

        setTimeout(() => {
            setMessageVisible(false);
            setTimeout(() => {
                setShowMessage(false);
                setMessage('');
            }, 500);
        }, 500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !memberName || !phoneNumber) {
            showTemporaryMessage('모든 정보를 입력해주세요.', true);
            return;
        }

        // 핸드폰 번호 형식 체크 (선택적)
        const phoneRegex = /^[0-9]{10,11}$/;  // 10-11자리 숫자
        if (!phoneRegex.test(phoneNumber.replace(/-/g, ''))) {
            showTemporaryMessage('올바른 핸드폰 번호를 입력해주세요.', true);
            return;
        }

        setIsSubmitting(true);

        try {
            setIsLoading(true);
            const dateTime = new Date(selectedDate);
            dateTime.setHours(parseInt(selectedTime), 0, 0, 0);

            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dateTime: dateTime.toISOString(),
                    memberName: memberName,
                    memberId: phoneNumber.replace(/-/g, '')  // 하이픈 제거하고 저장
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '예약 실패');
            }

            showTemporaryMessage('예약이 완료되었습니다!');
            setSelectedTime('');
            setMemberName('');
            setPhoneNumber('');
            checkBookedTimes(selectedDate);
        } catch (error) {
            console.error('예약 중 오류 발생:', error);
            showTemporaryMessage('예약 중 오류가 발생했습니다.', true);
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

    // 예약 조회 메시지를 위한 공통 함수
    const showTemporarySearchMessage = (messageText, type = 'success') => {
        setSearchMessage(messageText);
        setSearchMessageType(type);
        setSearchMessageVisible(true);
        setShowSearchMessage(true);

        setTimeout(() => {
            setSearchMessageVisible(false);
            setTimeout(() => {
                setShowSearchMessage(false);
                setSearchMessage('');
            }, 500);
        }, 500);
    };

    const handleSearchReservations = async () => {
        if (!searchMemberId) {
            showTemporarySearchMessage('회원번호를 입해주세요.', 'error');
            return;
        }
        if (searchMemberId.length !== 4) {
            showTemporarySearchMessage('회원번호는 4자리로 입력해 주세요.', 'error');
            return;
        }

        setIsSearchSubmitting(true);

        try {
            const response = await fetch(`/api/reservations?memberId=${searchMemberId}`);
            if (response.ok) {
                const data = await response.json();
                
                const sortedData = [...data].sort((a, b) => {
                    const dateA = new Date(`${a[0]}T${a[1]}`);
                    const dateB = new Date(`${b[0]}T${b[1]}`);
                    return dateA - dateB;
                });

                const reservedDates = sortedData.map(reservation => {
                    const [year, month, day] = reservation[0].split('-').map(Number);
                    return new Date(year, month - 1, day);
                });

                setMyReservations(sortedData);
                setReservationDates(reservedDates);
                
                if (data.length === 0) {
                    showTemporarySearchMessage('예약 내역이 없습니다.', 'error');
                } else {
                    showTemporarySearchMessage('예약 내역을 불러왔습니다.', 'success');
                }
            } else {
                throw new Error('Failed to fetch reservations');
            }
        } catch (error) {
            console.error('예약 조회 중 오류 발생:', error);
            showTemporarySearchMessage('예약 조회 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSearchSubmitting(false);
        }
    };

    // 예약된 날짜 표시를 위한 함수도 수정
    const tileClassName = ({ date }) => {
        return reservationDates.some(reservedDate => 
            date.getFullYear() === reservedDate.getFullYear() &&
            date.getMonth() === reservedDate.getMonth() &&
            date.getDate() === reservedDate.getDate()
        ) ? 'reserved-date' : '';
    };

    // 예약 변경 모달 열기
    const handleEdit = (reservation) => {
        setEditingReservation(reservation);
        setSelectedDate(null);
        setSelectedTime('');
        setIsEditing(true);
    };

    // 예약 변경 제출
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            showTemporaryMessage('날짜와 시간을 선택해 주세요.', true);
            return;
        }

        setIsSubmitting(true);

        const [hours] = selectedTime.split(':').map(Number);
        const reservationDate = getKSTDate(selectedDate);
        reservationDate.setHours(hours, 0, 0, 0);

        try {
            const response = await fetch('/api/reservations', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: editingReservation[4],
                    dateTime: reservationDate.toISOString(),
                    memberName: editingReservation[3],
                    memberId: editingReservation[2],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showTemporaryMessage('예약이 변경되었습니다!');
                setIsEditing(false);
                setEditingReservation(null);
                await handleSearchReservations(); // 예약 목록 새로고침
                await checkBookedTimes(selectedDate); // 예약 가능 시간 새로고침
            } else {
                showTemporaryMessage(data.error || '예약 변경에 실패했습니다.', true);
            }
        } catch (error) {
            console.error('예약 변경 중 오류 발생:', error);
            showTemporaryMessage('약 변경 중 오류가 발생했습니다.', true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 예 시간 표시할 때
    const formatTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
        return kstDate.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    if (!mounted) return null;

    return (
        <div className="container">
            <div className="header">
                <Link href="/">
                    <button className="main-button">
                        메인 페이지로 돌아가기
                    </button>
                </Link>
            </div>
            
            <div className="calendar-section">
                <ReservationCalendar 
                    onDateSelect={handleDateSelect} 
                    selectedDate={selectedDate} 
                    disabledDates={disabledDates}
                    availableHours={availableHours}
                    reservationPeriod={reservationPeriod}
                    holidays={holidays}
                />
            </div>

            {showMessage && (
                <div className={`floating-message ${messageType} ${messageVisible ? 'visible' : 'hidden'}`}>
                    {message}
                </div>
            )}

            <div className="reservation-section">
                <h2>예약하기</h2>
                <form onSubmit={handleSubmit} className="reservation-form">
                    <div className="time-selection">
                        <h3>시간 선택</h3>
                        <select 
                            value={selectedTime} 
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="time-select"
                            disabled={isLoading || !selectedDate}
                        >
                            <option value="">
                                {isLoading ? "예약 현황을 확인하는 중..." : 
                                 !selectedDate ? "날짜를 먼저 선택하세요" : 
                                 "시간을 선택하세요"}
                            </option>
                            {!isLoading && selectedDate && getTimeOptions().map(({ value, label, disabled, className }) => (
                                <option 
                                    key={value} 
                                    value={value} 
                                    disabled={disabled}
                                    className={className}
                                >
                                    {label}
                                </option>
                            ))}
                        </select>
                        {selectedDate?.toDateString() === new Date().toDateString() && availableHours.sameDay?.enabled && (
                            <small className="time-notice">
                                * 당일 예약의 경우 현재 시간으로부터 {availableHours.sameDay?.minHoursAfter || 2}시간 이후의 시간부터 선택 가능합니다
                            </small>
                        )}
                        {console.log('Rendering availableHours:', availableHours)}
                        {availableHours?.notice && (
                            <small className="time-notice" style={{ whiteSpace: 'pre-line', display: 'block', marginTop: '10px' }}>
                                {availableHours.notice}
                            </small>
                        )}
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="회원 이름"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                            className="input"
                        />
                        <input
                            type="tel"
                            placeholder="핸드폰 번호"
                            value={phoneNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^\d-]/g, '');
                                setPhoneNumber(value);
                            }}
                            maxLength={13}  // 하이픈 포함 13자리
                            className="input"
                        />
                        <small>예: 010-1234-5678</small>
                    </div>

                    <button 
                        type="submit"
                        disabled={!selectedDate || 
                                 !selectedTime || 
                                 !memberName || 
                                 !phoneNumber || 
                                 phoneNumber.length !== 11 ||
                                 isSubmitting}
                        className={isSubmitting ? 'submitting' : ''}
                    >
                        {isSubmitting ? '예약 진행 중...' : '예약하기'}
                    </button>
                </form>
            </div>

            <div className="search-section">
                <h2>예약 조회 및 변경</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="회원번호 (4자리)"
                        value={searchMemberId}
                        onChange={(e) => setSearchMemberId(e.target.value)}
                        maxLength={4}
                    />
                    <button 
                        onClick={handleSearchReservations}
                        disabled={!searchMemberId || searchMemberId.length !== 4 || isSearchSubmitting}
                        className={isSearchSubmitting ? 'submitting' : ''}
                    >
                        {isSearchSubmitting ? '조회 중...' : '조회하기'}
                    </button>
                </div>
            </div>

            <div className="reservations-container">
                <div className="reservations-info">
                    <div className="reservations-calendar">
                        <h3>예약된 날</h3>
                        <Calendar
                            value={null}
                            tileClassName={tileClassName}
                            locale="ko-KR"
                        />
                    </div>
                    <div className="reservations-list">
                        <h3>예약 상세 내역</h3>
                        {showSearchMessage && (
                            <div className={`message ${searchMessageType} ${searchMessageVisible ? 'visible' : 'hidden'}`}>
                                {searchMessage}
                            </div>
                        )}
                        {myReservations.length > 0 ? (
                            <div className="reservations-grid">
                                {myReservations.map((reservation, index) => (
                                    <ReservationItem 
                                        key={index} 
                                        reservation={reservation}
                                        onEdit={handleEdit}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="no-reservations">
                                회원번호를 입력하고 조회하기 버튼을 눌러주세요.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isEditing && (
                <>
                    <div className="edit-modal-backdrop"></div>
                    <div className="edit-modal">
                        <div className="edit-modal-content">
                            <h3>예약 변경</h3>
                            <div className="calendar-section">
                                <ReservationCalendar 
                                    onDateSelect={handleDateSelect} 
                                    selectedDate={selectedDate} 
                                    disabledDates={disabledDates}
                                    availableHours={availableHours}
                                    reservationPeriod={reservationPeriod}
                                    holidays={holidays}
                                />
                            </div>
                            <div className="time-selection">
                                <select 
                                    value={selectedTime} 
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="time-select"
                                    disabled={isLoading || !selectedDate}
                                >
                                    <option value="">
                                        {isLoading ? "예약 현황을 확인하는 중..." : 
                                         !selectedDate ? "날짜를 먼저 선택하세요" : 
                                         "시간을 선택하세요"}
                                    </option>
                                    {!isLoading && selectedDate && getTimeOptions().map(({ value, label, disabled }) => (
                                        <option 
                                            key={value} 
                                            value={value} 
                                            disabled={disabled}
                                        >
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {selectedDate?.toDateString() === new Date().toDateString() && (
                                    <small className="time-notice">
                                        * 당일 예약은 변경할 수 없습니다
                                    </small>
                                )}
                            </div>
                            <div className="edit-modal-buttons">
                                <button 
                                    onClick={handleEditSubmit}
                                    disabled={!selectedDate || !selectedTime || isSubmitting}
                                    className={isSubmitting ? 'submitting' : ''}
                                >
                                    {isSubmitting ? '변경 중...' : '변경하기'}
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingReservation(null);
                                        setSelectedDate(null);
                                        setSelectedTime('');
                                    }}
                                    className="cancel-button"
                                    disabled={isSubmitting}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    display: flex;
                    justify-content: flex-start;
                    margin-bottom: 20px;
                }
                .main-button {
                    padding: 8px 16px;
                    background-color: #1a73e8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .main-button:hover {
                    background-color: #0056b3;
                }
                .calendar-section {
                    display: flex;
                    justify-content: center;
                    margin: 20px 0;
                }
                .search-section, .reservation-section {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .reservation-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .search-container {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    align-items: center;
                }
                .input-group {
                    max-width: 300px;  /* 기존 너비의 절반 정도로 설정 */
                    margin: 0 auto;    /* 중앙 정렬 */
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .input-group input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 0.9rem;
                }
                .input-group small {
                    color: #666;
                    font-size: 0.8rem;
                    text-align: left;
                    margin-top: -5px;
                }
                .time-selection {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .reservations-list {
                    margin: 20px 0;
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .table-header {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    padding: 10px;
                    background: #f8f9fa;
                    font-weight: bold;
                    border-radius: 4px;
                    text-align: center;
                }
                .reservation-item {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                    align-items: center;
                    font-size: 0.95rem;
                }
                .reservation-item:hover {
                    background-color: #f8f9fa;
                }
                .reservation-item > div {
                    padding: 0 8px;
                }
                .no-reservations {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 0.9rem;
                }
                h2 {
                    margin-bottom: 15px;
                    color: #333;
                    text-align: center;
                }
                h3 {
                    margin: 0;
                    color: #333;
                    font-size: 1rem;
                }
                select {
                    width: 300px;
                    padding: 8px 12px;
                    margin: 10px 0;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                input {
                    width: 300px;
                    padding: 8px 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                button {
                    padding: 8px 16px;
                    background-color: #1a73e8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }
                button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                button.submitting {
                    position: relative;
                    background-color: #1557b0;
                    pointer-events: none;
                }
                button.submitting::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    top: 50%;
                    right: 10px;
                    transform: translateY(-50%);
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to {
                        transform: translateY(-50%) rotate(360deg);
                    }
                }
                @media (max-width: 768px) {
                    button.submitting {
                        padding-right: 40px;
                    }
                }
                .message {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 1.1rem;
                    font-weight: 500;
                    z-index: 1000;
                    min-width: 300px;
                    transition: all 0.5s ease-in-out;
                    opacity: 0;
                    max-height: 0;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .message.visible {
                    opacity: 1;
                    max-height: 100px;
                    margin: 20px 0;
                    padding: 15px;
                }
                .message.hidden {
                    opacity: 0;
                    max-height: 0;
                    margin: 0;
                    padding: 0;
                }
                .message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                .message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                .time-notice {
                    display: block;
                    color: #666;
                    margin-top: 5px;
                    font-size: 0.85rem;
                }
                .reservations-container {
                    margin-top: 20px;
                }

                .reservations-info {
                    display: flex;
                    gap: 20px;
                    align-items: flex-start;
                }

                .reservations-calendar {
                    background: white;
                    padding: 12px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    flex-shrink: 0;
                }

                .reservations-list {
                    flex-grow: 1;
                    background: white;
                    padding: 15px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .table-header {
                    margin-top: 10px;
                }

                @media (max-width: 768px) {
                    .reservations-container {
                        flex-direction: column;
                    }
                }

                .search-message {
                    padding: 10px;
                    margin-bottom: 15px;
                    border-radius: 4px;
                    text-align: center;
                    font-size: 0.9rem;
                    opacity: 0;
                    transition: all 0.5s ease-in-out;
                    max-height: 0;
                    overflow: hidden;
                }

                .search-message.visible {
                    opacity: 1;
                    max-height: 60px;
                    margin-bottom: 15px;
                    padding: 10px;
                }

                .search-message.hidden {
                    opacity: 0;
                    max-height: 0;
                    margin: 0;
                    padding: 0;
                }

                .search-message.success {
                    background-color: #d4edda;
                    color: #155724;
                }

                .search-message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .reservation-form button:disabled,
                .search-container button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 10px;
                        max-width: 100%;
                    }

                    .reservations-info {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .reservations-calendar,
                    .reservations-list {
                        width: 100%;
                    }

                    .input-group {
                        flex-direction: column;
                        width: 100%;
                    }

                    .input-group input {
                        width: 100%;
                        max-width: none;
                    }

                    .time-selection select {
                        width: 100%;
                        max-width: none;
                    }

                    .search-container {
                        width: 100%;
                    }

                    .search-container input {
                        width: 100%;
                        max-width: none;
                    }

                    .reservation-item {
                        font-size: 0.9rem;
                        padding: 8px 5px;
                    }

                    .table-header {
                        font-size: 0.9rem;
                        padding: 8px 5px;
                    }

                    button {
                        width: 100%;
                        padding: 12px;
                        font-size: 1rem;
                        margin: 5px 0;
                    }

                    .header button {
                        width: auto;
                    }

                    .message {
                        width: 90%;
                        font-size: 0.9rem;
                        min-width: auto;
                    }
                }

                @media (max-width: 480px) {
                    .reservation-item,
                    .table-header {
                        font-size: 0.8rem;
                        padding: 6px 3px;
                    }

                    h2 {
                        font-size: 1.3rem;
                    }

                    h3 {
                        font-size: 1.1rem;
                    }

                    .time-notice {
                        font-size: 0.8rem;
                    }
                }

                .edit-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .edit-modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .edit-modal-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                }

                .cancel-button {
                    background-color: #dc3545;
                }

                .cancel-button:hover {
                    background-color: #c82333;
                }

                .edit-button {
                    padding: 4px 8px;
                    font-size: 0.9rem;
                    background-color: #28a745;
                }

                .edit-button:hover {
                    background-color: #218838;
                }

                .edit-button.disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .edit-modal-content {
                        width: 95%;
                        padding: 15px;
                    }
                }

                .edit-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                }

                .edit-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1001;
                    width: 90%;
                    max-width: 500px;
                }

                .floating-message {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 2000;
                    padding: 15px 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    opacity: 0;
                    visibility: hidden;
                }

                .floating-message.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .floating-message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .floating-message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .reservation-item {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
                    gap: 10px;
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                    align-items: center;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
                    gap: 10px;
                    padding: 12px;
                    background-color: #f8f9fa;
                    font-weight: bold;
                    border-bottom: 2px solid #dee2e6;
                }

                .date-column {
                    text-align: left;
                }

                .time-column {
                    text-align: center;
                }

                .name-column {
                    text-align: center;
                }

                .id-column {
                    text-align: center;
                }

                .action-column {
                    text-align: right;
                }

                .edit-button {
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: all 0.2s;
                }

                .edit-button:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                .edit-button.disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .reservation-item,
                    .table-header {
                        grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
                        font-size: 0.9em;
                        gap: 5px;
                    }

                    .edit-button {
                        padding: 4px 8px;
                        font-size: 0.8em;
                    }
                }

                .reservations-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin-top: 20px;
                    background: white;
                    border: 1px solid #dee2e6;
                }

                .reservations-table th {
                    background: #f8f9fa;
                    font-weight: bold;
                    padding: 15px 8px;
                    border-bottom: 2px solid #adb5bd;
                    text-align: center;
                }

                .reservations-table td {
                    padding: 20px 8px;
                    text-align: center;
                    border-bottom: 1px solid #dee2e6;
                    background: white;
                }

                .reservation-row {
                    transition: background-color 0.2s;
                }

                .reservation-row:hover td {
                    background-color: #f8f9fa;
                }

                .reservation-row:last-child td {
                    border-bottom: none;
                }

                .edit-button {
                    padding: 10px 20px;
                    border-radius: 4px;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    min-width: 90px;
                    transition: background-color 0.2s;
                }

                .edit-button:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                @media (max-width: 768px) {
                    .reservations-table {
                        font-size: 0.85rem;
                    }

                    .reservations-table th {
                        padding: 12px 4px;
                    }

                    .reservations-table td {
                        padding: 15px 4px;
                    }

                    .edit-button {
                        padding: 8px 16px;
                        font-size: 0.85rem;
                        min-width: 80px;
                    }
                }

                .reservations-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .reservation-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #eaeaea;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .reservation-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }

                .card-header {
                    background: #f8f9fa;
                    padding: 12px 16px;
                    border-bottom: 1px solid #eaeaea;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .date-badge {
                    font-weight: 600;
                    color: #495057;
                    font-size: 1rem;
                }

                .time-badge {
                    background: #e7f1ff;
                    color: #0056b3;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .card-body {
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .member-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .name {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #212529;
                }

                .member-id {
                    color: #6c757d;
                    font-size: 0.9rem;
                }

                .edit-button {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .edit-button:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                .edit-button.disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                    opacity: 0.8;
                }

                @media (max-width: 768px) {
                    .reservations-grid {
                        padding: 12px;
                    }

                    .card-header {
                        padding: 10px 12px;
                    }

                    .card-body {
                        padding: 12px;
                    }

                    .date-badge {
                        font-size: 0.95rem;
                    }

                    .time-badge {
                        font-size: 0.85rem;
                        padding: 4px 10px;
                    }

                    .name {
                        font-size: 1rem;
                    }

                    .member-id {
                        font-size: 0.85rem;
                    }

                    .edit-button {
                        padding: 8px 14px;
                        font-size: 0.85rem;
                    }
                }
            `}</style>

            <style jsx global>{`
                .time-select {
                    width: 300px;
                    padding: 8px 12px;
                    margin: 10px 0;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    font-size: 1rem;
                    background-color: white;
                }

                .time-select option {
                    padding: 8px;
                    font-size: 1rem;
                }

                .time-select option:disabled {
                    color: #999;
                    font-style: italic;
                    background-color: #f5f5f5;
                }

                .time-select option.booked-time {
                    color: #dc3545;
                    background-color: #f8d7da;
                }

                .time-select option.past-time {
                    color: #6c757d;
                    background-color: #e9ecef;
                }

                @media (max-width: 768px) {
                    .time-select {
                        width: 100%;
                        max-width: none;
                        height: 44px;
                        font-size: 16px;
                    }

                    .time-select option {
                        padding: 12px;
                        font-size: 16px;
                    }
                }

                .time-select:disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                }

                .time-select option:disabled {
                    color: #999;
                    font-style: italic;
                    background-color: #f5f5f5;
                }

                .time-select option.booked-time {
                    color: #dc3545;
                    background-color: #f8d7da;
                }

                .time-select option.past-time {
                    color: #6c757d;
                    background-color: #e9ecef;
                }

                .reserved-date {
                    background-color: #007AFF !important;
                    color: white !important;
                    font-weight: bold !important;
                    position: relative;
                }

                .reserved-date:hover {
                    background-color: #0056b3 !important;
                }

                /* 예약된 날짜에 시각적 표시 추가 */
                .reserved-date::after {
                    content: '';
                    position: absolute;
                    bottom: 3px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: white;
                }

                /* 캘더 스타일 수정 */
                .reservations-calendar .react-calendar {
                    width: 280px !important;
                    font-size: 0.8rem;
                    background: white;
                    border: none;
                    border-radius: 8px;
                }

                .reservations-calendar .react-calendar__month-view__days__day {
                    aspect-ratio: 1;
                    height: auto;
                    padding: 8px 0 !important;
                    font-size: 0.85rem;
                }

                .reservations-calendar .react-calendar__navigation {
                    height: 32px;
                    margin-bottom: 8px;
                }

                .reservations-calendar .react-calendar__navigation button {
                    font-size: 0.9rem;
                    min-width: 32px;
                }

                .reservations-calendar .react-calendar__month-view__weekdays {
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .reservations-calendar .react-calendar__month-view__weekdays__weekday {
                    padding: 0.5em;
                }

                .reserved-date {
                    background-color: #007AFF !important;
                    color: white !important;
                    font-weight: 500 !important;
                }

                .reserved-date:hover {
                    background-color: #0056b3 !important;
                }

                /* 요일 표시 스타일 */
                .reservations-calendar .react-calendar__month-view__weekdays abbr {
                    text-decoration: none;
                    color: #666;
                }

                .time-select option.booked-time {
                    color: #dc3545 !important;
                    font-style: italic;
                    background-color: #f8d7da;
                }

                .time-select option:disabled {
                    color: #dc3545 !important;
                    background-color: #f8d7da;
                }

                @media (max-width: 768px) {
                    .time-select option.booked-time {
                        color: #dc3545 !important;
                        background-color: #f8d7da;
                    }
                }

                /* 예약 조회 캘린더 스타일 수 */
                .reservations-calendar .react-calendar__tile {
                    color: #000 !important;
                    font-weight: 500;
                }

                /* 토요 스타일 (6번째 열) */
                .reservations-calendar .react-calendar__month-view__days__day:nth-child(7n+6) {
                    color: #1a73e8 !important;
                }

                /* 일요일 스타일 (7번째 열) */
                .reservations-calendar .react-calendar__month-view__days__day:nth-child(7n) {
                    color: #d10000 !important;
                }

                /* 이웃하는 달의 날짜도 동일한 스타일 적용 */
                .reservations-calendar .react-calendar__month-view__days__day--neighboringMonth {
                    opacity: 1;
                    color: #000 !important;
                }

                .reservations-calendar .react-calendar__month-view__days__day--neighboringMonth:nth-child(7n+6) {
                    color: #1a73e8 !important;
                }

                .reservations-calendar .react-calendar__month-view__days__day--neighboringMonth:nth-child(7n) {
                    color: #d10000 !important;
                }

                /* 예약된 날짜 스타일 유지 */
                .reservations-calendar .reserved-date {
                    background-color: #007AFF !important;
                    color: white !important;
                }

                .reservations-calendar .reserved-date:nth-child(7n+6),
                .reservations-calendar .reserved-date:nth-child(7n) {
                    color: white !important;
                }

                /* 요일 헤더 스타일 */
                .reservations-calendar .react-calendar__month-view__weekdays__weekday:nth-child(6) abbr {
                    color: #1a73e8;
                }

                .reservations-calendar .react-calendar__month-view__weekdays__weekday:nth-child(7) abbr {
                    color: #d10000;
                }
            `}</style>
        </div>
    );
};

export default ReservationsPage;
