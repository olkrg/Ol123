import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';

// Game constants
const RACES = {
  HUMAN: 'human',
  ORC: 'orc',
  UNDEAD: 'undead',
  NIGHT_ELF: 'night_elf'
};

const UNIT_TYPES = {
  WORKER: 'worker',
  WARRIOR: 'warrior',
  ARCHER: 'archer',
  HERO: 'hero'
};

const BUILDING_TYPES = {
  TOWN_HALL: 'town_hall',
  BARRACKS: 'barracks',
  FARM: 'farm',
  TOWER: 'tower'
};

// Mock game data
const mockUnits = [
  { id: 1, type: UNIT_TYPES.HERO, name: 'Paladin', health: 100, mana: 80, race: RACES.HUMAN, level: 3, x: 300, y: 200, selected: false },
  { id: 2, type: UNIT_TYPES.WARRIOR, name: 'Footman', health: 85, mana: 0, race: RACES.HUMAN, level: 1, x: 250, y: 220, selected: false },
  { id: 3, type: UNIT_TYPES.ARCHER, name: 'Rifleman', health: 70, mana: 0, race: RACES.HUMAN, level: 1, x: 350, y: 180, selected: false },
  { id: 4, type: UNIT_TYPES.WORKER, name: 'Peasant', health: 60, mana: 0, race: RACES.HUMAN, level: 1, x: 200, y: 250, selected: false },
];

const mockBuildings = [
  { id: 1, type: BUILDING_TYPES.TOWN_HALL, name: 'Town Hall', health: 500, race: RACES.HUMAN, x: 150, y: 150, producing: null },
  { id: 2, type: BUILDING_TYPES.BARRACKS, name: 'Barracks', health: 300, race: RACES.HUMAN, x: 400, y: 250, producing: 'Footman' },
  { id: 3, type: BUILDING_TYPES.FARM, name: 'Farm', health: 150, race: RACES.HUMAN, x: 100, y: 300, producing: null },
];

// Resource Panel Component
export const ResourcePanel = ({ resources }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-amber-900 to-amber-800 border-b-2 border-amber-600 px-4 py-2">
      <div className="flex justify-center items-center space-x-8 max-w-md mx-auto">
        <div className="flex items-center space-x-2 bg-yellow-600 px-3 py-1 rounded-lg border-2 border-yellow-400">
          <div className="w-4 h-4 bg-yellow-300 rounded-full border border-yellow-600"></div>
          <span className="text-yellow-100 font-bold text-sm">{resources.gold}</span>
        </div>
        <div className="flex items-center space-x-2 bg-green-700 px-3 py-1 rounded-lg border-2 border-green-500">
          <div className="w-4 h-4 bg-green-400 rounded border border-green-800"></div>
          <span className="text-green-100 font-bold text-sm">{resources.lumber}</span>
        </div>
        <div className="flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded-lg border-2 border-blue-500">
          <div className="w-4 h-4 bg-blue-400 rounded-full border border-blue-800"></div>
          <span className="text-blue-100 font-bold text-sm">{resources.food}/{resources.maxFood}</span>
        </div>
      </div>
    </div>
  );
};

