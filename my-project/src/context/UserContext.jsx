import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
  name: localStorage.getItem('name') || '',
  email: localStorage.getItem('email') || '',
  contact: localStorage.getItem('contact') || '',
});

  const updateUser = (name, email) => {
    localStorage.setItem('name', name || 'User');
    localStorage.setItem('email', email || '');
    setUser({ name: name || 'User', email: email || '' });
  };

  useEffect(() => {
    // In case localStorage changes elsewhere
    const storedName = localStorage.getItem('name') || 'User';
    const storedEmail = localStorage.getItem('email') || '';
    setUser({ name: storedName, email: storedEmail });
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
