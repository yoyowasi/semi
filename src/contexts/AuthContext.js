import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ loggedIn: false });

    // useEffect로 localStorage의 token 확인 및 상태 업데이트
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log("Token found:", token); // 디버깅용 로그
            setUser({ loggedIn: true });
        }
    }, []); // 빈 배열은 컴포넌트가 처음 렌더링될 때만 실행

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
