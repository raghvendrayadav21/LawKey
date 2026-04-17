import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/signin', { username, password });
        if (res.data.token) {
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return res.data;
        }
        return null;
    };

    const register = async (data) => {
        return await api.post('/auth/signup', data);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
