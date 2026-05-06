import { Link } from "react-router-dom";

export default function Footer() {
  const quickLinks = [
    { to: "/", label: "首页" },
    { to: "/china", label: "中国探月" },
    { to: "/usa", label: "美国探月" },
    { to: "/history", label: "奔月简史" },
  ];

  return (
    <footer className="border-t border-slate-800/50 py-12 mt-16 bg-space-900/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 group mb-3">
              <span className="text-2xl">🌕</span>
              <span className="text-xl font-bold tracking-widest text-white group-hover:text-moon-100 transition-colors">
                探月
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              探索人类探月的伟大历程，从阿波罗到嫦娥，见证人类航天史上的辉煌成就。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">快速导航</h3>
            <ul className="space-y-2">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    → {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">联系我们</h3>
            <div className="space-y-3">
              <a
                href="mailto:haimati@haimati.ai"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                <span>✉️</span>
                haimati@haimati.ai
              </a>
              <a
                href="https://github.com/haimatiai/tanyue"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                开源仓库
              </a>
            </div>

            {/* Tech stack badges */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">React</span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Three.js</span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Tailwind</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>© 2025 探月 · 保留所有权利</span>
          <span>数据来源：公开航天资料 · 仅供学习参考</span>
        </div>
      </div>
    </footer>
  );
}
