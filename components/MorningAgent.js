import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Clock, Train, Sun, AlertTriangle, CheckCircle, Play, Pause, SkipForward, SkipBack, Volume2, Headphones, Bell, BellOff, Brain, Calendar, Navigation, Send, MessageSquare, MapPin, Route, Info } from 'lucide-react';

const MorningAgent = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState(null);
  const [morningPhase, setMorningPhase] = useState('sleeping');
  const [selectedBackground, setSelectedBackground] = useState('gradient-dark');
  const [useMilitaryTime, setUseMilitaryTime] = useState(true);
  const [prepItems, setPrepItems] = useState([
    { id: 1, text: 'Clothes Ready', completed: false, timesSaved: 10 },
    { id: 2, text: 'Lunch Ready', completed: false, timesSaved: 12 },
    { id: 3, text: 'Phone Charged', completed: false, timesSaved: 2 },
    { id: 4, text: 'Keys & Wallet Located', completed: false, timesSaved: 3 }
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [realWeatherData, setRealWeatherData] = useState(null);
  const [realTrainData, setRealTrainData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [mediaState, setMediaState] = useState({
    isPlaying: false,
    currentTrack: 'No media selected',
    currentApp: 'None',
    volume: 50
  });
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [daySchedule, setDaySchedule] = useState([
    { id: 1, time: '03:00', task: 'Wake up call', status: 'pending', priority: 'high' },
    { id: 2, time: '03:05', task: 'Weather & train check', status: 'pending', priority: 'high' },
    { id: 3, time: '03:15', task: 'Bathroom routine reminder', status: 'pending', priority: 'medium' },
    { id: 4, time: '03:35', task: 'Getting dressed checkpoint', status: 'pending', priority: 'high' },
    { id: 5, time: '03:50', task: 'Final departure warning', status: 'pending', priority: 'critical' },
    { id: 6, time: '04:10', task: 'Leave house NOW', status: 'pending', priority: 'critical' },
    { id: 7, time: '05:00', task: 'Arrival confirmation', status: 'pending', priority: 'medium' },
    { id: 8, time: '17:00', task: 'Evening prep reminder', status: 'pending', priority: 'low' }
  ]);
  const [notifications, setNotifications] = useState([]);
  const [proactiveUpdates, setProactiveUpdates] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [septaRouteQuery, setSeptaRouteQuery] = useState({
    from: '',
    to: '',
    time: '',
    date: ''
  });
  const [septaRoutes, setSeptaRoutes] = useState([]);
  const [septaSystemStatus, setSeptaSystemStatus] = useState(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [nearestStation, setNearestStation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Background options
  const backgrounds = {
    'gradient-dark': 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
    'gradient-sunrise': 'bg-gradient-to-br from-orange-900 via-red-900 to-pink-900',
    'gradient-forest': 'bg-gradient-to-br from-green-900 via-teal-900 to-blue-900',
    'gradient-ocean': 'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900',
    'solid-dark': 'bg-gray-900',
    'gradient-warm': 'bg-gradient-to-br from-amber-900 via-orange-900 to-red-900',
    'gradient-cool': 'bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900'
  };

  const backgroundNames = {
    'gradient-dark': 'Dark Blue',
    'gradient-sunrise': 'Sunrise',
    'gradient-forest': 'Forest',
    'gradient-ocean': 'Ocean',
    'solid-dark': 'Simple Dark',
    'gradient-warm': 'Warm',
    'gradient-cool': 'Cool'
  };

  // Mock data fallbacks
  const mockWeather = {
    temp: 32,
    condition: 'cloudy',
    recommendation: 'Light jacket recommended'
  };

  const mockTrainStatus = {
    onTime: true,
    delay: 0,
    nextTrain: '4:55 AM'
  };

  // Use real data if available, otherwise fall back to mock data
  const currentWeather = realWeatherData || mockWeather;
  const currentTrainStatus = realTrainData || mockTrainStatus;

  // SEPTA Stations Database with GPS coordinates
  const septaStations = [
    { name: 'Temple University', lat: 39.9815, lng: -75.1505 },
    { name: '30th Street Station', lat: 39.9566, lng: -75.1815 },
    { name: 'Suburban Station', lat: 39.9544, lng: -75.1681 },
    { name: 'Jefferson Station', lat: 39.9526, lng: -75.1580 },
    { name: 'Jenkintown-Wyncote', lat: 40.0951, lng: -75.1279 },
    { name: 'Glenside', lat: 40.1034, lng: -75.1540 },
    { name: 'Wayne Junction', lat: 40.0439, lng: -75.1378 },
    { name: 'North Philadelphia', lat: 39.9967, lng: -75.1548 },
    { name: 'Fern Rock Transportation Center', lat: 40.0419, lng: -75.1296 },
    { name: 'Melrose Park', lat: 40.0626, lng: -75.1215 },
    { name: 'Elkins Park', lat: 40.0715, lng: -75.1296 },
    { name: 'Cheltenham', lat: 40.0598, lng: -75.1432 },
    { name: 'Wayne', lat: 40.0443, lng: -75.3871 },
    { name: 'Ardmore', lat: 40.0065, lng: -75.2893 },
    { name: 'Villanova', lat: 40.0387, lng: -75.3421 },
    { name: 'Radnor', lat: 40.0465, lng: -75.3615 },
    { name: 'Paoli', lat: 40.0426, lng: -75.4854 },
    { name: 'Lansdale', lat: 40.2415, lng: -75.2835 },
    { name: 'Doylestown', lat: 40.3101, lng: -75.1296 },
    { name: 'Warminster', lat: 40.2015, lng: -75.0879 },
    { name: 'West Trenton', lat: 40.2676, lng: -74.8343 },
    { name: 'Airport Terminal A', lat: 39.8719, lng: -75.2411 },
    { name: 'Airport Terminal B', lat: 39.8742, lng: -75.2458 }
  ];

  // Location Services
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      speak("Location services not available on this device, Resident.");
      setIsGettingLocation(false);
      return null;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };

      setCurrentLocation(location);
      setLocationPermission('granted');
      
      // Find nearest SEPTA station
      const nearest = findNearestStation(location.lat, location.lng);
      setNearestStation(nearest);
      
      speak(`Location acquired. Nearest station: ${nearest.name}, approximately ${nearest.distance} meters away.`);
      
      return location;
      
    } catch (error) {
      console.error('Location error:', error);
      setLocationPermission('denied');
      
      if (error.code === 1) {
        speak("Location access denied. Manual station selection required, Resident.");
      } else if (error.code === 2) {
        speak("Location unavailable. GPS signal insufficient.");
      } else {
        speak("Location services timeout. Manual navigation recommended.");
      }
      
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearest SEPTA station
  const findNearestStation = (lat, lng) => {
    let nearest = null;
    let minDistance = Infinity;

    septaStations.forEach(station => {
      const distance = calculateDistance(lat, lng, station.lat, station.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...station, distance: Math.round(distance) };
      }
    });

    return nearest;
  };

  // Google Maps integration
  const openGoogleMapsDirections = (destination, mode = 'walking') => {
    if (!destination) return;
    
    let url = 'https://www.google.com/maps/dir/';
    
    if (currentLocation) {
      url += `${currentLocation.lat},${currentLocation.lng}/`;
    }
    
    // Find destination coordinates
    const destStation = septaStations.find(s => s.name === destination);
    if (destStation) {
      url += `${destStation.lat},${destStation.lng}`;
    } else {
      url += encodeURIComponent(destination);
    }
    
    url += `/@${currentLocation?.lat || 39.9526},${currentLocation?.lng || -75.1652},15z`;
    url += `/data=!3m1!4b1!4m2!4m1!3e${mode === 'walking' ? '2' : '3'}`;
    
    window.open(url, '_blank');
    speak(`Opening navigation to ${destination}. Transit optimization in progress.`);
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Autonomous operations every minute
      if (autonomousMode && currentTime.getSeconds() === 0) {
        autonomousManager();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [autonomousMode, currentTime]);

  // SAYER-style responses
  const sayerResponses = {
    greeting: "Good morning, Resident. MORNING CONTROL PROTOCOL has been activated. Your compliance with the scheduled departure time is... anticipated.",
    
    status: (timeLeft, status) => {
      if (status === 'good') {
        return `Resident, you have ${timeLeft} minutes remaining until departure. Your adherence to the schedule is... satisfactory. Continue current protocols.`;
      } else if (status === 'rushed') {
        return `Resident, you have ${timeLeft} minutes remaining. Time allocation is... suboptimal. Efficiency improvements are required. Do not disappoint the schedule.`;
      } else {
        return `Resident. Time allocation has reached CRITICAL levels. ${timeLeft} minutes remain. Emergency protocols suggest Wayne Junction station. Your tardiness has been... noted.`;
      }
    },
    
    weather: (temp, condition, recommendation) => 
      `Current atmospheric conditions: ${temp} degrees Fahrenheit, ${condition}. For optimal thermal regulation, MORNING CONTROL recommends: ${recommendation}. Your comfort is... a priority.`,
    
    train: (onTime, delay) => 
      onTime 
        ? "Your scheduled transport remains on temporal target. Arrival at Jenkintown-Wyncote station proceeds as... expected."
        : `Your scheduled transport experiences a ${delay} minute temporal displacement. Adjustments to your routine are... advisable.`,
    
    prepComplete: (item) => 
      `Preparation item "${item}" has been marked complete. Your efficiency pleases the algorithm. Continue optimizing your existence, Resident.`,
    
    prepIncomplete: (item) => 
      `Preparation item "${item}" remains incomplete. Your evening protocols require... improvement. The schedule does not forgive negligence.`,
    
    dataRefresh: "Acquiring real-time atmospheric and transport data. Please wait while MORNING CONTROL interfaces with external systems. Your patience is... compulsory.",
    
    timeFormat: (isMilitary) => 
      `Time display format adjusted to ${isMilitary ? 'military standard' : 'civilian format'}. MORNING CONTROL adapts to your... preferences.`,
    
    background: (theme) => 
      `Visual environment adjusted to ${theme} parameters. Your aesthetic requirements have been... acknowledged.`,
    
    error: "I did not process that command, Resident. Please speak clearly. MORNING CONTROL requires... precision.",
    
    departure: "Departure time approaches, Resident. Gather your required items. The transport schedule is... unforgiving.",
    
    emergency: "EMERGENCY PROTOCOL ACTIVATED. Resident, your current trajectory will result in schedule deviation. Alternative routes are being calculated. Do not panic. Panic is... inefficient."
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7; // Slower, more deliberate
      utterance.pitch = 0.8; // Slightly lower pitch
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command) => {
    if (command.includes('status') || command.includes('time')) {
      const scenario = calculateMorningScenario();
      if (scenario) {
        speak(sayerResponses.status(scenario.timeLeft, scenario.status));
      }
    } else if (command.includes('weather')) {
      if (realWeatherData) {
        speak(sayerResponses.weather(realWeatherData.temp, realWeatherData.condition, realWeatherData.recommendation));
      } else {
        speak(sayerResponses.weather(currentWeather.temp, currentWeather.condition, currentWeather.recommendation));
      }
    } else if (command.includes('where am i') || command.includes('current location')) {
      speak("Acquiring GPS coordinates. Stand by for positional analysis.");
      getCurrentLocation();
    } else if (command.includes('nearest station')) {
      if (nearestStation) {
        speak(`Nearest station: ${nearestStation.name}, ${nearestStation.distance} meters from your position.`);
      } else {
        speak("Position data required. Initiating location acquisition.");
        getCurrentLocation();
      }
    } else if (command.includes('route to') || command.includes('get to')) {
      const words = command.split(' ');
      const toIndex = words.findIndex(word => word === 'to');
      if (toIndex !== -1 && words[toIndex + 1]) {
        const destination = words.slice(toIndex + 1).join(' ');
        speak(`Calculating optimal route to ${destination} from current position. Processing transportation matrix.`);
      } else {
        speak("Destination parameters required. Specify target location, Resident.");
      }
    } else if (command.includes('navigate to')) {
      const words = command.split(' ');
      const toIndex = words.findIndex(word => word === 'to');
      if (toIndex !== -1 && words[toIndex + 1]) {
        const destination = words.slice(toIndex + 1).join(' ');
        speak(`Opening navigation to ${destination}. Route optimization engaged.`);
        openGoogleMapsDirections(destination);
      }
    } else {
      speak(sayerResponses.error);
    }
  };

  const calculateMorningScenario = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    const idealWakeUp = 3 * 60;
    const latestWakeUp = 3 * 60 + 15;
    const leaveTime = 4 * 60 + 10;
    const trainTime = 4 * 60 + 25;
    
    const bathroomTime = 20;
    const clothingTime = prepItems.find(item => item.text === 'Clothes Ready')?.completed ? 2 : 12;
    const lunchTime = prepItems.find(item => item.text === 'Lunch Ready')?.completed ? 2 : 12;
    const travelTime = 7;
    
    const totalRoutineTime = bathroomTime + clothingTime + lunchTime + travelTime;
    
    if (currentMinutes >= idealWakeUp && currentMinutes < trainTime) {
      const availableTime = leaveTime - currentMinutes;
      const scenario = {
        timeLeft: availableTime,
        canCatchTrain: availableTime >= (totalRoutineTime - travelTime),
        status: availableTime >= (totalRoutineTime - travelTime) ? 'good' : 
                availableTime >= (totalRoutineTime - travelTime - 10) ? 'rushed' : 'emergency',
        routineTime: totalRoutineTime - travelTime,
        leaveBy: useMilitaryTime ? 
          `${Math.floor(leaveTime / 60).toString().padStart(2, '0')}:${String(leaveTime % 60).padStart(2, '0')}` :
          `${Math.floor(leaveTime / 60)}:${String(leaveTime % 60).padStart(2, '0')}`,
        trainTime: useMilitaryTime ?
          `${Math.floor(trainTime / 60).toString().padStart(2, '0')}:${String(trainTime % 60).padStart(2, '0')}` :
          `${Math.floor(trainTime / 60)}:${String(trainTime % 60).padStart(2, '0')}`
      };
      return scenario;
    }
    
    return null;
  };

  const scenario = calculateMorningScenario();

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setLastCommand(command);
        handleVoiceCommand(command);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
      };

      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return 'text-green-600';
      case 'rushed': return 'text-yellow-600';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (date) => {
    if (useMilitaryTime) {
      return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatStaticTime = (timeString) => {
    if (useMilitaryTime) {
      const time = timeString.replace(' AM', '').replace(' PM', '');
      const [hour, minute] = time.split(':');
      let militaryHour = parseInt(hour);
      
      if (timeString.includes('PM') && militaryHour !== 12) {
        militaryHour += 12;
      } else if (timeString.includes('AM') && militaryHour === 12) {
        militaryHour = 0;
      }
      
      return `${militaryHour.toString().padStart(2, '0')}:${minute}`;
    }
    return timeString;
  };

  const autonomousManager = () => {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    daySchedule.forEach(task => {
      if (task.time === currentTimeStr && task.status === 'pending') {
        executeScheduledTask(task);
      }
    });
    
    if (proactiveUpdates) {
      proactiveMonitoring();
    }
  };

  const executeScheduledTask = (task) => {
    setDaySchedule(prev => 
      prev.map(t => t.id === task.id ? { ...t, status: 'active' } : t)
    );
    
    const taskResponses = {
      'Wake up call': () => {
        speak("Good morning, Resident. MORNING CONTROL PROTOCOL is now active. Your schedule adherence begins... now.");
        addNotification('Morning protocol activated', 'high');
      },
      'Weather & train check': () => {
        speak("Initiating atmospheric and transport status verification. Stand by for optimization parameters.");
      },
      'Bathroom routine reminder': () => {
        speak("Resident, hygiene protocol should commence. Time allocation: 20 minutes. Efficiency is... expected.");
        addNotification('Bathroom routine - 20 min allocated', 'medium');
      },
      'Getting dressed checkpoint': () => {
        const clothesReady = prepItems.find(item => item.text === 'Clothes Ready')?.completed;
        if (clothesReady) {
          speak("Clothing preparation verified as complete. Proceed with dressing protocol. Estimated time: 2 minutes.");
        } else {
          speak("WARNING: Clothing preparation incomplete. Emergency selection protocol required. Time penalty: 10 minutes.");
          addNotification('Clothes not prepped - 10 min penalty!', 'high');
        }
      },
      'Final departure warning': () => {
        speak("FINAL DEPARTURE WARNING. Resident must leave premises in 20 minutes. Gather required items. Delay is... inadvisable.");
        addNotification('20 minutes to departure', 'critical');
      },
      'Leave house NOW': () => {
        speak("DEPARTURE TIME REACHED. Exit premises immediately. Transport synchronization is... critical.");
        addNotification('LEAVE NOW', 'critical');
      },
      'Arrival confirmation': () => {
        speak("Expected arrival time reached. Confirm work location entry. Schedule compliance verification required.");
        addNotification('Confirm arrival at work', 'medium');
      },
      'Evening prep reminder': () => {
        speak("Evening preparation protocol recommended. Tomorrow's efficiency depends on tonight's... foresight.");
        addNotification('Prep for tomorrow', 'low');
      }
    };
    
    const taskFunction = taskResponses[task.task];
    if (taskFunction) {
      taskFunction();
    }
    
    setTimeout(() => {
      setDaySchedule(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t)
      );
    }, 60000);
  };

  const proactiveMonitoring = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (hours === 3 && minutes >= 45) {
      const scenario = calculateMorningScenario();
      if (scenario && scenario.status === 'emergency') {
        addNotification('EMERGENCY: Consider Wayne Junction!', 'critical');
        speak("EMERGENCY PROTOCOL: Current trajectory indicates schedule failure. Wayne Junction alternative route recommended.");
      }
    }
  };

  const addNotification = (message, priority) => {
    const notification = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const handleTextCommand = (command) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: command,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatHistory(prev => [userMessage, ...prev]);
    
    handleVoiceCommand(command.toLowerCase());
    
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: getTextResponse(command.toLowerCase()),
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [aiResponse, ...prev]);
    }, 500);
    
    setTextInput('');
  };

  const getTextResponse = (command) => {
    if (command.includes('status') || command.includes('time')) {
      if (scenario) {
        return sayerResponses.status(scenario.timeLeft, scenario.status);
      }
      return "Status monitoring requires active morning protocol, Resident.";
    } else if (command.includes('weather')) {
      if (realWeatherData) {
        return sayerResponses.weather(realWeatherData.temp, realWeatherData.condition, realWeatherData.recommendation);
      } else {
        return sayerResponses.weather(currentWeather.temp, currentWeather.condition, currentWeather.recommendation);
      }
    } else if (command.includes('where am i') || command.includes('location')) {
      if (currentLocation && nearestStation) {
        return `Location acquired. Current position: ${nearestStation.name}, ${nearestStation.distance} meters away. GPS accuracy: ±${Math.round(currentLocation.accuracy)}m.`;
      } else {
        return "Position data unavailable. Location acquisition required, Resident.";
      }
    } else {
      return sayerResponses.error;
    }
  };

  return (
    <div className={`min-h-screen text-white p-4 transition-all duration-1000 ${backgrounds[selectedBackground]}`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">MORNING CONTROL PROTOCOL</h1>
          <div className="text-3xl font-mono">{formatTime(currentTime)}</div>
          <div className="text-xs text-gray-400 mt-1">
            SYSTEM STATUS: {autonomousMode ? 'AUTONOMOUS' : 'MANUAL'} | 
            GPS: {currentLocation ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>

        {/* Location Intelligence */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Intelligence
            </h3>
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-2 py-1 rounded transition-colors"
            >
              {isGettingLocation ? 'ACQUIRING...' : 'GET LOCATION'}
            </button>
          </div>
          
          <div className="space-y-2">
            {currentLocation ? (
              <div className="p-2 bg-green-900 bg-opacity-30 rounded text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">📍 Location Active</div>
                    <div className="text-xs text-gray-300">
                      Accuracy: ±{Math.round(currentLocation.accuracy)}m
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {currentLocation.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-gray-900 bg-opacity-30 rounded text-sm">
                <div className="text-gray-400">Location services inactive</div>
                <div className="text-xs text-gray-500">
                  Enable for enhanced route planning
                </div>
              </div>
            )}
            
            {nearestStation && (
              <div className="p-2 bg-blue-900 bg-opacity-30 rounded text-sm">
                <div className="font-bold">🚂 Nearest Station</div>
                <div className="flex items-center justify-between">
                  <div>{nearestStation.name}</div>
                  <div className="text-xs">
                    {nearestStation.distance}m away
                    <button
                      onClick={() => openGoogleMapsDirections(nearestStation.name)}
                      className="ml-2 text-blue-400 hover:text-blue-300"
                    >
                      Navigate →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voice Interface */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">Voice Interface Protocol</h3>
          <button
            onClick={startListening}
            className={`w-full p-4 rounded-lg font-medium transition-colors ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isListening ? (
              <div className="flex items-center justify-center">
                <MicOff className="w-5 h-5 mr-2" />
                LISTENING...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Mic className="w-5 h-5 mr-2" />
                ACTIVATE VOICE INTERFACE
              </div>
            )}
          </button>
          
          {lastCommand && (
            <div className="mt-3 p-2 bg-black bg-opacity-40 rounded text-sm">
              Last command: "{lastCommand}"
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-300">
            Available commands: "Where am I", "Route to [destination]", "Navigate to [location]", "Nearest station", "Status report", "Weather"
          </div>
        </div>

        {/* Text Interface */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Text Interface Protocol
          </h3>
          
          {chatHistory.length > 0 && (
            <div className="mb-3 h-32 overflow-y-auto space-y-2">
              {chatHistory.slice(0, 6).reverse().map((message) => (
                <div key={message.id} className={`p-2 rounded text-sm ${
                  message.type === 'user' 
                    ? 'bg-blue-900 bg-opacity-50 ml-4' 
                    : 'bg-gray-900 bg-opacity-50 mr-4'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-400">
                      {message.type === 'user' ? 'RESIDENT' : 'MORNING CONTROL'}
                    </span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <div className="mt-1">{message.text}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && textInput.trim() && handleTextCommand(textInput)}
              placeholder="Enter command..."
              className="flex-1 p-3 rounded bg-white bg-opacity-20 text-white placeholder-gray-400 text-sm"
            />
            <button
              onClick={() => textInput.trim() && handleTextCommand(textInput)}
              disabled={!textInput.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-300">
            Type commands like: "where am i", "weather", "status report"
          </div>
        </div>

        {/* Settings */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">Settings</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Time Format</span>
              <button
                onClick={() => setUseMilitaryTime(!useMilitaryTime)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  useMilitaryTime 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white bg-opacity-20 text-gray-300'
                }`}
              >
                {useMilitaryTime ? '24hr' : '12hr'}
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Background Theme</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(backgroundNames).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setSelectedBackground(key)}
                  className={`p-2 rounded text-sm transition-all ${
                    selectedBackground === key 
                      ? 'bg-white bg-opacity-30 border border-white border-opacity-50' 
                      : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorningAgent;
