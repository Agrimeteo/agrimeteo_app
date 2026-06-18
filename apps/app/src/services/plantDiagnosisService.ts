import api from './api';

export const analyzePlantImage = async (image: string, description: string) => {
  const response = await api.post('/chat/diagnosis/plant', {
    image,
    description,
  });

  return response.data?.data?.diagnosis as string | undefined;
};