// Mini Map Component
export const MiniMap = ({ units, buildings, mapSize = 200 }) => {
  return (
    <div className="fixed bottom-20 left-2 z-40 bg-black bg-opacity-80 border-2 border-amber-600 rounded-lg p-2">
      <div 
        className="relative bg-gradient-to-br from-green-900 to-green-800 rounded border border-amber-500"
        style={{ width: mapSize, height: mapSize }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 rounded"></div>
        
        {/* Units on minimap */}
        {units.map(unit => (
          <div
            key={unit.id}
            className={`absolute w-2 h-2 rounded-full ${
              unit.race === RACES.HUMAN ? 'bg-blue-400' : 'bg-red-400'
            } border border-white`}
            style={{
              left: (unit.x / 500) * mapSize,
              top: (unit.y / 400) * mapSize,
            }}
          />
        ))}
        
        {/* Buildings on minimap */}
        {buildings.map(building => (
          <div
            key={building.id}
            className={`absolute w-3 h-3 ${
              building.race === RACES.HUMAN ? 'bg-blue-600' : 'bg-red-600'
            } border border-white`}
            style={{
              left: (building.x / 500) * mapSize,
              top: (building.y / 400) * mapSize,
            }}
          />
        ))}
        
        {/* View area indicator */}
        <div className="absolute inset-4 border-2 border-yellow-400 bg-yellow-400 bg-opacity-20 rounded"></div>
      </div>
    </div>
  );
};

// Unit Component
export const Unit = ({ unit, onSelect, isSelected, onMove }) => {
  const [position, setPosition] = useState({ x: unit.x, y: unit.y });
  
  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
    onMove(unit.id, data.x, data.y);
  };

  const getUnitIcon = (type, race) => {
    if (type === UNIT_TYPES.HERO) return '👑';
    if (type === UNIT_TYPES.WARRIOR) return '⚔️';
    if (type === UNIT_TYPES.ARCHER) return '🏹';
    if (type === UNIT_TYPES.WORKER) return '🔨';
    return '🛡️';
  };

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      bounds="parent"
    >
      <motion.div
        className={`absolute cursor-pointer select-none ${
          isSelected ? 'z-30' : 'z-20'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(unit.id);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isSelected ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 1, repeat: isSelected ? Infinity : 0 }}
      >
        {/* Selection circle */}
        {isSelected && (
          <div className="absolute -inset-4 border-2 border-yellow-400 rounded-full bg-yellow-400 bg-opacity-20 animate-pulse"></div>
        )}
        
        {/* Unit portrait */}
        <div className={`w-12 h-12 rounded-full border-2 ${
          isSelected ? 'border-yellow-400' : 'border-gray-600'
        } bg-gradient-to-br from-amber-800 to-amber-900 flex items-center justify-center text-lg shadow-lg`}>
          {getUnitIcon(unit.type, unit.race)}
        </div>
        
        {/* Health bar */}
        <div className="absolute -bottom-2 left-0 right-0 bg-black bg-opacity-60 rounded-full h-1.5 border border-gray-400">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
            style={{ width: `${unit.health}%` }}
          ></div>
        </div>
        
        {/* Mana bar (for heroes and casters) */}
        {unit.mana > 0 && (
          <div className="absolute -bottom-4 left-0 right-0 bg-black bg-opacity-60 rounded-full h-1 border border-gray-400">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
              style={{ width: `${unit.mana}%` }}
            ></div>
          </div>
        )}
        
        {/* Level indicator for heroes */}
        {unit.type === UNIT_TYPES.HERO && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-yellow-300 text-xs w-5 h-5 rounded-full flex items-center justify-center border border-yellow-400 font-bold">
            {unit.level}
          </div>
        )}
      </motion.div>
    </Draggable>
  );
};

// Building Component
export const Building = ({ building, onSelect, isSelected }) => {
  const getBuildingIcon = (type) => {
    switch(type) {
      case BUILDING_TYPES.TOWN_HALL: return '🏰';
      case BUILDING_TYPES.BARRACKS: return '⚔️';
      case BUILDING_TYPES.FARM: return '🌾';
      case BUILDING_TYPES.TOWER: return '🗼';
      default: return '🏢';
    }
  };

  return (
    <motion.div
      className={`absolute cursor-pointer select-none ${
        isSelected ? 'z-30' : 'z-10'
      }`}
      style={{ left: building.x, top: building.y }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(building.id);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -inset-2 border-2 border-yellow-400 rounded bg-yellow-400 bg-opacity-20 animate-pulse"></div>
      )}
      
      {/* Building */}
      <div className={`w-16 h-16 rounded border-2 ${
        isSelected ? 'border-yellow-400' : 'border-stone-600'
      } bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center text-2xl shadow-lg`}>
        {getBuildingIcon(building.type)}
      </div>
      
      {/* Health bar */}
      <div className="absolute -bottom-2 left-0 right-0 bg-black bg-opacity-60 rounded-full h-2 border border-gray-400">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
          style={{ width: `${(building.health / 500) * 100}%` }}
        ></div>
      </div>
      
      {/* Production indicator */}
      {building.producing && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded border border-blue-400">
          +{building.producing}
        </div>
      )}
    </motion.div>
  );
};

// Unit Selection Panel
export const UnitSelectionPanel = ({ selectedUnits, selectedBuildings }) => {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-t from-stone-900 to-stone-800 border-t-2 border-stone-600 px-4 py-2 rounded-t-lg">
      <div className="flex items-center space-x-2">
        {selectedUnits.length > 0 && (
          <div className="flex items-center space-x-2">
            {selectedUnits.slice(0, 6).map(unit => (
              <div key={unit.id} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-800 to-amber-900 rounded border-2 border-yellow-400 flex items-center justify-center text-lg">
                  {unit.type === UNIT_TYPES.HERO ? '👑' : 
                   unit.type === UNIT_TYPES.WARRIOR ? '⚔️' :
                   unit.type === UNIT_TYPES.ARCHER ? '🏹' : '🔨'}
                </div>
                <div className="text-xs text-yellow-300 mt-1">{unit.name}</div>
              </div>
            ))}
            {selectedUnits.length > 6 && (
              <div className="text-yellow-300 text-sm">+{selectedUnits.length - 6}</div>
            )}
          </div>
        )}
        
        {selectedBuildings.length > 0 && (
          <div className="flex items-center space-x-2">
            {selectedBuildings.slice(0, 3).map(building => (
              <div key={building.id} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-stone-700 to-stone-800 rounded border-2 border-yellow-400 flex items-center justify-center text-lg">
                  {building.type === BUILDING_TYPES.TOWN_HALL ? '🏰' :
                   building.type === BUILDING_TYPES.BARRACKS ? '⚔️' :
                   building.type === BUILDING_TYPES.FARM ? '🌾' : '🗼'}
                </div>
                <div className="text-xs text-yellow-300 mt-1">{building.name}</div>
              </div>
            ))}
          </div>
        )}
        
        {selectedUnits.length === 0 && selectedBuildings.length === 0 && (
          <div className="text-gray-400 text-sm py-4 px-8">Select units or buildings</div>
        )}
      </div>
    </div>
  );
};

// Command Panel
export const CommandPanel = ({ selectedUnits, selectedBuildings, onCommand }) => {
  const getAvailableCommands = () => {
    if (selectedUnits.length > 0) {
      const unit = selectedUnits[0];
      if (unit.type === UNIT_TYPES.HERO) {
        return [
          { id: 'move', name: 'Move', icon: '➡️' },
          { id: 'attack', name: 'Attack', icon: '⚔️' },
          { id: 'cast', name: 'Cast Spell', icon: '✨' },
          { id: 'hold', name: 'Hold Position', icon: '🛡️' }
        ];
      } else if (unit.type === UNIT_TYPES.WORKER) {
        return [
          { id: 'move', name: 'Move', icon: '➡️' },
          { id: 'gather', name: 'Gather', icon: '⛏️' },
          { id: 'build', name: 'Build', icon: '🔨' },
          { id: 'repair', name: 'Repair', icon: '🔧' }
        ];
      } else {
        return [
          { id: 'move', name: 'Move', icon: '➡️' },
          { id: 'attack', name: 'Attack', icon: '⚔️' },
          { id: 'patrol', name: 'Patrol', icon: '👁️' },
          { id: 'hold', name: 'Hold Position', icon: '🛡️' }
        ];
      }
    } else if (selectedBuildings.length > 0) {
      const building = selectedBuildings[0];
      if (building.type === BUILDING_TYPES.BARRACKS) {
        return [
          { id: 'train_footman', name: 'Train Footman', icon: '⚔️' },
          { id: 'train_archer', name: 'Train Archer', icon: '🏹' },
          { id: 'upgrade_attack', name: 'Upgrade Attack', icon: '⬆️' },
          { id: 'upgrade_armor', name: 'Upgrade Armor', icon: '🛡️' }
        ];
      } else if (building.type === BUILDING_TYPES.TOWN_HALL) {
        return [
          { id: 'train_peasant', name: 'Train Peasant', icon: '🔨' },
          { id: 'research', name: 'Research', icon: '📚' },
          { id: 'upgrade_town', name: 'Upgrade', icon: '⬆️' },
          { id: 'call_militia', name: 'Call to Arms', icon: '📯' }
        ];
      }
    }
    return [];
  };

  const commands = getAvailableCommands();

  return (
    <div className="fixed bottom-0 right-2 z-40 bg-gradient-to-t from-stone-900 to-stone-800 border-t-2 border-l-2 border-stone-600 rounded-tl-lg p-2">
      <div className="grid grid-cols-2 gap-2">
        {commands.map(command => (
          <motion.button
            key={command.id}
            className="w-16 h-16 bg-gradient-to-br from-amber-800 to-amber-900 border-2 border-amber-600 rounded flex flex-col items-center justify-center text-xs text-yellow-100 hover:border-yellow-400 transition-colors"
            onClick={() => onCommand(command.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-lg">{command.icon}</div>
            <div className="mt-1 text-center leading-tight">{command.name}</div>
          </motion.button>
        ))}
        {commands.length === 0 && (
          <div className="col-span-2 text-gray-400 text-sm text-center py-4">
            No commands available
          </div>
        )}
      </div>
    </div>
  );
};

// Game Messages Component
export const GameMessages = ({ messages }) => {
  return (
    <div className="fixed top-16 left-2 z-30 space-y-1 max-w-xs">
      <AnimatePresence>
        {messages.map(message => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`px-3 py-1 rounded text-sm border ${
              message.type === 'error' ? 'bg-red-900 border-red-600 text-red-200' :
              message.type === 'warning' ? 'bg-yellow-900 border-yellow-600 text-yellow-200' :
              'bg-blue-900 border-blue-600 text-blue-200'
            }`}
          >
            {message.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Menu Modal Component
export const MenuModal = ({ isOpen, onClose, onNewGame, onLoadGame, onSettings }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-amber-600 rounded-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-yellow-300 text-center mb-8">Warcraft III Mobile</h2>
        
        <div className="space-y-4">
          <motion.button
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 border-2 border-blue-500 rounded text-yellow-100 font-semibold hover:border-yellow-400 transition-colors"
            onClick={onNewGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🆕 New Game
          </motion.button>
          
          <motion.button
            className="w-full py-3 bg-gradient-to-r from-green-700 to-green-600 border-2 border-green-500 rounded text-yellow-100 font-semibold hover:border-yellow-400 transition-colors"
            onClick={onLoadGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📂 Load Game
          </motion.button>
          
          <motion.button
            className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-600 border-2 border-purple-500 rounded text-yellow-100 font-semibold hover:border-yellow-400 transition-colors"
            onClick={onSettings}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ⚙️ Settings
          </motion.button>
          
          <motion.button
            className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-gray-500 rounded text-yellow-100 font-semibold hover:border-yellow-400 transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ❌ Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Race Selection Component
export const RaceSelection = ({ isOpen, onSelect, onClose }) => {
  const races = [
    { id: RACES.HUMAN, name: 'Human Alliance', icon: '👑', color: 'blue', description: 'Noble warriors with strong magic' },
    { id: RACES.ORC, name: 'Orcish Horde', icon: '🗡️', color: 'red', description: 'Brutal strength and shamanic power' },
    { id: RACES.UNDEAD, name: 'Undead Scourge', icon: '💀', color: 'purple', description: 'Dark necromancy and endless armies' },
    { id: RACES.NIGHT_ELF, name: 'Night Elves', icon: '🌙', color: 'green', description: 'Ancient magic and forest guardians' }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-amber-600 rounded-lg p-8 max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-yellow-300 text-center mb-8">Choose Your Race</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {races.map(race => (
            <motion.button
              key={race.id}
              className={`p-4 bg-gradient-to-br from-${race.color}-800 to-${race.color}-900 border-2 border-${race.color}-600 rounded-lg text-left hover:border-yellow-400 transition-colors`}
              onClick={() => onSelect(race.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-2xl">{race.icon}</div>
                <div className="text-lg font-bold text-yellow-200">{race.name}</div>
              </div>
              <div className="text-sm text-gray-300">{race.description}</div>
            </motion.button>
          ))}
        </div>
        
        <motion.button
          className="w-full mt-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-gray-500 rounded text-yellow-100 font-semibold hover:border-yellow-400 transition-colors"
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Export all mock data
export { mockUnits, mockBuildings, RACES, UNIT_TYPES, BUILDING_TYPES };