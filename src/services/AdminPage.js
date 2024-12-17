import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [unapprovedUsers, setUnapprovedUsers] = useState([]); // 유저 데이터 상태

    // 유저 목록 불러오기
    const fetchUnapprovedUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/user/unapproved-users');
            setUnapprovedUsers(response.data);
        } catch (error) {
            console.error('Error fetching unapproved users:', error);
        }
    };

    // 유저 승인 처리
    const approveUser = async (user_no) => {
        try {
            await axios.post(`http://localhost:8080/api/user/approve-user/${user_no}`);
            alert('User approved successfully!');
            fetchUnapprovedUsers(); // 승인 후 목록 갱신
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Failed to approve user.');
        }
    };

    // 컴포넌트 마운트 시 데이터 불러오기
    useEffect(() => {
        fetchUnapprovedUsers();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>관리자 페이지</h1>
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
                            <td>{user.name}</td>
                            <td>{user.email}</td>
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
