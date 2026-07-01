import api from './axiosConfig';

export const handleDownload = async (fileName) => {
  try {
    const response = await api.get(`/files/${fileName}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Tên file tải về
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    alert(err.response?.data?.message);
  }
};