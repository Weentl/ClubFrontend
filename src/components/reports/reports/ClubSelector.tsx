// components/ClubSelector.tsx
import { useEffect, useState } from 'react';

interface Club {
  _id: string;
  clubName?: string;
  name?: string;
  isMain?: boolean;
}

interface ClubSelectorProps {
  onClubChange: (clubId: string | null) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ClubSelector({ onClubChange }: ClubSelectorProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('global');
  const [userId, setUserId] = useState<string | null>(null);

  // Al iniciar, intenta leer el usuario y el club guardado en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id) {
          setUserId(user.id);
        } else {
          console.error('No se encontró el campo id en el usuario almacenado.');
        }
      } catch (err) {
        console.error('Error al parsear el usuario desde localStorage:', err);
      }
    } else {
      console.error('No se encontró información de usuario en localStorage.');
    }

    const storedClub = localStorage.getItem('reportclub');
    if (storedClub) {
      setSelectedClub(storedClub);
      onClubChange(storedClub);
    }
  }, [onClubChange]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/clubs?user=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error('Unexpected response format:', data);
        } else {
          setClubs(data);
        }
      })
      .catch((err) => console.error('Error fetching clubs:', err));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClub(value);
    if (value === 'global') {
      localStorage.removeItem('reportclub');
      onClubChange("global");
    } else {
      localStorage.setItem('reportclub', value);
      onClubChange(value);
    }
  };


  return (
    <div>
      <label htmlFor="clubSelector" className="mr-2">
        Selecciona Club:
      </label>
      <select id="clubSelector" value={selectedClub} onChange={handleChange}>
        <option value="global">Global</option>
        {clubs.map((club) => (
          <option key={club._id} value={club._id}>
            {club.clubName || club.name}
          </option>
        ))}
      </select>
    </div>
  );
}

