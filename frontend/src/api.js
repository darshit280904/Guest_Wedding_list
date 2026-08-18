import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Lots
export const getLots = () => API.get('/lots');
export const getLot = (id) => API.get(`/lots/${id}`);
export const createLot = (data) => API.post('/lots', data);
export const updateLot = (id, data) => API.put(`/lots/${id}`, data);
export const deleteLot = (id) => API.delete(`/lots/${id}`);

// Guests
export const getGuests = (lotId, page = 1, limit = 100, search = '') =>
  API.get(`/guests?lotId=${lotId}&page=${page}&limit=${limit}&search=${search}`);
export const addGuest = (data) => API.post('/guests', data);
export const bulkAddGuests = (data) => API.post('/guests/bulk', data);
export const updateGuest = (id, data) => API.put(`/guests/${id}`, data);
export const deleteGuest = (id) => API.delete(`/guests/${id}`);
export const deleteAllGuestsInLot = (lotId) => API.delete(`/guests/lot/${lotId}`);
export const parseFile = (formData) =>
  API.post('/guests/parse-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Export
export const exportPDF = (lotId) =>
  API.get(`/export/pdf/${lotId}`, { responseType: 'blob' });
export const exportWord = (lotId) =>
  API.get(`/export/word/${lotId}`, { responseType: 'blob' });

export default API;
