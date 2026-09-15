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

export interface User {
  id: string;
  name: string;
  lastName?: string | null;
  artistName?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  email: string;
  role: 'ADMIN' | 'USER' | 'PRODUCER' | 'BUYER' | string;
  bio?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProducers: number;
  totalTracks: number;
  totalSales: number;
  totalRevenue: number;
}

// -------------------------------------------------------------
// AUTHENTICATION APIs
// -------------------------------------------------------------
export async function registerApi(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error en el registro de usuario.');
  }
  return data;
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Credenciales incorrectas o problema de inicio de sesión.');
  }
  return data;
}

export async function getProfileApi(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al obtener el perfil de usuario.');
  }
  return data;
}

// -------------------------------------------------------------
// USER PROFILE & FAVORITES APIs
// -------------------------------------------------------------
export async function updateProfileApi(
  token: string,
  payload: Partial<{
    name: string;
    lastName: string;
    artistName: string;
    location: string;
    bio: string;
    avatarUrl: string;
  }>,
): Promise<User> {
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al actualizar el perfil.');
  }
  return data;
}

export async function uploadAvatarApi(token: string, file: File): Promise<User> {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API_URL}/users/profile/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al subir la imagen de avatar.');
  }
  return data;
}

export async function fetchFavoritesApi(token: string): Promise<Track[]> {
  const res = await fetch(`${API_URL}/users/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al obtener favoritos.');
  }
  return data;
}

export async function toggleFavoriteApi(
  token: string,
  trackId: string,
): Promise<{ isFavorite: boolean; message: string }> {
  const res = await fetch(`${API_URL}/users/favorites/${trackId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al cambiar estado de favorito.');
  }
  return data;
}

// -------------------------------------------------------------
// ADMIN MANAGEMENT APIs
// -------------------------------------------------------------
export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_URL}/users/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al obtener estadísticas del administrador.');
  }
  return data;
}

export async function fetchAdminUsers(token: string, search?: string): Promise<User[]> {
  const url = search
    ? `${API_URL}/users?search=${encodeURIComponent(search)}`
    : `${API_URL}/users`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al obtener la lista de usuarios.');
  }
  return data;
}

export async function updateAdminUser(
  token: string,
  id: string,
  payload: Partial<{
    name: string;
    lastName: string;
    artistName: string;
    location: string;
    role: string;
    isActive: boolean;
    bio: string;
    avatarUrl: string;
  }>,
): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al actualizar usuario.');
  }
  return data;
}

export async function deleteAdminUser(token: string, id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al eliminar usuario.');
  }
  return data;
}

export async function deleteTrackApi(token: string, id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/tracks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al eliminar Beat.');
  }
  return data;
}

// -------------------------------------------------------------
// TRACKS APIs
// -------------------------------------------------------------
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
