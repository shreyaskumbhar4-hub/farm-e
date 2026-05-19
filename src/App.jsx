import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Home, Bot, CloudSun, User, Sprout, Send, Search,
  Thermometer, Droplets, Wind, Eye, MapPin, ChevronRight,
  Leaf, Sun, Moon, AlertTriangle, TrendingUp, Calendar,
  LogOut, Mail, Lock, CheckCircle, RefreshCw, BookOpen, Bell
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./firebase";

// ─── Design Tokens ─────────────────────────────────────────────────
const C = {
  soil:   "#2D1B00",
  bark:   "#4A2C0A",
  moss:   "#2D5016",
  leaf:   "#4A7C2F",
  sprout: "#6BAF3D",
  lime:   "#A8D96C",
  gold:   "#D4A017",
  amber:  "#E8820C",
  cream:  "#F5F0E8",
  fog:    "#EAE6DD",
  mist:   "#F9F7F4",
};

// ─── Static Data ────────────────────────────────────────────────────
const CROP_TIPS = [
  { crop: "Wheat",   icon: "🌾", stage: "Sowing",         tip: "Optimal sowing temp: 20–25°C. Ensure soil moisture > 60%.",                           alert: false },
  { crop: "Rice",    icon: "🌾", stage: "Transplanting",   tip: "Maintain 5 cm standing water. Fertilize with NPK 120:60:60.",                         alert: true  },
  { crop: "Tomato",  icon: "🍅", stage: "Fruiting",        tip: "Watch for early blight. Apply copper fungicide if humidity > 80%.",                    alert: true  },
  { crop: "Cotton",  icon: "🌿", stage: "Boll Formation",  tip: "Irrigate every 10 days. Monitor for bollworm infestation.",                            alert: false },
  { crop: "Soybean", icon: "🫘", stage: "Flowering",       tip: "Avoid excess nitrogen at flowering. Ensure proper nodulation.",                        alert: false },
];

const MARKET_PRICES = [
  { crop: "Wheat",   price: "₹2,275", change: "+1.2%", up: true  },
  { crop: "Rice",    price: "₹3,100", change: "+0.8%", up: true  },
  { crop: "Cotton",  price: "₹6,840", change: "−0.5%", up: false },
  { crop: "Soybean", price: "₹4,920", change: "+2.1%", up: true  },
  { crop: "Maize",   price: "₹1,890", change: "−1.0%", up: false },
];

const WX_ICON = {
  Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Haze: "🌫️", Fog: "🌫️",
};

