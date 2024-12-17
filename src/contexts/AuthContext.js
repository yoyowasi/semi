import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ loggedIn: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log("AuthProvider checking localStorage token:", token);

        if (token) {
            setUser({ loggedIn: true });
        } else {
            setUser({ loggedIn: false }); // 토큰이 없을 경우 상태를 명확히 설정
        }
    }, []);


    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
