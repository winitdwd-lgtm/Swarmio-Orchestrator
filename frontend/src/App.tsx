import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Terminal, LineChart as ChartIcon, AlertTriangle, ShieldCheck, Pause } from 'lucide-react';
import * as THREE from 'three';

// --- 3D TOPOLOGY ---
function NetworkTopology({ isOverloaded, isPaused }: { isOverloaded: boolean, isPaused: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += isOverloaded ? 0.05 : 0.005;
      groupRef.current.rotation.x += isOverloaded ? 0.02 : 0.002;
    }
  });
  const nodeColor = isOverloaded ? "#ff003c" : "#00f0ff";
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}><octahedronGeometry args={[1.5, 0]} /><meshStandardMaterial color={nodeColor} wireframe /></mesh>
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 4, 0, Math.sin(angle) * 4]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color={isOverloaded ? "#ff5500" : "#8a2be2"} emissive={nodeColor} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // --- USER INTERFACE STATE ---
  const [taskType, setTaskType] = useState('text');
  const [payload, setPayload] = useState('');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- ADMIN TELEMETRY STATE ---
  const [traffic, setTraffic] = useState(5000);
  const [gateways, setGateways] = useState(3);
  const [workers, setWorkers] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const [chartData, setChartData] = useState<{ time: string, requests: number, drops: number, latency: number }[]>([]);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const maxCapacity = gateways * 3000;
  const isOverloaded = traffic > maxCapacity;

  // <-- RESTORED: The status definition
  const systemStatus = isPaused ? "STREAM PAUSED" : (isOverloaded ? "CRITICAL LOAD" : "HEALTHY");

  // --- NLP LIVE API CALL ---
  const sendToSwarm = async () => {
    setLoading(true);
    setApiResponse("Routing through Load Balancer to Docker Drones...");
    const payloadData = taskType === 'text' ? { sentence: payload } : { numbers: payload.split(',').map(n => parseInt(n.trim())) };
    try {
      const res = await fetch('http://localhost:80/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Swarmio-Key': import.meta.env.VITE_SWARMIO_API_KEY || '' },
        body: JSON.stringify({ task_type: taskType, payload: payloadData })
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setApiResponse("Error: Could not establish connection to the Swarm. Are your Docker containers running?");
    }
    setLoading(false);
  };

  // --- ADMIN SIMULATION LOOP ---
  useEffect(() => {
    if (activeTab !== 'admin') return;
    const interval = setInterval(() => {
      if (isPaused) return;
      const timeString = new Date().toLocaleTimeString();
      const dropRate = isOverloaded ? Math.floor((traffic - maxCapacity) * 0.4) : 0;
      const latency = isOverloaded ? Math.floor(Math.random() * 500) + 200 : Math.floor(Math.random() * 40) + 10;

      setChartData(prev => {
        const newData = [...prev, { time: timeString, requests: traffic, drops: dropRate, latency }];
        return newData.length > 15 ? newData.slice(1) : newData;
      });

      const newLog = (isOverloaded && Math.random() > 0.5)
        ? `[${timeString}] CRITICAL | IP: 192.168.1.x | ERR 503: Packet Dropped.`
        : `[${timeString}] SUCCESS  | IP: 192.168.1.x | Target: NLP_Drone_${Math.floor(Math.random() * workers)} | Latency: ${latency}ms`;

      setAuditLogs(prev => [...prev, newLog].slice(-50));
    }, 1000);
    return () => clearInterval(interval);
  }, [traffic, gateways, workers, isOverloaded, maxCapacity, isPaused, activeTab]);

  useEffect(() => {
    if (terminalRef.current && !isPaused) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [auditLogs, isPaused]);

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 5, 10] }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
          <NetworkTopology isOverloaded={isOverloaded} isPaused={isPaused} />
          <OrbitControls enableZoom={false} autoRotate={!isOverloaded && !isPaused} autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 p-6 flex flex-col pointer-events-none">

        {/* HEADER & TABS */}
        <header className="flex justify-between items-center mb-6 pointer-events-auto">

          {/* <-- RESTORED: The Glowing Status Badge next to the Title --> */}
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                SWARMIO
              </h1>
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">Created by Vineet M Dharwad ™</span>
            </div>
            {activeTab === 'admin' && (
              <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border backdrop-blur-md font-bold tracking-widest text-xs transition-colors ${isPaused ? 'bg-yellow-900/40 border-yellow-500 text-yellow-400' : isOverloaded ? 'bg-red-900/40 border-red-500 text-red-400 animate-pulse' : 'bg-emerald-900/40 border-emerald-500 text-emerald-400'}`}>
                {isPaused ? <Pause size={14} /> : (isOverloaded ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />)}
                <span>{systemStatus}</span>
              </div>
            )}
          </div>

          <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-md">
            <button onClick={() => setActiveTab('user')} className={`flex items-center px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'user' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}>
              <Terminal size={16} className="mr-2" /> User Interface
            </button>
            <button onClick={() => setActiveTab('admin')} className={`flex items-center px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'admin' ? 'bg-purple-500 text-black' : 'text-gray-400 hover:text-white'}`}>
              <ChartIcon size={16} className="mr-2" /> Admin Telemetry
            </button>
          </div>
        </header>

        {/* --- VIEW: USER CHAT BOX --- */}
        {activeTab === 'user' && (
          <div className="flex-1 flex items-center justify-center pointer-events-auto">
            <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col space-y-6">
                <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="bg-black/80 border border-white/20 text-white rounded-lg p-4 font-mono focus:border-cyan-500 outline-none">
                  <option value="text">Drone Protocol: NLP Sentiment Analysis</option>
                  <option value="math">Drone Protocol: Mathematical Optimization</option>
                </select>
                <input
                  type="text" value={payload} onChange={(e) => setPayload(e.target.value)}
                  placeholder={taskType === 'text' ? "Type a sentence for NLP analysis..." : "Enter numbers (e.g., 5, 9, 12)..."}
                  className="bg-black/80 border border-white/20 text-cyan-400 placeholder-gray-600 rounded-lg p-4 font-mono focus:border-cyan-500 outline-none"
                />
                <button onClick={sendToSwarm} disabled={loading} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-lg p-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {loading ? 'TRANSMITTING...' : 'INITIALIZE SWARM ROUTING'}
                </button>
              </div>
              {apiResponse && (
                <div className="mt-6 bg-black/80 border-l-4 border-cyan-500 p-4 rounded-r-lg max-h-64 overflow-y-auto custom-scrollbar">
                  <pre className="text-cyan-400 font-mono text-sm whitespace-pre-wrap">{apiResponse}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: ADMIN TELEMETRY --- */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-12 gap-6 flex-1 pointer-events-auto">
            {/* Left Controls */}
            <div className="col-span-3 flex flex-col space-y-6">
              <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl p-4">
                <h2 className="font-bold text-cyan-400 mb-2">Traffic Injection</h2>
                <input type="range" min="1000" max="50000" step="1000" value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} className="w-full" disabled={isPaused} />
                <div className="text-right font-mono font-bold mt-2">{traffic.toLocaleString()} req/s</div>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl p-4">
                <h2 className="font-bold text-purple-400 mb-2">Scale Gateways</h2>
                <div className="flex justify-between items-center"><button onClick={() => setGateways(Math.max(1, gateways - 1))} className="px-3 py-1 bg-white/10 rounded">-</button><span className="font-mono">{gateways} Nodes</span><button onClick={() => setGateways(gateways + 1)} className="px-3 py-1 bg-white/10 rounded">+</button></div>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl p-4">
                <h2 className="font-bold text-emerald-400 mb-2">Scale NLP Workers</h2>
                <div className="flex justify-between items-center"><button onClick={() => setWorkers(Math.max(1, workers - 1))} className="px-3 py-1 bg-white/10 rounded">-</button><span className="font-mono">{workers} Drones</span><button onClick={() => setWorkers(workers + 1)} className="px-3 py-1 bg-white/10 rounded">+</button></div>
              </div>
            </div>

            {/* Right Charts & Terminal */}
            <div className="col-span-9 flex flex-col space-y-6">
              <div className="flex space-x-6 h-64">
                {/* Graph 1: Throughput */}
                <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl p-4 shadow-2xl">
                  <h3 className="text-sm font-mono text-gray-400 mb-2">Live Throughput vs Packet Drops</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#00f0ff" stopOpacity={0} /></linearGradient>
                        <linearGradient id="colorDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff003c" stopOpacity={0.5} /><stop offset="95%" stopColor="#ff003c" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} />
                      <YAxis stroke="#ffffff50" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#000000cc', borderColor: '#333' }} />
                      <Area type="monotone" dataKey="requests" stroke="#00f0ff" fillOpacity={1} fill="url(#colorReq)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="drops" stroke="#ff003c" fillOpacity={1} fill="url(#colorDrop)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Graph 2: Latency */}
                <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl p-4 shadow-2xl">
                  <h3 className="text-sm font-mono text-gray-400 mb-2">System Latency (ms)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} />
                      <YAxis stroke="#ffffff50" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#000000cc', borderColor: '#333' }} />
                      <Line type="step" dataKey="latency" stroke="#eab308" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Terminal */}
              <div className="flex-1 bg-black/80 border border-white/10 backdrop-blur-lg rounded-xl p-4 flex flex-col font-mono text-xs">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                  <span className="text-gray-500">AUDIT STREAM</span>
                  <button onClick={() => setIsPaused(!isPaused)} className={`px-2 py-1 rounded font-bold ${isPaused ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>{isPaused ? 'RESUME' : 'PAUSE'}</button>
                </div>
                <div className="flex-1 overflow-y-auto" ref={terminalRef}>
                  {auditLogs.map((log, i) => <div key={i} className={log.includes("CRITICAL") ? "text-red-500" : "text-emerald-400"}>{log}</div>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}