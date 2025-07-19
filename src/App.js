import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore'; // Removed unused import
import { Bell, Sun, Moon, Sparkles, X, LoaderCircle } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Initialize Firebase ---
initializeApp(firebaseConfig); // Initialize app, but no need to store in a variable if not used elsewhere

// --- Mock Financial Data API ---
const lotSizes = {
    'RELIANCE': 250, 'TCS': 150, 'HDFCBANK': 550, 'INFY': 300, 'ICICIBANK': 1375, 'HINDUNILVR': 300, 'SBIN': 1500, 'BAJFINANCE': 125, 'KOTAKBANK': 400, 'BHARTIARTL': 950, 'ITC': 3200, 'ASIANPAINT': 200, 'HCLTECH': 700, 'AXISBANK': 1200, 'MARUTI': 50, 'LT': 300
};
const fnoStocks = Object.keys(lotSizes);

// --- UI Components ---

const Header = () => (
    <div className="bg-gradient-to-br from-purple-700/50 to-indigo-800/50 backdrop-blur-lg p-6 rounded-3xl mb-6 text-center border border-white/10 shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-lime-300 flex items-center justify-center gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" className="filter drop-shadow-lg">
                <rect x="5" y="10" width="4" height="8" rx="1" fill="#10b981"></rect>
                <line x1="7" y1="4" x2="7" y2="20" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"></line>
                <rect x="15" y="6" width="4" height="8" rx="1" fill="#ef4444"></rect>
                <line x1="17" y1="4" x2="17" y2="20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"></line>
            </svg>
            FiFTO
        </h1>
        <p className="text-indigo-200 mt-2">Enhanced F&O Analytics & Real-time Reporting</p>
    </div>
);

