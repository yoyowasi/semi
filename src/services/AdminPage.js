import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [unapprovedUsers, setUnapprovedUsers] = useState([]); // 유저 데이터 상태
    const [error, setError] = useState(null); // 에러 상태 추가

    // 승인되지 않은 유저 불러오기
    const fetchUnapprovedUsers = async () => {
        const token = localStorage.getItem("token"); // JWT 토큰 가져오기
        try {
            const response = await axios.get('http://localhost:8080/api/user/unapproved-users', {
                headers: {
                    Authorization: `Bearer ${token}`, // 토큰 추가
                },
            });
            setUnapprovedUsers(response.data);
        } catch (err) {
            console.error('Error fetching unapproved users:', err.message);
            setError('Failed to load unapproved users.');
        }
    };

    // 유저 승인 처리
    const approveUser = async (user_no) => {
        const token = localStorage.getItem("token"); // JWT 토큰 가져오기
        try {
            await axios.post(`http://localhost:8080/api/user/approve-user/${user_no}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('User approved successfully!');
            fetchUnapprovedUsers(); // 승인 후 목록 갱신
        } catch (err) {
            console.error('Error approving user:', err.message);
            alert('Failed to approve user.');
        }
    };

    // 페이지 마운트 시 데이터 불러오기
    useEffect(() => {
        fetchUnapprovedUsers();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>관리자 페이지</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th>User No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {unapprovedUsers.length > 0 ? (
                    unapprovedUsers.map((user) => (
                        <tr key={user.user_no}>
                            <td>{user.user_no}</td>
                            <td>{user.user_name}</td>
                            <td>{user.userEmail}</td>
                            <td>
                                <button onClick={() => approveUser(user.user_no)}>Approve</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>
                            승인되지 않은 유저가 없습니다.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;
