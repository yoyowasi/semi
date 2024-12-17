import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ loggedIn: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log("Sending token in request:", token);

        fetch("http://localhost:8080/api/data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Bearer 토큰 형식
            }
        })
            .then(response => response.json())
            .then(data => console.log("Received data:", data))
            .catch(err => console.error("Fetch error:", err));


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
