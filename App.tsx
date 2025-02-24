import React, { useState, useEffect } from 'react';
import { Lock, Edit2, Trash2, UserPlus, RefreshCw, Users } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  color: string;
  rating: number;
}

function App() {
  const [mainTeam, setMainTeam] = useState<Player[]>([]);
  const [waitingList, setWaitingList] = useState<Player[]>([]);
  const [password, setPassword] = useState('');
  const [teams, setTeams] = useState<{ team1: Player[], team2: Player[], team3: Player[] }>({
    team1: [],
    team2: [],
    team3: []
  });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newColor, setNewColor] = useState('#000000');

  const CORRECT_PASSWORD = '1234567';

  useEffect(() => {
    const savedMainTeam = localStorage.getItem('mainTeam');
    const savedWaitingList = localStorage.getItem('waitingList');

    if (savedMainTeam) setMainTeam(JSON.parse(savedMainTeam));
    if (savedWaitingList) setWaitingList(JSON.parse(savedWaitingList));
  }, []);

  useEffect(() => {
    localStorage.setItem('mainTeam', JSON.stringify(mainTeam));
    localStorage.setItem('waitingList', JSON.stringify(waitingList));
  }, [mainTeam, waitingList]);

  const addPlayer = (list: 'main' | 'waiting') => {
    if (!newPlayerName.trim()) return;

    const newPlayer = {
      id: Date.now(),
      name: newPlayerName,
      color: '#000000',
      rating: 5
    };

    if (list === 'main') {
      if (mainTeam.length < 18 && !mainTeam.some(p => p.name === newPlayerName)) {
        setMainTeam([...mainTeam, newPlayer]);
      }
    } else if (list === 'waiting') {
      if (password === CORRECT_PASSWORD && waitingList.length < 5 && !waitingList.some(p => p.name === newPlayerName)) {
        setWaitingList([...waitingList, newPlayer]);
      }
    }

    setNewPlayerName('');
  };

  const clearList = (list: 'main' | 'waiting') => {
    if (password !== CORRECT_PASSWORD) return;

    if (list === 'main') setMainTeam([]);
    if (list === 'waiting') setWaitingList([]);
    setTeams({ team1: [], team2: [], team3: [] });
  };

  const editPlayer = (player: Player, list: 'main' | 'waiting') => {
    if (password !== CORRECT_PASSWORD) return;
    setEditingPlayer(player);
    setNewColor(player.color);
  };

  const saveEdit = (list: 'main' | 'waiting') => {
    if (!editingPlayer) return;

    const updatePlayer = { ...editingPlayer, color: newColor };

    if (list === 'main') {
      setMainTeam(mainTeam.map(p => p.id === editingPlayer.id ? updatePlayer : p));
    } else if (list === 'waiting') {
      setWaitingList(waitingList.map(p => p.id === editingPlayer.id ? updatePlayer : p));
    }

    setEditingPlayer(null);
    setNewColor('#000000');
  };

  const updateRating = (playerId: number, rating: number) => {
    if (password !== CORRECT_PASSWORD) return;
    setMainTeam(mainTeam.map(p => p.id === playerId ? { ...p, rating } : p));
  };

  const generateTeams = () => {
    if (password !== CORRECT_PASSWORD || mainTeam.length < 18) return;

    const sortedPlayers = [...mainTeam].sort((a, b) => b.rating - a.rating);
    const team1: Player[] = [];
    const team2: Player[] = [];
    const team3: Player[] = [];

    // Distribute players using a snake draft pattern for better balance
    sortedPlayers.forEach((player, index) => {
      const round = Math.floor(index / 3);
      if (round % 2 === 0) {
        // Forward round
        if (index % 3 === 0) team1.push(player);
        else if (index % 3 === 1) team2.push(player);
        else team3.push(player);
      } else {
        // Reverse round
        if (index % 3 === 0) team3.push(player);
        else if (index % 3 === 1) team2.push(player);
        else team1.push(player);
      }
    });

    setTeams({ team1, team2, team3 });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Image */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop"
            alt="Funny football scene"
            className="w-full h-64 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Team List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Lista fotbal</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Nume jucător"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => addPlayer('main')}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                disabled={mainTeam.length >= 18}
              >
                <UserPlus size={20} /> Adaugă
              </button>
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolă pentru acțiuni"
                className="p-2 border rounded w-full"
              />
            </div>
            <button
              onClick={() => clearList('main')}
              className="bg-red-500 text-white px-4 py-2 rounded mb-4 flex items-center gap-2"
            >
              <Trash2 size={20} /> Șterge lista
            </button>
            <ul className="space-y-2">
              {mainTeam.map((player, index) => (
                <li key={player.id} className="flex items-center gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  <div
                    className="w-6 h-6 border"
                    style={{ backgroundColor: player.color }}
                  />
                  <span>{player.name}</span>
                  <button
                    onClick={() => editPlayer(player, 'main')}
                    className="ml-auto bg-gray-200 p-2 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Waiting List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Lista de așteptare</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Nume jucător"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => addPlayer('waiting')}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                disabled={waitingList.length >= 5}
              >
                <UserPlus size={20} /> Adaugă
              </button>
            </div>
            <button
              onClick={() => clearList('waiting')}
              className="bg-red-500 text-white px-4 py-2 rounded mb-4 flex items-center gap-2"
            >
              <Trash2 size={20} /> Șterge lista
            </button>
            <ul className="space-y-2">
              {waitingList.map((player, index) => (
                <li key={player.id} className="flex items-center gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  <div
                    className="w-6 h-6 border"
                    style={{ backgroundColor: player.color }}
                  />
                  <span>{player.name}</span>
                  <button
                    onClick={() => editPlayer(player, 'waiting')}
                    className="ml-auto bg-gray-200 p-2 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rated Players List */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Jucători cu note</h2>
          <ul className="space-y-2">
            {mainTeam.map((player, index) => (
              <li key={player.id} className="flex items-center gap-2">
                <span className="font-bold">{index + 1}.</span>
                <span>{player.name}</span>
                <select
                  value={player.rating}
                  onChange={(e) => updateRating(player.id, parseInt(e.target.value))}
                  className="ml-auto p-2 border rounded"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <button
              onClick={generateTeams}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Users size={20} /> Generează echipe
            </button>
            <button
              onClick={generateTeams}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <RefreshCw size={20} /> Regenerează
            </button>
          </div>
        </div>

        {/* Generated Teams */}
        {teams.team1.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Team 1</h3>
              <ul className="space-y-2">
                {teams.team1.map((player) => (
                  <li key={player.id} className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span className="font-bold">{player.rating}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right">
                Media: {(teams.team1.reduce((acc, p) => acc + p.rating, 0) / teams.team1.length).toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Team 2</h3>
              <ul className="space-y-2">
                {teams.team2.map((player) => (
                  <li key={player.id} className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span className="font-bold">{player.rating}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right">
                Media: {(teams.team2.reduce((acc, p) => acc + p.rating, 0) / teams.team2.length).toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Team 3</h3>
              <ul className="space-y-2">
                {teams.team3.map((player) => (
                  <li key={player.id} className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span className="font-bold">{player.rating}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right">
                Media: {(teams.team3.reduce((acc, p) => acc + p.rating, 0) / teams.team3.length).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Editare jucător</h3>
              <input
                type="text"
                value={editingPlayer.name}
                onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                className="p-2 border rounded w-full mb-4"
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit('main')}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Salvează
                </button>
                <button
                  onClick={() => setEditingPlayer(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;