const fmt      = (dt) => new Date(dt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const fmtTime  = (ts) => new Date(ts * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening"; };

// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]               = useState("home");
  const [user, setUser]             = useState(null);

  // Auth
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [authMode, setAuthMode]     = useState("login");
  const [authLoading, setAuthLoading] = useState(false);

  // Weather
  const [city, setCity]             = useState("Pune");
  const [weather, setWeather]       = useState(null);
  const [forecast, setForecast]     = useState([]);
  const [wxLoading, setWxLoading]   = useState(false);

  // AI
  const [messages, setMessages]     = useState([{
    sender: "ai",
    text: "🌱 Namaste! I'm Farm-E, your AI farming companion.\nAsk me about crops, soil, diseases, irrigation, or market trends.",
    time: new Date(),
  }]);
  const [input, setInput]           = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const msgEnd                      = useRef(null);

  // Crops
  const [selCrop, setSelCrop]       = useState(null);

  // ── Auth listener ────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // ── Weather on mount ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setWxLoading(true);
      try {
        const key = import.meta.env.VITE_WEATHER_API_KEY;
        const [w, f] = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Pune&appid=${key}&units=metric`),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=Pune&appid=${key}&units=metric`),
        ]);
        setWeather(w.data);
        setForecast(f.data.list.filter((i) => i.dt_txt.includes("12:00:00")));
      } catch (e) { console.error(e); }
      finally { setWxLoading(false); }
    };
    init();
  }, []);

  // ── Auto-scroll chat ─────────────────────────────────────────
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Fetch weather ────────────────────────────────────────────
  const fetchWeather = async (q) => {
    if (!q.trim()) return;
    setWxLoading(true);
    try {
      const key = import.meta.env.VITE_WEATHER_API_KEY;
      const [w, f] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${key}&units=metric`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${key}&units=metric`),
      ]);
      setWeather(w.data);
      setForecast(f.data.list.filter((i) => i.dt_txt.includes("12:00:00")));
    } catch { alert("City not found. Please check the name."); }
    finally { setWxLoading(false); }
  };

  // ── Send AI message ──────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    const txt = input.trim();
    setMessages((p) => [...p, { sender: "user", text: txt, time: new Date() }]);
    setInput("");
    setChatLoading(true);
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-oss-20b:free",
          messages: [
            { role: "system", content: "You are Farm-E AI, an expert farming assistant for Indian farmers. Help with crop management, soil health, pest control, irrigation, fertilizers, weather interpretation, and government schemes. Be practical, clear, and region-aware. Use bullet points for steps." },
            ...messages.slice(-6).map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
            { role: "user", content: txt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://farm-e.app",
            "X-Title": "Farm-E",
            "Content-Type": "application/json",
          },
        }
      );
      setMessages((p) => [...p, { sender: "ai", text: res.data.choices[0].message.content, time: new Date() }]);
    } catch {
      setMessages((p) => [...p, { sender: "ai", text: "⚠️ Unable to reach AI. Check your connection and try again.", time: new Date() }]);
    } finally { setChatLoading(false); }
  };

  // ── Auth ─────────────────────────────────────────────────────
  const handleAuth = async () => {
    if (!email || !password) return alert("Enter email and password.");
    setAuthLoading(true);
    try {
      if (authMode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (e) { alert(e.message); }
    finally { setAuthLoading(false); }
  };

  // ════════════════════════════════════════════════════════════
  // SCREENS
  // ════════════════════════════════════════════════════════════

  const HomeScreen = () => (
    <div>
      {/* Hero */}
      <div style={{ background: `linear-gradient(145deg, ${C.moss} 0%, ${C.leaf} 60%, ${C.sprout} 100%)`, padding: "28px 20px 44px", position: "relative", overflow: "hidden" }}>
        {/* subtle texture */}
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
            <MapPin size={13} color="rgba(255,255,255,0.75)" />
            <span style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>{weather ? `${weather.name}, ${weather.sys?.country}` : "Locating…"}</span>
          </div>
          <h1 style={{ color:"#fff", fontSize:26, fontWeight:700, margin:0, fontFamily:"Georgia, serif" }}>Good {greeting()} 🌾</h1>
          <p style={{ color:"rgba(255,255,255,0.8)", fontSize:13, margin:"4px 0 18px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </p>
          {weather && (
            <div style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(12px)", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:40 }}>{WX_ICON[weather.weather[0].main] || "🌤️"}</span>
              <div>
                <p style={{ color:"#fff", fontSize:30, fontWeight:700, margin:0, fontFamily:"Georgia, serif" }}>{Math.round(weather.main.temp)}°C</p>
                <p style={{ color:"rgba(255,255,255,0.8)", fontSize:13, margin:0, textTransform:"capitalize" }}>{weather.weather[0].description}</p>
              </div>
              <div style={{ marginLeft:"auto", textAlign:"right" }}>
                <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:0 }}>Humidity</p>
                <p style={{ color:"#fff", fontSize:18, fontWeight:700, margin:0 }}>{weather.main.humidity}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert strip */}
      <div style={{ margin:"14px 14px 0", background:"#FFF8E1", border:"1px solid #FFD54F", borderRadius:12, padding:"12px 14px", display:"flex", gap:10, alignItems:"flex-start" }}>
        <AlertTriangle size={17} color="#E65100" style={{ flexShrink:0, marginTop:1 }} />
        <div>
          <p style={{ margin:0, fontSize:12, fontWeight:700, color:"#E65100" }}>Advisory Alert</p>
          <p style={{ margin:0, fontSize:12, color:"#795548", lineHeight:1.5 }}>High humidity expected this week — monitor rice &amp; tomato for fungal diseases.</p>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding:"18px 14px 0" }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.soil, margin:"0 0 12px", fontFamily:"Georgia, serif" }}>Quick Actions</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { icon:<Bot size={24} color={C.sprout}/>,    label:"AI Advisor",   sub:"Ask anything",        id:"ai",     bg:"#F0FFF0" },
            { icon:<CloudSun size={24} color={C.amber}/>,label:"Weather",      sub:"7-day forecast",      id:"weather", bg:"#FFF8F0" },
            { icon:<Sprout size={24} color={C.moss}/>,   label:"My Crops",     sub:"Manage & track",      id:"crops",  bg:"#F4FAF0" },
            { icon:<TrendingUp size={24} color="#1565C0"/>,label:"Market",     sub:"Live mandi rates",    id:"market", bg:"#F0F4FF" },
          ].map(({ icon, label, sub, id, bg }) => (
            <button key={id} onClick={() => setTab(id)} style={{ background:bg, border:"1.5px solid rgba(0,0,0,0.05)", borderRadius:16, padding:"15px 13px", textAlign:"left", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              {icon}
              <p style={{ margin:"10px 0 2px", fontWeight:700, fontSize:13, color:C.soil, fontFamily:"Georgia, serif" }}>{label}</p>
              <p style={{ margin:0, fontSize:11, color:"#999" }}>{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mandi snapshot */}
      <div style={{ padding:"18px 14px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:C.soil, margin:0, fontFamily:"Georgia, serif" }}>Mandi Rates</h2>
          <button onClick={() => setTab("market")} style={{ background:"none", border:"none", color:C.sprout, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          {MARKET_PRICES.slice(0, 3).map((item, i) => (
            <div key={item.crop} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 15px", borderBottom: i < 2 ? "1px solid #F5F5F5" : "none" }}>
              <div>
                <p style={{ margin:0, fontWeight:600, fontSize:13, color:C.soil }}>{item.crop}</p>
                <p style={{ margin:0, fontSize:10, color:"#aaa" }}>per quintal</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ margin:0, fontWeight:700, fontSize:14, color:C.soil }}>{item.price}</p>
                <p style={{ margin:0, fontSize:11, fontWeight:600, color: item.up ? "#2E7D32" : "#C62828" }}>{item.up ? "▲" : "▼"} {item.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WeatherScreen = () => (
    <div>
      <div style={{ background:"#fff", padding:"18px 14px 14px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:C.soil, margin:"0 0 14px", fontFamily:"Georgia, serif" }}>Weather</h2>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:C.fog, borderRadius:12, padding:"0 12px" }}>
            <Search size={15} color="#aaa" />
            <input
              value={city} onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)}
              placeholder="Search city or district…"
              style={{ flex:1, border:"none", background:"none", padding:"12px 4px", outline:"none", fontSize:13, color:C.soil }}
            />
          </div>
          <button onClick={() => fetchWeather(city)} style={{ background:C.leaf, color:"#fff", border:"none", borderRadius:12, padding:"0 16px", cursor:"pointer", display:"flex", alignItems:"center" }}>
            {wxLoading ? <RefreshCw size={15} style={{ animation:"spin 0.8s linear infinite" }} /> : <Search size={15} />}
          </button>
        </div>
      </div>

      {wxLoading ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:220, gap:12 }}>
          <div style={{ width:38, height:38, border:`3px solid ${C.lime}`, borderTopColor:C.leaf, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
          <p style={{ color:"#aaa", fontSize:13 }}>Fetching weather…</p>
        </div>
      ) : weather ? (
        <div style={{ padding:14 }}>
          {/* Main card */}
          <div style={{ background:`linear-gradient(145deg, ${C.moss}, ${C.leaf})`, borderRadius:22, padding:22, marginBottom:14, boxShadow:"0 8px 32px rgba(45,80,22,0.3)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:4 }}>
                  <MapPin size={13} color="rgba(255,255,255,0.75)" />
                  <span style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>{weather.name}, {weather.sys.country}</span>
                </div>
                <p style={{ color:"#fff", fontSize:52, fontWeight:700, margin:0, fontFamily:"Georgia, serif", lineHeight:1 }}>{Math.round(weather.main.temp)}°</p>
                <p style={{ color:"rgba(255,255,255,0.85)", fontSize:15, margin:"6px 0 0", textTransform:"capitalize" }}>{weather.weather[0].description}</p>
                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, margin:"4px 0 0" }}>Feels {Math.round(weather.main.feels_like)}° · H:{Math.round(weather.main.temp_max)}° L:{Math.round(weather.main.temp_min)}°</p>
              </div>
              <span style={{ fontSize:58 }}>{WX_ICON[weather.weather[0].main] || "🌤️"}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginTop:18, borderTop:"1px solid rgba(255,255,255,0.2)", paddingTop:14 }}>
              {[
                { icon:<Droplets size={13}/>,    label:"Humidity",   val:`${weather.main.humidity}%` },
                { icon:<Wind size={13}/>,         label:"Wind",       val:`${weather.wind.speed} m/s` },
                { icon:<Eye size={13}/>,          label:"Visibility", val:`${(weather.visibility/1000).toFixed(1)}km` },
                { icon:<Thermometer size={13}/>,  label:"Pressure",   val:`${weather.main.pressure}` },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ textAlign:"center" }}>
                  <div style={{ color:"rgba(255,255,255,0.65)", display:"flex", justifyContent:"center", marginBottom:3 }}>{icon}</div>
                  <p style={{ color:"#fff", fontSize:12, fontWeight:700, margin:0 }}>{val}</p>
                  <p style={{ color:"rgba(255,255,255,0.55)", fontSize:9, margin:0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sun card */}
          <div style={{ background:"#fff", borderRadius:16, padding:15, marginBottom:14, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", display:"flex", justifyContent:"space-around" }}>
            {[
              { icon:<Sun size={20} color="#FFA726"/>,  label:"Sunrise", val:fmtTime(weather.sys.sunrise) },
              { icon:<Moon size={20} color="#5C6BC0"/>, label:"Sunset",  val:fmtTime(weather.sys.sunset)  },
              { icon:<Leaf size={20} color={C.sprout}/>,label:"Crop Risk",val: weather.main.humidity > 70 ? "High" : weather.main.humidity > 40 ? "Mod." : "Low" },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ textAlign:"center" }}>
                <div style={{ marginBottom:5 }}>{icon}</div>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.soil }}>{val}</p>
                <p style={{ margin:0, fontSize:10, color:"#aaa" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Farming advisory */}
          <div style={{ background:"#F1F8E9", border:`1px solid ${C.lime}`, borderRadius:15, padding:14, marginBottom:14 }}>
            <h3 style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:C.moss, display:"flex", alignItems:"center", gap:5 }}>
              <Leaf size={14}/> Farming Advisory
            </h3>
            <ul style={{ margin:0, padding:"0 0 0 15px", color:C.bark, fontSize:12, lineHeight:1.8 }}>
              {weather.main.humidity > 75 && <li>High humidity — inspect rice &amp; vegetables for fungal diseases.</li>}
              {weather.main.temp > 35      && <li>Heat stress — irrigate in early morning or after 6 PM.</li>}
              {weather.wind.speed > 10     && <li>Strong winds — avoid pesticide spraying today.</li>}
              {weather.main.temp < 15      && <li>Cold stress possible — cover seedlings overnight.</li>}
              {weather.main.humidity <= 75 && weather.main.temp <= 35 && weather.wind.speed <= 10 && weather.main.temp >= 15 &&
                <li>Conditions are favorable for most field operations today.</li>}
              <li>Best irrigation time: {weather.main.temp > 30 ? "5–7 AM or after 6 PM" : "Morning hours"}.</li>
            </ul>
          </div>

          {/* 5-day forecast */}
          <h3 style={{ fontSize:15, fontWeight:700, color:C.soil, margin:"0 0 10px", fontFamily:"Georgia, serif" }}>5-Day Forecast</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {forecast.slice(0, 5).map((day, i) => (
              <div key={i} style={{ background:"#fff", borderRadius:13, padding:"13px 15px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                <p style={{ margin:0, fontWeight:600, fontSize:13, color:C.soil, width:95 }}>{fmt(day.dt_txt)}</p>
                <span style={{ fontSize:22 }}>{WX_ICON[day.weather[0].main] || "🌤️"}</span>
                <p style={{ margin:0, fontSize:11, color:"#aaa", flex:1, textAlign:"center" }}>{day.weather[0].main}</p>
                <p style={{ margin:0, fontWeight:700, fontSize:15, color:C.soil }}>{Math.round(day.main.temp)}°C</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:48 }}>
          <CloudSun size={56} color="#ddd" style={{ marginBottom:14 }} />
          <p style={{ color:"#bbb", fontSize:14 }}>Search a city to see weather</p>
        </div>
      )}
    </div>
  );

  const CropsScreen = () => (
    <div style={{ padding:"18px 14px" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.soil, margin:"0 0 4px", fontFamily:"Georgia, serif" }}>My Crops</h2>
      <p style={{ color:"#aaa", fontSize:12, margin:"0 0 18px" }}>Advisory & growth stage tracker</p>

      {selCrop ? (
        <div>
          <button onClick={() => setSelCrop(null)} style={{ background:"none", border:"none", color:C.sprout, fontWeight:600, cursor:"pointer", marginBottom:14, display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
            ← Back to Crops
          </button>
          <div style={{ background:"#fff", borderRadius:20, padding:22, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
              <span style={{ fontSize:44 }}>{selCrop.icon}</span>
              <div>
                <h3 style={{ margin:"0 0 6px", fontSize:20, fontWeight:700, color:C.soil, fontFamily:"Georgia, serif" }}>{selCrop.crop}</h3>
                <span style={{ background:C.lime, color:C.moss, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{selCrop.stage}</span>
              </div>
              {selCrop.alert && <AlertTriangle size={20} color="#E65100" style={{ marginLeft:"auto" }} />}
            </div>
            <div style={{ background:C.mist, borderRadius:12, padding:14, marginBottom:14 }}>
              <p style={{ margin:0, fontSize:13, color:C.bark, lineHeight:1.7 }}>{selCrop.tip}</p>
            </div>
            <h4 style={{ fontSize:13, fontWeight:700, color:C.soil, margin:"0 0 10px" }}>Key Actions This Week</h4>
            {["Monitor soil moisture daily","Check for pests in early morning","Apply recommended fertilizer dose","Record observations in field diary"].map((a, i, arr) => (
              <div key={a} style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 0", borderBottom: i < arr.length-1 ? "1px solid #F5F5F5" : "none" }}>
                <CheckCircle size={15} color={C.sprout} />
                <p style={{ margin:0, fontSize:12, color:C.bark }}>{a}</p>
              </div>
            ))}
            <button
              onClick={() => { setTab("ai"); setInput(`Give me detailed advice for ${selCrop.crop} at ${selCrop.stage} stage`); }}
              style={{ width:"100%", background:`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`, color:"#fff", border:"none", borderRadius:12, padding:"13px", marginTop:14, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Bot size={15}/> Ask AI for Detailed Advice
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {CROP_TIPS.map((crop) => (
            <button key={crop.crop} onClick={() => setSelCrop(crop)} style={{ background:"#fff", border: crop.alert ? "1.5px solid #FFA726" : "1.5px solid transparent", borderRadius:16, padding:15, cursor:"pointer", textAlign:"left", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:13 }}>
              <span style={{ fontSize:34 }}>{crop.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <p style={{ margin:0, fontWeight:700, fontSize:14, color:C.soil, fontFamily:"Georgia, serif" }}>{crop.crop}</p>
                  {crop.alert && <AlertTriangle size={13} color="#E65100" />}
                </div>
                <span style={{ background: crop.alert ? "#FFF3CD" : "#F0FFF0", color: crop.alert ? "#E65100" : C.moss, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{crop.stage}</span>
                <p style={{ margin:"6px 0 0", fontSize:11, color:"#aaa", lineHeight:1.4 }}>{crop.tip.slice(0,62)}…</p>
              </div>
              <ChevronRight size={16} color="#ddd" />
            </button>
          ))}
          <button style={{ background:`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`, border:"none", borderRadius:16, padding:"15px", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Sprout size={16}/> Add New Crop
          </button>
        </div>
      )}
    </div>
  );

  const MarketScreen = () => (
    <div style={{ padding:"18px 14px" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.soil, margin:"0 0 4px", fontFamily:"Georgia, serif" }}>Mandi Prices</h2>
      <div style={{ display:"flex", alignItems:"center", gap:7, margin:"0 0 18px" }}>
        <div style={{ width:7, height:7, background:"#4CAF50", borderRadius:"50%" }} />
        <span style={{ color:"#4CAF50", fontSize:12, fontWeight:600 }}>Live · Updated today</span>
      </div>

      <div style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 18px rgba(0,0,0,0.07)", marginBottom:18 }}>
        <div style={{ background:C.soil, padding:"13px 15px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr" }}>
          {["Commodity","Price/Qtl","Change"].map((h) => (
            <p key={h} style={{ margin:0, color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:600 }}>{h}</p>
          ))}
        </div>
        {MARKET_PRICES.map((item, i) => (
          <div key={item.crop} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", padding:"14px 15px", borderBottom: i < MARKET_PRICES.length-1 ? "1px solid #F5F5F5" : "none", background: i%2===0 ? "#fff" : C.mist }}>
            <p style={{ margin:0, fontWeight:600, fontSize:13, color:C.soil }}>{item.crop}</p>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.soil }}>{item.price}</p>
            <p style={{ margin:0, fontSize:12, fontWeight:700, color: item.up ? "#2E7D32" : "#C62828" }}>{item.up?"▲":"▼"} {item.change}</p>
          </div>
        ))}
      </div>

      <div style={{ background:"#E8F5E9", border:`1px solid ${C.lime}`, borderRadius:15, padding:15 }}>
        <h3 style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:C.moss }}>💡 Market Insight</h3>
        <p style={{ margin:0, fontSize:12, color:C.bark, lineHeight:1.7 }}>
          Soybean prices are up 2.1% on strong export demand — consider holding stock if storage allows.
          Wheat is near MSP (₹2,275); sell directly to FCI for guaranteed returns.
        </p>
      </div>
    </div>
  );

  const AIScreen = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ padding:"14px 15px 12px", background:"#fff", borderBottom:"1px solid #F0F0F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, background:`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Sprout size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:C.soil, fontFamily:"Georgia, serif" }}>Farm-E AI</h2>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:6, height:6, background:"#4CAF50", borderRadius:"50%" }} />
            <span style={{ fontSize:11, color:"#4CAF50" }}>Online · Expert Farming Assistant</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.length === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:6 }}>
            <p style={{ margin:0, fontSize:11, color:"#bbb", textAlign:"center" }}>Suggested questions</p>
            {["How to treat rice blast disease?","Best fertilizer schedule for wheat?","When to irrigate cotton?","Govt schemes for farmers 2024"].map((q) => (
              <button key={q} onClick={() => setInput(q)} style={{ background:C.mist, border:`1px solid ${C.fog}`, borderRadius:10, padding:"10px 13px", cursor:"pointer", textAlign:"left", fontSize:12, color:C.bark }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: msg.sender==="user" ? "flex-end" : "flex-start" }}>
            {msg.sender === "ai" && (
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <div style={{ width:22, height:22, background:`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Sprout size={11} color="#fff" />
                </div>
                <span style={{ fontSize:10, color:"#bbb" }}>Farm-E AI</span>
              </div>
            )}
            <div style={{
              maxWidth:"83%", padding:"11px 15px",
              borderRadius: msg.sender==="user" ? "17px 17px 4px 17px" : "4px 17px 17px 17px",
              background: msg.sender==="user" ? `linear-gradient(135deg, ${C.leaf}, ${C.sprout})` : "#fff",
              color: msg.sender==="user" ? "#fff" : C.soil,
              boxShadow:"0 2px 8px rgba(0,0,0,0.07)", fontSize:13, lineHeight:1.65, whiteSpace:"pre-wrap"
            }}>{msg.text}</div>
            <span style={{ fontSize:9, color:"#ccc", marginTop:3 }}>
              {msg.time?.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
            </span>
          </div>
        ))}

        {chatLoading && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:22, height:22, background:`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sprout size={11} color="#fff" />
            </div>
            <div style={{ background:"#fff", borderRadius:"4px 17px 17px 17px", padding:"11px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map((j) => (
                  <div key={j} style={{ width:6, height:6, background:C.lime, borderRadius:"50%", animation:`bounce 1s ${j*0.15}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={msgEnd} />
      </div>

      {/* Input bar */}
      <div style={{ padding:"10px 13px 14px", background:"#fff", borderTop:"1px solid #F0F0F0" }}>
        <div style={{ display:"flex", gap:9, alignItems:"flex-end" }}>
          <div style={{ flex:1, background:C.fog, borderRadius:15, padding:"9px 13px" }}>
            <textarea
              rows={1} value={input} placeholder="Ask about crops, diseases, weather, schemes…"
              onChange={(e) => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,100)+"px"; }}
              onKeyDown={(e) => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); } }}
              style={{ width:"100%", border:"none", background:"none", outline:"none", fontSize:13, color:C.soil, resize:"none", lineHeight:1.5, fontFamily:"inherit", maxHeight:100 }}
            />
          </div>
          <button onClick={sendMessage} disabled={chatLoading || !input.trim()} style={{
            width:44, height:44, background: input.trim() ? `linear-gradient(135deg, ${C.leaf}, ${C.sprout})` : "#eee",
            border:"none", borderRadius:13, cursor: input.trim() ? "pointer" : "not-allowed",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.2s"
          }}>
            <Send size={17} color={input.trim() ? "#fff" : "#ccc"} />
          </button>
        </div>
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div style={{ padding:"18px 14px" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.soil, margin:"0 0 18px", fontFamily:"Georgia, serif" }}>
        {user ? "My Profile" : "Sign In"}
      </h2>

      {!user ? (
        <div>
          <div style={{ background:"#fff", borderRadius:20, padding:22, boxShadow:"0 4px 18px rgba(0,0,0,0.08)", marginBottom:16 }}>
            {/* Tab toggle */}
            <div style={{ display:"flex", gap:4, marginBottom:22, background:C.fog, borderRadius:11, padding:4 }}>
              {["login","signup"].map((m) => (
                <button key={m} onClick={() => setAuthMode(m)} style={{ flex:1, padding:"10px", border:"none", borderRadius:9, cursor:"pointer", background: authMode===m ? "#fff" : "transparent", color: authMode===m ? C.leaf : "#bbb", fontWeight:700, fontSize:13, boxShadow: authMode===m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition:"all 0.2s" }}>
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { type:"email",    icon:<Mail size={15} color="#bbb"/>,  val:email,    set:setEmail,    ph:"Email address" },
                { type:"password", icon:<Lock size={15} color="#bbb"/>,  val:password, set:setPassword, ph:"Password" },
              ].map(({ type, icon, val, set, ph }) => (
                <div key={type} style={{ display:"flex", alignItems:"center", gap:9, background:C.fog, borderRadius:12, padding:"3px 13px" }}>
                  {icon}
                  <input type={type} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} onKeyDown={(e) => e.key==="Enter" && handleAuth()}
                    style={{ flex:1, border:"none", background:"none", padding:"12px 3px", outline:"none", fontSize:13, color:C.soil }} />
                </div>
              ))}

              <button onClick={handleAuth} disabled={authLoading} style={{ background:`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`, color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {authLoading ? <RefreshCw size={15} style={{ animation:"spin 0.8s linear infinite" }} /> : (authMode==="login" ? "Log In" : "Create Account")}
              </button>
            </div>
          </div>

          <div style={{ background:"#F1F8E9", border:`1px solid ${C.lime}`, borderRadius:15, padding:15 }}>
            <h3 style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:C.moss }}>🌱 Why sign in?</h3>
            {["Save your crop preferences","Get personalised AI advice","Receive weather & pest alerts","Access government scheme updates"].map((b) => (
              <div key={b} style={{ display:"flex", gap:7, alignItems:"center", marginBottom:7 }}>
                <CheckCircle size={12} color={C.sprout} />
                <p style={{ margin:0, fontSize:12, color:C.bark }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ background:`linear-gradient(145deg, ${C.moss}, ${C.leaf})`, borderRadius:20, padding:22, marginBottom:14, textAlign:"center" }}>
            <div style={{ width:68, height:68, background:"rgba(255,255,255,0.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
              <User size={34} color="#fff" />
            </div>
            <p style={{ margin:0, fontSize:17, fontWeight:700, color:"#fff", fontFamily:"Georgia, serif" }}>{user.displayName || "Farmer"}</p>
            <p style={{ margin:"3px 0 0", fontSize:12, color:"rgba(255,255,255,0.75)" }}>{user.email}</p>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"5px 13px", marginTop:10 }}>
              <CheckCircle size={12} color={C.lime} />
              <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>Verified Account</span>
            </div>
          </div>

          {[
            { icon:<Bell size={17} color={C.leaf}/>,     label:"Notifications", sub:"Crop alerts & weather warnings" },
            { icon:<BookOpen size={17} color={C.leaf}/>, label:"Field Diary",    sub:"Your farming records" },
            { icon:<Calendar size={17} color={C.leaf}/>, label:"Crop Calendar",  sub:"Seasonal planning" },
          ].map(({ icon, label, sub }) => (
            <div key={label} style={{ background:"#fff", borderRadius:13, padding:"14px 15px", marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:13 }}>
              <div style={{ width:38, height:38, background:C.fog, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontWeight:600, fontSize:13, color:C.soil }}>{label}</p>
                <p style={{ margin:0, fontSize:11, color:"#bbb" }}>{sub}</p>
              </div>
              <ChevronRight size={15} color="#ddd" />
            </div>
          ))}

          <button onClick={() => signOut(auth)} style={{ width:"100%", background:"#FFF5F5", border:"1.5px solid #FFCDD2", color:"#C62828", borderRadius:13, padding:"13px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 }}>
            <LogOut size={15}/> Sign Out
          </button>
        </div>
      )}
    </div>
  );

  // ── Nav tabs ──────────────────────────────────────────────────
  const TABS = [
    { id:"home",    Icon:Home,       label:"Home"    },
    { id:"ai",      Icon:Bot,        label:"AI"      },
    { id:"weather", Icon:CloudSun,   label:"Weather" },
    { id:"crops",   Icon:Sprout,     label:"Crops"   },
    { id:"market",  Icon:TrendingUp, label:"Market"  },
  ];

  const renderScreen = () => {
    switch(tab) {
      case "ai":      return <AIScreen />;
      case "weather": return <WeatherScreen />;
      case "crops":   return <CropsScreen />;
      case "market":  return <MarketScreen />;
      case "profile": return <ProfileScreen />;
      default:        return <HomeScreen />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin:0; background:${C.mist}; font-family:-apple-system,'Segoe UI',sans-serif; }
        textarea { font-family:inherit; }
        ::-webkit-scrollbar { width:0; height:0; }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>

      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:C.mist, position:"relative" }}>

        {/* Header */}
        <header style={{ background:`linear-gradient(135deg, ${C.soil}, ${C.bark})`, padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:200, boxShadow:"0 2px 14px rgba(0,0,0,0.25)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, background:`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sprout size={19} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:17, fontWeight:700, color:"#fff", letterSpacing:0.3, fontFamily:"Georgia, serif" }}>Farm-E</h1>
              <p style={{ margin:0, fontSize:9, color:C.lime, letterSpacing:1.2, textTransform:"uppercase" }}>Smart Farming</p>
            </div>
          </div>
          <button onClick={() => setTab("profile")} style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:10, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            {user ? <CheckCircle size={17} color={C.lime} /> : <User size={17} color="rgba(255,255,255,0.75)" />}
          </button>
        </header>

        {/* Main */}
        <main style={{ paddingBottom:76, minHeight:"calc(100vh - 58px)" }}>
          {renderScreen()}
        </main>

        {/* Bottom nav */}
        <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"#fff", borderTop:"1px solid #EFEFEF", padding:"7px 0 10px", display:"flex", justifyContent:"space-around", zIndex:200, boxShadow:"0 -3px 18px rgba(0,0,0,0.07)" }}>
          {TABS.map(({ id, Icon, label }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"3px 8px", minWidth:50 }}>
                <div style={{ width: active?34:26, height: active?34:26, background: active?`linear-gradient(135deg, ${C.leaf}, ${C.sprout})`:"transparent", borderRadius: active?10:7, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  <Icon size={active?17:19} color={active?"#fff":"#bbb"} />
                </div>
                <span style={{ fontSize:9, color: active?C.leaf:"#ccc", fontWeight: active?700:400, transition:"color 0.2s" }}>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}