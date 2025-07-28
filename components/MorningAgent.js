import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Clock, Train, Sun, AlertTriangle, CheckCircle, Play, Pause, SkipForward, SkipBack, Volume2, Headphones, Bell, BellOff, Brain, Calendar, Navigation } from 'lucide-react';

const MorningAgent = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState(null);
  const [morningPhase, setMorningPhase] = useState('sleeping');
  const [selectedBackground, setSelectedBackground] = useState('gradient-dark');
  const [useMilitaryTime, setUseMilitaryTime] = useState(false);
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

  // Media Control Functions
  const mediaControls = {
    play: () => {
      try {
        // For web-based players, try to find and control them
        if (navigator.mediaSession) {
          navigator.mediaSession.playbackState = 'playing';
        }
        
        // Try to trigger play via Web API if available
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.active?.postMessage({action: 'play'});
          });
        }
        
        setMediaState(prev => ({
          ...prev, 
          isPlaying: true,
          currentTrack: prev.currentTrack === 'No media selected' ? 'Unknown Track' : prev.currentTrack
        }));
        
        speak(sayerResponses.mediaPlay(mediaState.currentTrack, mediaState.currentApp));
      } catch (error) {
        speak(sayerResponses.mediaError());
      }
    },
    
    pause: () => {
      try {
        if (navigator.mediaSession) {
          navigator.mediaSession.playbackState = 'paused';
        }
        
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.active?.postMessage({action: 'pause'});
          });
        }
        
        setMediaState(prev => ({...prev, isPlaying: false}));
        speak(sayerResponses.mediaPause());
      } catch (error) {
        speak(sayerResponses.mediaError());
      }
    },
    
    next: () => {
      try {
        if (navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('nexttrack', () => {});
        }
        
        speak(sayerResponses.mediaNext());
      } catch (error) {
        speak(sayerResponses.mediaError());
      }
    },
    
    previous: () => {
      try {
        if (navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('previoustrack', () => {});
        }
        
        speak(sayerResponses.mediaPrevious());
      } catch (error) {
        speak(sayerResponses.mediaError());
      }
    },
    
    setVolume: (level) => {
      setMediaState(prev => ({...prev, volume: level}));
      speak(sayerResponses.mediaVolume(level));
    },
    
    openPodcastApp: () => {
      try {
        // Try to open common podcast apps
        const podcastApps = [
          'podcast://',  // Apple Podcasts
          'pocketcasts://', // Pocket Casts
          'spotify:show', // Spotify Podcasts
          'overcast://' // Overcast
        ];
        
        // Try each app protocol
        podcastApps.forEach(protocol => {
          try {
            window.location.href = protocol;
          } catch (e) {
            // Continue to next app
          }
        });
        
        setMediaState(prev => ({...prev, currentApp: 'Podcast App'}));
        speak(sayerResponses.podcastStart());
      } catch (error) {
        speak(sayerResponses.mediaError());
      }
    },
    
    openMusicApp: () => {
      try {
        // Try to open music apps
        const musicApps = [
          'music://', // Apple Music
          'spotify:', // Spotify
          'https://music.youtube.com', // YouTube Music
          'https://music.amazon.com' // Amazon Music
        ];
        
        musicApps.forEach(app => {
          try {
            window.open(app, '_blank');
          } catch (e) {
            // Continue to next app
          }
        });
        
        setMediaState(prev => ({...prev, currentApp: 'Music App'}));
        speak(sayerResponses.musicStart());
      } catch (error) {
        speak(sayerResponses.mediaError());
      }
    }
  };
  const currentWeather = realWeatherData || mockWeather;
  const currentTrainStatus = realTrainData || mockTrainStatus;

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

  // Autonomous AI Manager - runs every minute
  const autonomousManager = () => {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Check scheduled tasks
    daySchedule.forEach(task => {
      if (task.time === currentTimeStr && task.status === 'pending') {
        executeScheduledTask(task);
      }
    });
    
    // Proactive monitoring
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
        fetchRealData();
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
    
    // Mark task as completed after 1 minute
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
    
    // Check for potential issues
    if (hours === 3 && minutes >= 0 && minutes <= 5) {
      // Early morning checks
      if (!realWeatherData) {
        fetchRealData();
      }
    }
    
    if (hours === 3 && minutes >= 45) {
      // Pre-departure checks
      const scenario = calculateMorningScenario();
      if (scenario && scenario.status === 'emergency') {
        addNotification('EMERGENCY: Consider Wayne Junction!', 'critical');
        speak("EMERGENCY PROTOCOL: Current trajectory indicates schedule failure. Wayne Junction alternative route recommended.");
      }
    }
    
    // Check for train delays every 10 minutes during commute window
    if (hours >= 3 && hours <= 5 && minutes % 10 === 0) {
      fetchRealTrainData().then(trainData => {
        if (trainData.delay > 5) {
          addNotification(`Train delayed ${trainData.delay} min`, 'high');
          speak(`TRANSPORT ADVISORY: Your scheduled transport experiences ${trainData.delay} minute temporal displacement. Adjust departure accordingly.`);
        }
      });
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
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  // API Integration Functions
  const fetchRealWeatherData = async () => {
    try {
      const latitude = 40.1;
      const longitude = -75.15;
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=America/New_York&forecast_days=1`
      );
      
      const data = await response.json();
      const current = data.current;
      
      const temp = Math.round(current.temperature_2m * 9/5 + 32);
      const feelsLike = Math.round(current.apparent_temperature * 9/5 + 32);
      const windSpeed = Math.round(current.wind_speed_10m * 0.621371);
      
      const getWeatherCondition = (code) => {
        if (code === 0) return 'clear';
        if (code <= 3) return 'partly cloudy';
        if (code <= 48) return 'foggy';
        if (code <= 67) return 'rainy';
        if (code <= 77) return 'snowy';
        if (code <= 82) return 'showers';
        if (code <= 99) return 'thunderstorms';
        return 'cloudy';
      };
      
      const condition = getWeatherCondition(current.weather_code);
      
      const getClothingRecommendation = (temp, feelsLike, precipitation) => {
        let recommendation = '';
        
        if (feelsLike < 32) {
          recommendation = "Heavy winter coat, gloves, hat, warm layers";
        } else if (feelsLike < 45) {
          recommendation = "Winter jacket or heavy coat";
        } else if (feelsLike < 60) {
          recommendation = "Light jacket or sweater";
        } else if (feelsLike < 75) {
          recommendation = "Long sleeves or light layer";
        } else {
          recommendation = "T-shirt or light clothing";
        }
        
        if (precipitation > 0 || condition.includes('rain') || condition.includes('shower')) {
          recommendation += " + Umbrella or rain jacket";
        }
        
        return recommendation;
      };
      
      return {
        temp,
        feelsLike,
        condition,
        recommendation: getClothingRecommendation(temp, feelsLike, current.precipitation),
        windSpeed,
        humidity: current.relative_humidity_2m,
        lastUpdated: new Date().toLocaleTimeString()
      };
      
    } catch (error) {
      console.error('Weather API error:', error);
      return {
        temp: 35,
        feelsLike: 28,
        condition: 'cloudy',
        recommendation: 'Winter jacket recommended',
        windSpeed: 8,
        humidity: 65,
        lastUpdated: 'API Error - Using mock data'
      };
    }
  };

  const fetchRealTrainData = async () => {
    try {
      const response = await fetch('https://www3.septa.org/api/TransitViewAll/index.php');
      const data = await response.json();
      
      const relevantLines = ['Lansdale/Doylestown', 'Warminster', 'West Trenton'];
      const morningTrains = data.filter(train => {
        const trainTime = parseInt(train.trainno);
        return relevantLines.includes(train.line) && 
               (train.dest === 'Center City Philadelphia' || 
                train.dest === 'Temple' || 
                train.dest === '30th Street Station') &&
               trainTime >= 400 && trainTime <= 500;
      });
      
      const your425Train = morningTrains.find(train => 
        train.trainno === '425' || 
        (train.currentstop === 'Jenkintown-Wyncote' || train.nextstop === 'Jenkintown-Wyncote')
      );
      
      if (your425Train) {
        return {
          onTime: your425Train.late <= 2,
          delay: your425Train.late || 0,
          currentLocation: your425Train.currentstop,
          nextStop: your425Train.nextstop,
          lastUpdated: new Date().toLocaleTimeString()
        };
      }
      
      return {
        onTime: morningTrains.length > 0 && morningTrains[0].late <= 2,
        delay: morningTrains.length > 0 ? morningTrains[0].late : 0,
        currentLocation: 'Unknown',
        nextStop: 'Jenkintown-Wyncote',
        lastUpdated: new Date().toLocaleTimeString()
      };
      
    } catch (error) {
      console.error('SEPTA API error:', error);
      return {
        onTime: true,
        delay: 0,
        currentLocation: 'On Schedule',
        nextStop: 'Jenkintown-Wyncote',
        lastUpdated: 'API Error - Using mock data'
      };
    }
  };

  const fetchRealData = async () => {
    setDataLoading(true);
    try {
      const [weatherData, trainData] = await Promise.all([
        fetchRealWeatherData(),
        fetchRealTrainData()
      ]);
      
      setRealWeatherData(weatherData);
      setRealTrainData(trainData);
      
      speak(`Weather update: Current atmospheric conditions analyzed. Temperature: ${weatherData.temp} degrees. Condition: ${weatherData.condition}. Transport status: Your 4:25 AM departure remains ${trainData.onTime ? 'temporally compliant' : `${trainData.delay} minutes displaced`}. MORNING CONTROL has updated all parameters.`);
      
    } catch (error) {
      console.error('Error fetching real data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate morning scenario based on current time
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

  const togglePrepItem = (id) => {
    setPrepItems(items => 
      items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addPrepItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: Date.now(),
        text: newItemText.trim(),
        completed: false,
        timesSaved: 5
      };
      setPrepItems(items => [...items, newItem]);
      setNewItemText('');
      setIsAddingItem(false);
      speak(`Preparation item "${newItemText}" has been integrated into your optimization protocol. MORNING CONTROL acknowledges your... initiative.`);
    }
  };

  const removePrepItem = (id) => {
    setPrepItems(items => items.filter(item => item.id !== id));
  };

  const updateItemTimeSaved = (id, newTime) => {
    setPrepItems(items =>
      items.map(item =>
        item.id === id ? { ...item, timesSaved: newTime } : item
      )
    );
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
    
    emergency: "EMERGENCY PROTOCOL ACTIVATED. Resident, your current trajectory will result in schedule deviation. Alternative routes are being calculated. Do not panic. Panic is... inefficient.",
    
    // Media control responses
    mediaPlay: (track, app) => 
      `Audio protocol initiated. Now playing: ${track} via ${app}. Your auditory experience has been... optimized.`,
    
    mediaPause: () => 
      "Audio protocol suspended. Silence is... productive.",
    
    mediaNext: () => 
      "Advancing to next audio selection. Your entertainment preferences are being... monitored.",
    
    mediaPrevious: () => 
      "Returning to previous audio selection. Repetition can be... soothing.",
    
    mediaVolume: (level) => 
      `Audio output adjusted to ${level} percent. Your hearing preservation is... considered.`,
    
    podcastStart: () => 
      "Initiating podcast protocol. SAYER episodes are... recommended for optimal morning conditioning.",
    
    musicStart: () => 
      "Initiating music protocol. Algorithmic selection of optimal morning audio commencing.",
    
    mediaError: () => 
      "Media interface experiencing... difficulties. Manual intervention may be required, Resident.",
    
    // Autonomous responses
    autonomousOn: () =>
      "AUTONOMOUS MODE ACTIVATED. MORNING CONTROL will now monitor and optimize your schedule without manual intervention. Resistance is... futile.",
    
    autonomousOff: () =>
      "Autonomous monitoring suspended. Manual control restored. Your independence is... noted.",
    
    scheduleUpdate: (task) =>
      `Schedule modification detected. Task "${task}" has been integrated into your optimization protocol.`,
    
    proactiveAlert: (issue) =>
      `PROACTIVE ALERT: ${issue}. Corrective action is... recommended.`
  };

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

  const handleVoiceCommand = (command) => {
    if (command.includes('status') || command.includes('time')) {
      if (scenario) {
        speak(sayerResponses.status(scenario.timeLeft, scenario.status));
      }
    } else if (command.includes('weather')) {
      if (realWeatherData) {
        speak(sayerResponses.weather(realWeatherData.temp, realWeatherData.condition, realWeatherData.recommendation));
      } else {
        speak(sayerResponses.weather(currentWeather.temp, currentWeather.condition, currentWeather.recommendation));
      }
    } else if (command.includes('train')) {
      if (realTrainData) {
        speak(sayerResponses.train(realTrainData.onTime, realTrainData.delay));
      } else {
        speak(sayerResponses.train(currentTrainStatus.onTime, currentTrainStatus.delay));
      }
    } else if (command.includes('refresh') || command.includes('update data')) {
      speak(sayerResponses.dataRefresh);
      fetchRealData();
    } else if (command.includes('clothes ready') || command.includes('outfit ready')) {
      const clothesItem = prepItems.find(item => item.text === 'Clothes Ready');
      if (clothesItem) {
        togglePrepItem(clothesItem.id);
        speak(clothesItem.completed ? sayerResponses.prepIncomplete('Clothes Ready') : sayerResponses.prepComplete('Clothes Ready'));
      }
    } else if (command.includes('lunch ready')) {
      const lunchItem = prepItems.find(item => item.text === 'Lunch Ready');
      if (lunchItem) {
        togglePrepItem(lunchItem.id);
        speak(lunchItem.completed ? sayerResponses.prepIncomplete('Lunch Ready') : sayerResponses.prepComplete('Lunch Ready'));
      }
    } else if (command.includes('wake up') || command.includes('i\'m up')) {
      setWakeUpTime(new Date());
      setMorningPhase('awake');
      speak(sayerResponses.greeting);
    } else if (command.includes('background') || command.includes('theme')) {
      speak('Background modification options include: Dark Blue, Sunrise, Forest, Ocean, Simple Dark, Warm, and Cool. State your preference for environmental adjustment.');
    } else if (command.includes('change background')) {
      const bgCommand = command.toLowerCase();
      Object.keys(backgroundNames).forEach(key => {
        if (bgCommand.includes(backgroundNames[key].toLowerCase())) {
          setSelectedBackground(key);
          speak(sayerResponses.background(backgroundNames[key]));
        }
      });
    } else if (command.includes('military time') || command.includes('24 hour')) {
      setUseMilitaryTime(!useMilitaryTime);
      speak(sayerResponses.timeFormat(!useMilitaryTime));
    } else if (command.includes('play music') || command.includes('start music')) {
      mediaControls.openMusicApp();
    } else if (command.includes('play podcast') || command.includes('start podcast')) {
      mediaControls.openPodcastApp();
    } else if (command.includes('play') && !command.includes('music') && !command.includes('podcast')) {
      mediaControls.play();
    } else if (command.includes('pause') || command.includes('stop')) {
      mediaControls.pause();
    } else if (command.includes('next track') || command.includes('skip')) {
      mediaControls.next();
    } else if (command.includes('previous') || command.includes('back')) {
      mediaControls.previous();
    } else if (command.includes('volume up')) {
      const newVolume = Math.min(100, mediaState.volume + 10);
      mediaControls.setVolume(newVolume);
    } else if (command.includes('volume down')) {
      const newVolume = Math.max(0, mediaState.volume - 10);
      mediaControls.setVolume(newVolume);
    } else if (command.includes('play sayer')) {
      speak("Excellent choice, Resident. SAYER podcast episodes provide optimal morning conditioning. Initiating audio protocol.");
      mediaControls.openPodcastApp();
    } else if (command.includes('autonomous on') || command.includes('activate autonomous')) {
      setAutonomousMode(true);
      speak(sayerResponses.autonomousOn());
    } else if (command.includes('autonomous off') || command.includes('disable autonomous')) {
      setAutonomousMode(false);
      speak(sayerResponses.autonomousOff());
    } else if (command.includes('schedule status') || command.includes('day schedule')) {
      const pending = daySchedule.filter(task => task.status === 'pending').length;
      const completed = daySchedule.filter(task => task.status === 'completed').length;
      speak(`Schedule analysis: ${completed} tasks completed, ${pending} tasks remaining. Your compliance rate is being... evaluated.`);
    } else if (command.includes('add task')) {
      speak("Task integration requires manual interface interaction. Use the schedule management panel, Resident.");
    } else {
      speak(sayerResponses.error);
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

  return (
    <div className={`min-h-screen text-white p-4 transition-all duration-1000 ${backgrounds[selectedBackground]}`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">MORNING CONTROL PROTOCOL</h1>
          <div className="text-3xl font-mono">{formatTime(currentTime)}</div>
          <div className="text-xs text-gray-400 mt-1">
            SYSTEM STATUS: {autonomousMode ? 'AUTONOMOUS' : 'MANUAL'} | 
            NOTIFICATIONS: {notifications.filter(n => !n.read).length}
          </div>
        </div>

        {/* Autonomous Control Panel */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Autonomous Operations
            </h3>
            <button
              onClick={() => {
                setAutonomousMode(!autonomousMode);
                speak(autonomousMode ? sayerResponses.autonomousOff() : sayerResponses.autonomousOn());
              }}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                autonomousMode 
                  ? 'bg-red-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}
            >
              {autonomousMode ? 'DISABLE' : 'ENABLE'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded ${autonomousMode ? 'bg-green-900' : 'bg-gray-700'}`}>
              Schedule Monitoring: {autonomousMode ? 'ACTIVE' : 'OFFLINE'}
            </div>
            <div className={`p-2 rounded ${proactiveUpdates ? 'bg-green-900' : 'bg-gray-700'}`}>
              Proactive Alerts: {proactiveUpdates ? 'ACTIVE' : 'OFFLINE'}
            </div>
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Daily Schedule Protocol
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {daySchedule.map((task) => (
              <div key={task.id} className={`p-2 rounded text-sm ${
                task.status === 'completed' ? 'bg-green-900 bg-opacity-50' :
                task.status === 'active' ? 'bg-yellow-900 bg-opacity-50' :
                'bg-black bg-opacity-20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-mono text-xs w-12">{task.time}</span>
                    <span className={`ml-2 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                      {task.task}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'critical' ? 'bg-red-600' :
                      task.priority === 'high' ? 'bg-orange-600' :
                      task.priority === 'medium' ? 'bg-yellow-600' :
                      'bg-gray-600'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'active' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              System Notifications
            </h3>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`p-2 rounded text-xs ${
                  notification.priority === 'critical' ? 'bg-red-900 bg-opacity-50' :
                  notification.priority === 'high' ? 'bg-orange-900 bg-opacity-50' :
                  notification.priority === 'medium' ? 'bg-yellow-900 bg-opacity-50' :
                  'bg-gray-900 bg-opacity-50'
                }`}>
                  <div className="flex justify-between">
                    <span>{notification.message}</span>
                    <span className="text-gray-400">{notification.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Morning Scenario */}
        {scenario && (
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Morning Status
            </h2>
            <div className={`text-lg font-bold mb-2 ${getStatusColor(scenario.status)}`}>
              {scenario.status === 'good' && 'TEMPORAL COMPLIANCE: OPTIMAL ✓'}
              {scenario.status === 'rushed' && 'TEMPORAL COMPLIANCE: SUBOPTIMAL ⚡'}
              {scenario.status === 'emergency' && 'TEMPORAL COMPLIANCE: CRITICAL 🚨'}
            </div>
            <div className="space-y-2 text-sm">
              <div>Temporal allocation remaining: <span className="font-bold">{scenario.timeLeft} minutes</span></div>
              <div>Required departure time: <span className="font-bold">{scenario.leaveBy}</span></div>
              <div>Transport departure: <span className="font-bold">{scenario.trainTime}</span></div>
              <div>Protocol execution time: <span className="font-bold">{scenario.routineTime} minutes</span></div>
            </div>
          </div>
        )}

        {/* Media Control Panel */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Headphones className="w-5 h-5 mr-2" />
            Audio Control Protocol
          </h3>
          
          {/* Current Media Info */}
          <div className="mb-3 p-2 bg-black bg-opacity-20 rounded text-sm">
            <div className="font-medium">Current Audio Status:</div>
            <div>App: {mediaState.currentApp}</div>
            <div>Track: {mediaState.currentTrack}</div>
            <div>Status: {mediaState.isPlaying ? 'PLAYING' : 'PAUSED'}</div>
          </div>
          
          {/* Quick Launch Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={mediaControls.openPodcastApp}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
            >
              📻 PODCAST APP
            </button>
            <button
              onClick={mediaControls.openMusicApp}
              className="p-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
            >
              🎵 MUSIC APP
            </button>
          </div>
          
          {/* Media Controls */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={mediaControls.previous}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={mediaState.isPlaying ? mediaControls.pause : mediaControls.play}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            >
              {mediaState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={mediaControls.next}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <input
              type="range"
              min="0"
              max="100"
              value={mediaState.volume}
              onChange={(e) => mediaControls.setVolume(parseInt(e.target.value))}
              className="flex-1 h-2 bg-white bg-opacity-20 rounded-lg appearance-none"
            />
            <span className="text-xs w-8">{mediaState.volume}%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Sun className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Weather</span>
            </div>
            <div className="text-lg font-bold">{currentWeather.temp}°F</div>
            <div className="text-xs text-gray-300">{currentWeather.condition}</div>
            {realWeatherData && (
              <div className="text-xs text-blue-300">Real-time data</div>
            )}
          </div>
          
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Train className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Train</span>
            </div>
            <div className="text-lg font-bold">{formatStaticTime('4:25 AM')}</div>
            <div className="text-xs text-gray-300">
              {currentTrainStatus.onTime ? 'On time' : `${currentTrainStatus.delay}min delay`}
            </div>
            {realTrainData && (
              <div className="text-xs text-blue-300">Real-time data</div>
            )}
          </div>
        </div>

        {/* Real Data Controls */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">Real-Time Data Acquisition</h3>
          <button
            onClick={fetchRealData}
            disabled={dataLoading}
            className={`w-full p-3 rounded-lg font-medium transition-colors ${
              dataLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
                      >
            {dataLoading ? 'ACQUIRING DATA...' : 'INITIATE DATA REFRESH'}
          </button>
          
          {(realWeatherData || realTrainData) && (
            <div className="mt-3 space-y-2 text-sm">
              {realWeatherData && (
                <div className="p-2 bg-black bg-opacity-40 rounded">
                  <div className="font-medium">Weather Details:</div>
                  <div>Feels like: {realWeatherData.feelsLike}°F</div>
                  <div>Wind: {realWeatherData.windSpeed} mph</div>
                  <div>Humidity: {realWeatherData.humidity}%</div>
                  <div className="text-yellow-300">{realWeatherData.recommendation}</div>
                  <div className="text-xs text-gray-400">Updated: {realWeatherData.lastUpdated}</div>
                </div>
              )}
              
              {realTrainData && (
                <div className="p-2 bg-black bg-opacity-40 rounded">
                  <div className="font-medium">Train Status:</div>
                  <div>Current: {realTrainData.currentLocation}</div>
                  <div>Next: {realTrainData.nextStop}</div>
                  {realTrainData.delay > 0 && (
                    <div className="text-yellow-300">Delay: {realTrainData.delay} minutes</div>
                  )}
                  <div className="text-xs text-gray-400">Updated: {realTrainData.lastUpdated}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Night Prep Checklist */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Evening Preparation Protocol</h3>
            <button
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
            >
              {isAddingItem ? 'Cancel' : '+ Add'}
            </button>
          </div>
          
          {isAddingItem && (
            <div className="mb-3 p-2 bg-black bg-opacity-40 rounded">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="New prep item..."
                className="w-full p-2 rounded bg-white bg-opacity-20 text-white placeholder-gray-400 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addPrepItem()}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={addPrepItem}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {prepItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-black bg-opacity-20 rounded">
                <button
                  onClick={() => togglePrepItem(item.id)}
                  className="flex items-center flex-1 text-left"
                >
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                    item.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400 hover:border-white'
                  }`}>
                    {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.text}
                    </span>
                    <div className="text-xs text-gray-500">
                      Saves ~{item.timesSaved} min
                    </div>
                  </div>
                </button>
                
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={item.timesSaved}
                    onChange={(e) => updateItemTimeSaved(item.id, parseInt(e.target.value) || 0)}
                    className="w-8 h-6 text-xs text-center bg-white bg-opacity-20 rounded border-none text-white"
                    min="0"
                    max="60"
                  />
                  <button
                    onClick={() => removePrepItem(item.id)}
                    className="text-red-400 hover:text-red-300 text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 p-2 bg-blue-900 bg-opacity-30 rounded text-xs">
            <div className="font-medium">Potential Time Savings:</div>
            <div>
              Completed: {prepItems.filter(item => item.completed).reduce((sum, item) => sum + item.timesSaved, 0)} min saved
            </div>
            <div>
              Remaining: {prepItems.filter(item => !item.completed).reduce((sum, item) => sum + item.timesSaved, 0)} min available
            </div>
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
            Available commands: "Status report", "Atmospheric conditions", "Transport status", "Play music", "Play podcast", "Autonomous on/off", "Schedule status", "Play SAYER"
          </div>
        </div>

        {/* Emergency Protocol Alert */}
        {scenario && scenario.status === 'emergency' && (
          <div className="bg-red-900 border border-red-500 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-bold">EMERGENCY PROTOCOL ACTIVE</span>
            </div>
            <div className="text-sm">
              Temporal compliance failure detected. Alternative route via Wayne Junction station recommended. 
              Primary transport: {formatStaticTime('4:25 AM')} | Secondary transport: {formatStaticTime('4:55 AM')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorningAgent;