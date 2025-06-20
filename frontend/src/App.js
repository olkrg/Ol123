import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import {
  ResourcePanel,
  MiniMap,
  Unit,
  Building,
  UnitSelectionPanel,
  CommandPanel,
  GameMessages,
  MenuModal,
  RaceSelection,
  mockUnits,
  mockBuildings,
  RACES,
  UNIT_TYPES,
  BUILDING_TYPES
} from './components';

function App() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showRaceSelection, setShowRaceSelection] = useState(false);
  
  // Game resources
  const [resources, setResources] = useState({
    gold: 500,
    lumber: 250,
    food: 12,
    maxFood: 50
  });
  
  // Game entities
  const [units, setUnits] = useState(mockUnits);
  const [buildings, setBuildings] = useState(mockBuildings);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState([]);
  
  // Game messages
  const [messages, setMessages] = useState([]);
  const messageIdRef = useRef(0);
  
  // Game area reference
  const gameAreaRef = useRef(null);

  // Add a message to the game
  const addMessage = (text, type = 'info') => {
    const newMessage = {
      id: messageIdRef.current++,
      text,
      type,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Remove message after 3 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 3000);
  };

  // Handle new game
  const handleNewGame = () => {
    setShowMenu(false);
    setShowRaceSelection(true);
  };

  // Handle race selection
  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    setShowRaceSelection(false);
    setGameStarted(true);
    addMessage(`Welcome, ${race} player! Build your army and conquer!`, 'info');
  };

  // Handle unit selection
  const handleUnitSelect = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    // Clear building selection
    setSelectedBuildingIds([]);
    
    // Toggle unit selection
    setSelectedUnitIds(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
    
    addMessage(`Selected ${unit.name}`, 'info');
  };

  // Handle building selection
  const handleBuildingSelect = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    // Clear unit selection
    setSelectedUnitIds([]);
    
    // Toggle building selection
    setSelectedBuildingIds(prev => {
      if (prev.includes(buildingId)) {
        return prev.filter(id => id !== buildingId);
      } else {
        return [buildingId]; // Only allow one building selection
      }
    });
    
    addMessage(`Selected ${building.name}`, 'info');
  };

  // Handle unit movement
  const handleUnitMove = (unitId, x, y) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId ? { ...unit, x, y } : unit
    ));
  };

  // Handle commands
  const handleCommand = (commandId) => {
    const selectedUnits = units.filter(u => selectedUnitIds.includes(u.id));
    const selectedBuildings = buildings.filter(b => selectedBuildingIds.includes(b.id));
    
    switch(commandId) {
      case 'move':
        addMessage('Click where you want to move', 'info');
        break;
      case 'attack':
        addMessage('Click target to attack', 'warning');
        break;
      case 'build':
        addMessage('Select building location', 'info');
        break;
      case 'train_peasant':
        if (resources.gold >= 75) {
          setResources(prev => ({ ...prev, gold: prev.gold - 75, food: prev.food + 1 }));
          addMessage('Training Peasant...', 'info');
        } else {
          addMessage('Not enough gold!', 'error');
        }
        break;
      case 'train_footman':
        if (resources.gold >= 135 && resources.lumber >= 0) {
          setResources(prev => ({ ...prev, gold: prev.gold - 135, food: prev.food + 1 }));
          addMessage('Training Footman...', 'info');
        } else {
          addMessage('Not enough resources!', 'error');
        }
        break;
      case 'cast':
        addMessage('Select spell target', 'info');
        break;
      default:
        addMessage(`Executing ${commandId}...`, 'info');
    }
  };

  // Clear selections when clicking on empty area
  const handleGameAreaClick = (e) => {
    if (e.target === gameAreaRef.current) {
      setSelectedUnitIds([]);
      setSelectedBuildingIds([]);
    }
  };

  // Resource generation effect
  useEffect(() => {
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      setResources(prev => ({
        ...prev,
        gold: Math.min(prev.gold + 5, 9999),
        lumber: Math.min(prev.lumber + 2, 9999)
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [gameStarted]);

  // Get selected entities
  const selectedUnits = units.filter(u => selectedUnitIds.includes(u.id));
  const selectedBuildings = buildings.filter(b => selectedBuildingIds.includes(b.id));

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-900 to-amber-900">
        <div 
          className="min-h-screen bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.pexels.com/photos/32614002/pexels-photo-32614002.jpeg')`
          }}
        >
          <AnimatePresence>
            <MenuModal
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              onNewGame={handleNewGame}
              onLoadGame={() => addMessage('Load game feature coming soon!', 'info')}
              onSettings={() => addMessage('Settings feature coming soon!', 'info')}
            />
            
            <RaceSelection
              isOpen={showRaceSelection}
              onSelect={handleRaceSelect}
              onClose={() => setShowRaceSelection(false)}
            />
          </AnimatePresence>
          
          <GameMessages messages={messages} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-amber-800 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1670073952001-1aafed4bfc02')`
        }}
      />
      
      {/* Game UI */}
      <ResourcePanel resources={resources} />
      <MiniMap units={units} buildings={buildings} />
      <UnitSelectionPanel 
        selectedUnits={selectedUnits} 
        selectedBuildings={selectedBuildings}
      />
      <CommandPanel 
        selectedUnits={selectedUnits}
        selectedBuildings={selectedBuildings}
        onCommand={handleCommand}
      />
      <GameMessages messages={messages} />
      
      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative w-full h-screen pt-16 pb-20 cursor-crosshair"
        onClick={handleGameAreaClick}
        style={{ 
          background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)'
        }}
      >
        {/* Units */}
        {units.map(unit => (
          <Unit
            key={unit.id}
            unit={unit}
            onSelect={handleUnitSelect}
            isSelected={selectedUnitIds.includes(unit.id)}
            onMove={handleUnitMove}
          />
        ))}
        
        {/* Buildings */}
        {buildings.map(building => (
          <Building
            key={building.id}
            building={building}
            onSelect={handleBuildingSelect}
            isSelected={selectedBuildingIds.includes(building.id)}
          />
        ))}
        
        {/* Grid overlay for mobile */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      {/* Menu button */}
      <motion.button
        className="fixed top-4 right-4 z-50 w-12 h-12 bg-gradient-to-br from-amber-800 to-amber-900 border-2 border-amber-600 rounded-full flex items-center justify-center text-xl hover:border-yellow-400 transition-colors"
        onClick={() => setShowMenu(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ☰
      </motion.button>
      
      <AnimatePresence>
        <MenuModal
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onNewGame={() => {
            setGameStarted(false);
            setShowMenu(false);
            setShowRaceSelection(true);
            // Reset game state
            setResources({ gold: 500, lumber: 250, food: 12, maxFood: 50 });
            setUnits(mockUnits);
            setBuildings(mockBuildings);
            setSelectedUnitIds([]);
            setSelectedBuildingIds([]);
          }}
          onLoadGame={() => addMessage('Load game feature coming soon!', 'info')}
          onSettings={() => addMessage('Settings feature coming soon!', 'info')}
        />
      </AnimatePresence>
    </div>
  );
}

export default App;