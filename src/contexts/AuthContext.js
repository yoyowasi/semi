import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ loggedIn: false });

    // useEffect로 localStorage의 token 확인 및 상태 업데이트
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log("AuthProvider checking localStorage token:", token); // 로그 추가
        if (token) {
            setUser({ loggedIn: true }); // 상태 업데이트
            console.log("User logged in state set to true");
        } else {
            console.log("No token found, user remains logged out");
        }
    }, []);


    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
