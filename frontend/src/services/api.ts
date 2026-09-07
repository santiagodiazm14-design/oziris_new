const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Track {
  id: string;
  title: string;
  description?: string;
  price: number;
  genre?: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  audioUrl: string;
  fullAudioUrl?: string;
  coverUrl?: string;
  producerId: string;
  producer?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function fetchTracks(genre?: string): Promise<Track[]> {
  const url = genre ? `${API_URL}/tracks?genre=${encodeURIComponent(genre)}` : `${API_URL}/tracks`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Error al obtener la lista de Beats.');
  }
  return res.json();
}

export async function fetchTrackById(id: string): Promise<Track> {
  const res = await fetch(`${API_URL}/tracks/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Error al obtener el Beat.');
  }
  return res.json();
}

export function uploadBeat(
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<Track> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/tracks`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error('Respuesta inválida del servidor.'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || 'Error al subir el Beat.'));
        } catch (e) {
          reject(new Error(`Error al subir el Beat (código ${xhr.status}).`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Error de conexión con el servidor backend.'));
    };

    xhr.send(formData);
  });
}
