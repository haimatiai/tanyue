import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "首页" },
  { to: "/usa", label: "美国探月" },
  { to: "/china", label: "中国探月" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ background: "linear-gradient(to bottom, rgba(2,4,8,0.95) 0%, transparent 100%)" }}>
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl">🌕</span>
        <span className="text-xl font-bold tracking-widest text-white group-hover:text-moon-100 transition-colors">
          探月
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map(({ to, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