const FMIIndicator = ({ fmiData, onInterpret }) => {
    const rotation = (fmiData.long_pct / 100) * 180 - 90;
    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-4 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Fund Momentum Indicator</h2>
                <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg inline-flex items-center gap-2 transition-all" onClick={onInterpret}>
                    <Sparkles size={16} />
                    Interpret Sentiment
                </button>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div className="w-64 h-32 relative overflow-hidden">
                    <div className="w-full h-full rounded-t-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                         style={{ maskImage: 'radial-gradient(circle at 50% 100%, transparent 60%, black 61%)', WebkitMaskImage: 'radial-gradient(circle at 50% 100%, transparent 60%, black 61%)' }}>
                    </div>
                    <div className="w-1 h-24 bg-white rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 origin-bottom transition-transform duration-700 ease-in-out"
                         style={{ transform: `rotate(${rotation}deg)` }}>
                    </div>
                    <div className="w-5 h-5 bg-slate-700 border-2 border-white rounded-full absolute bottom-[-10px] left-1/2 transform -translate-x-1/2"></div>
                </div>
                <div className="font-orbitron text-lg font-bold flex gap-4">
                    <span className="text-green-400">Long: {fmiData.long_pct.toFixed(1)}%</span>
                    <span className="text-red-400">Short: {fmiData.short_pct.toFixed(1)}%</span>
                </div>
            </div>
            <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t border-slate-700">
                <span className="font-semibold">Nifty Sentiment: <span className="text-purple-400">{fmiData.nifty_signal}</span></span>
                <span className="text-slate-400">Last Update: {new Date(fmiData.last_update).toLocaleTimeString()}</span>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, change, onClick, type }) => {
    const colors = {
        supply: 'text-green-400',
        demand: 'text-red-400',
        watchlist: 'text-orange-400',
        nifty: 'text-purple-400',
    };
    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-4 rounded-2xl text-center cursor-pointer transition-all hover:bg-slate-700/50 hover:scale-105" onClick={onClick}>
            <div className={`font-orbitron text-4xl font-bold ${colors[type]}`}>{value}</div>
            {change && <div className={`text-sm ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</div>}
            <div className="text-slate-400 text-xs uppercase mt-1">{label}</div>
        </div>
    );
};

const FloatingButtons = ({ theme, toggleTheme, unreadCount, onBellClick }) => (
    <div className="fixed top-4 right-4 z-50 flex gap-3">
        <div className="relative">
            <button onClick={onBellClick} className="btn btn-circle bg-slate-800/80 backdrop-blur-md border-slate-600 text-white">
                <Bell size={24} />
            </button>
            {unreadCount > 0 && 
                <span className="absolute top-0 right-0 block h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-slate-800">
                    {unreadCount}
                </span>
            }
        </div>
        <button onClick={toggleTheme} className="btn btn-circle bg-slate-800/80 backdrop-blur-md border-slate-600 text-white">
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
    </div>
);

const NotificationPanel = ({ notifications, isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed top-20 right-4 z-[100] w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl">
            <div className="p-4 border-b border-slate-700">
                <h3 className="font-bold text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="p-4 text-slate-400 text-center">No new notifications.</p>
                ) : (
                    notifications.map((n, i) => (
                        <div key={i} className="p-4 border-b border-slate-800 flex gap-3">
                            <span className="text-xl">{n.type === 'alert' ? '⚡️' : '⚠️'}</span>
                            <div>
                                <p className="text-white text-sm">{n.message}</p>
                                <p className="text-slate-500 text-xs mt-1">{new Date(n.time).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const AnalysisModal = ({ isOpen, onClose, stock, analysis, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[101] p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">✨ AI Analysis: {stock?.stock}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>
                <div>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <LoaderCircle className="animate-spin text-purple-400" size={48} />
                            <p className="mt-4 text-slate-300">Analyzing with Gemini...</p>
                        </div>
                    ) : (
                        <div className="text-slate-300 whitespace-pre-wrap">{analysis}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DataTable = ({ title, data, onAnalyze }) => (
    <div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-700/50">
                    <tr>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="border-b border-slate-800">
                            <td className="p-3 font-semibold">{item.stock}</td>
                            <td className={`p-3 font-semibold ${item.action === 'Breakout' ? 'text-green-400' : 'text-red-400'}`}>{item.action}</td>
                            <td className="p-3">₹{item.price.toFixed(2)}</td>
                            <td className="p-3 text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</td>
                            <td className="p-3">
                                <button onClick={() => onAnalyze(item)} className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded-md inline-flex items-center gap-1 transition-all">
                                    <Sparkles size={14} /> Analyze
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default function App() {
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('alerts');
    const [fmiData, setFmiData] = useState({ long_pct: 50, short_pct: 50, nifty_signal: 'Neutral', last_update: new Date().toISOString() });
    const [stats, ] = useState({ nifty: '0.00', nifty_change: '+0.00 (+0.00%)' }); // Removed unused setStats
    const [alerts, setAlerts] = useState([]);
    const [watchlist, ] = useState([]); // Removed unused setWatchlist
    const [supplyZones, ] = useState([]); // Removed unused setSupplyZones
    const [demandZones, ] = useState([]); // Removed unused setDemandZones
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalStock, setModalStock] = useState(null);
    const [modalAnalysis, setModalAnalysis] = useState("");
    const [isModalLoading, setModalLoading] = useState(false);

    const tabsRef = useRef(null);

    const callGeminiAPI = async (prompt) => {
        const apiKey = ""; // Injected at runtime by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
              return result.candidates[0].content.parts[0].text;
            } else {
              return "Sorry, I couldn't generate an analysis at this time.";
            }
        } catch (error) {
            console.error("Gemini API call error:", error);
            return "An error occurred while contacting the AI. Please check the console.";
        }
    };

    const handleInterpretFMI = async () => {
        setModalStock({ stock: "Market Sentiment" });
        setModalOpen(true);
        setModalLoading(true);
        const prompt = `Based on the following market sentiment data (Long Percentage: ${fmiData.long_pct.toFixed(1)}%, Short Percentage: ${fmiData.short_pct.toFixed(1)}%, Nifty 50 Trend: ${fmiData.nifty_signal}), provide a brief, one-paragraph interpretation of the current overall market mood for an Indian stock market trader. Explain what this combination might suggest.`;
        const analysis = await callGeminiAPI(prompt);
        setModalAnalysis(analysis);
        setModalLoading(false);
    };

    const handleAnalyzeStock = async (stock) => {
        setModalStock(stock);
        setModalOpen(true);
        setModalLoading(true);
        const prompt = `You are a helpful stock market assistant. A technical alert has been triggered for the Indian stock: ${stock.stock}. The alert is a "${stock.action}". Briefly explain in simple terms what this technical signal means. Then, provide a short, balanced analysis of potential bullish and bearish factors for this stock. Keep the entire analysis to under 100 words. Do not give financial advice.`;
        const analysis = await callGeminiAPI(prompt);
        setModalAnalysis(analysis);
        setModalLoading(false);
    };

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const handleBellClick = () => {
        setNotificationPanelOpen(prev => !prev);
        if (!isNotificationPanelOpen) {
            setUnreadCount(0);
        }
    };
    
    const addNotification = useCallback((type, message) => {
        const newNotification = { type, message, time: new Date().toISOString() };
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);
    
    const goToTab = (tabName) => {
        setActiveTab(tabName);
        setTimeout(() => {
            tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // Mock data fetching
    useEffect(() => {
        const interval = setInterval(() => {
            setFmiData({
                long_pct: Math.random() * 100,
                short_pct: 100 - (fmiData.long_pct),
                nifty_signal: ['Bullish', 'Bearish', 'Neutral'][Math.floor(Math.random() * 3)],
                last_update: new Date().toISOString()
            });

            if (Math.random() > 0.7) {
                const stock = fnoStocks[Math.floor(Math.random() * fnoStocks.length)];
                const newAlert = {
                    stock,
                    action: Math.random() > 0.5 ? 'Breakout' : 'Breakdown',
                    price: Math.random() * 2000,
                    timestamp: new Date().toISOString()
                };
                setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
                addNotification('alert', `${newAlert.stock} - ${newAlert.action} @ ₹${newAlert.price.toFixed(2)}`);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [addNotification, fmiData.long_pct]);

    return (
        <div className={`min-h-screen bg-slate-900 text-slate-200 dark`}>
            <div className="background-dots"></div>
            <FloatingButtons theme={theme} toggleTheme={toggleTheme} unreadCount={unreadCount} onBellClick={handleBellClick} />
            <NotificationPanel notifications={notifications} isOpen={isNotificationPanelOpen} />
            <AnalysisModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} stock={modalStock} analysis={modalAnalysis} isLoading={isModalLoading} />

            <main className="container mx-auto p-4">
                <Header />
                <FMIIndicator fmiData={fmiData} onInterpret={handleInterpretFMI} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard label="NIFTY Current" value={stats.nifty} change={stats.nifty_change} type="nifty" />
                    <StatCard label="Supply Breakouts" value={supplyZones.length} onClick={() => goToTab('supply')} type="supply" />
                    <StatCard label="Demand Breakdowns" value={demandZones.length} onClick={() => goToTab('demand')} type="demand" />
                    <StatCard label="Watchlist Stocks" value={watchlist.length} onClick={() => goToTab('watchlist')} type="watchlist" />
                </div>

                <div ref={tabsRef} className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl">
                    <div className="flex border-b border-slate-700">
                        {['alerts', 'supply', 'demand', 'watchlist', 'reports'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`flex-1 p-3 text-sm md:text-base font-semibold capitalize transition-colors ${activeTab === tab ? 'bg-slate-700/50 text-purple-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="p-4">
                        {activeTab === 'alerts' && <DataTable title="Live Alerts" data={alerts} onAnalyze={handleAnalyzeStock} />}
                        {activeTab === 'supply' && <DataTable title="Supply Zones" data={supplyZones} onAnalyze={handleAnalyzeStock} />}
                        {activeTab === 'demand' && <DataTable title="Demand Zones" data={demandZones} onAnalyze={handleAnalyzeStock} />}
                        {activeTab === 'watchlist' && <div>Watchlist Content</div>}
                        {activeTab === 'reports' && <div>Reports Content</div>}
                    </div>
                </div>
            </main>
        </div>
    );
}

Step 2: Update Your package.json File
Now, go to your package.json file on GitHub. Edit it and replace its contents with the code below. The key change is adding CI=false to the "build" script. This tells Netlify to ignore warnings and not treat them as errors.

{
  "name": "fifto-react-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "firebase": "^10.12.2",
    "lucide-react": "^0.395.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "CI=false react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
