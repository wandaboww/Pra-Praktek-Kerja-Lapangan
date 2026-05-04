
'use client';

import { Building2, ChevronDown, FileEdit, FilePlus, History, Home, Mail, Map, Menu, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPersuratanOpen, setIsPersuratanOpen] = useState(false);
  const pathname = usePathname();

  const mainMenus = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Data Perusahaan', icon: Building2, path: '/master/perusahaan' },
    { name: 'Data Siswa', icon: Users, path: '/master/siswa' },
    { name: 'Pemetaan', icon: Map, path: '/pemetaan' },
  ];

  const persuratanSubmenus = [
    { name: 'Buat Surat', icon: FilePlus, path: '/surat/buat' },
    { name: 'Riwayat Surat', icon: History, path: '/surat/riwayat' },
    { name: 'Template Surat', icon: FileEdit, path: '/pengaturan/template' },
  ];

  const handlePersuratanClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setIsPersuratanOpen(true);
    } else {
      setIsPersuratanOpen(!isPersuratanOpen);
    }
  };

  const isActive = (path: string) => pathname === path;
  const isPersuratanActive = persuratanSubmenus.some(sub => pathname === sub.path);

  return (
    <aside 
      className={`sidebar-container ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300 shrink-0 sticky top-0 h-screen overflow-hidden`}
    >
      <div className={`sidebar-header p-4 flex items-center h-20 ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-800`}>
        {!isCollapsed && (
          <div className="sidebar-logo-container overflow-hidden transition-all duration-300">
            <h1 className="sidebar-title text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-emerald-400 truncate">
              Surat PKL Pro
            </h1>
            <p className="sidebar-subtitle text-slate-400 text-xs mt-1 truncate">Sistem Magang</p>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-toggle-btn p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white shrink-0"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="sidebar-navigation flex-1 mt-6 overflow-y-auto overflow-x-hidden">
        <ul className="sidebar-menu-list space-y-2 px-3">
          {mainMenus.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <Link
                href={item.path}
                className={`sidebar-link flex items-center gap-3 py-3 rounded-lg transition-colors group ${
                  isCollapsed ? 'justify-center px-2' : 'px-4'
                } ${
                  isActive(item.path) 
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 rounded-l-none' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`sidebar-icon w-5 h-5 transition-colors shrink-0 ${
                  isActive(item.path) ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                {!isCollapsed && (
                  <span className="sidebar-link-text font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}

          {/* Persuratan Menu with Dropdown */}
          <li className="sidebar-menu-dropdown-container pt-2">
            <button
              onClick={handlePersuratanClick}
              className={`sidebar-dropdown-toggle w-full flex items-center justify-between py-3 rounded-lg transition-colors group ${
                isCollapsed ? 'justify-center px-2' : 'px-4'
              } ${
                isPersuratanActive && !isPersuratanOpen
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isCollapsed ? "Persuratan" : undefined}
            >
              <div className="sidebar-dropdown-title-group flex items-center gap-3">
                <Mail className={`sidebar-icon w-5 h-5 transition-colors shrink-0 ${
                  (isPersuratanOpen && !isCollapsed) || isPersuratanActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                {!isCollapsed && (
                  <span className={`sidebar-link-text font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isPersuratanOpen || isPersuratanActive ? 'text-white' : ''}`}>
                    Persuratan
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown className={`sidebar-dropdown-chevron w-4 h-4 text-slate-400 transition-transform duration-300 ${isPersuratanOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Submenus */}
            <ul className={`sidebar-submenu-list overflow-hidden transition-all duration-300 space-y-1 ${
              (isPersuratanOpen && !isCollapsed) || (isPersuratanActive && !isCollapsed) ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}>
              {persuratanSubmenus.map((sub) => (
                <li key={sub.path} className="sidebar-submenu-item">
                  <Link
                    href={sub.path}
                    className={`sidebar-submenu-link flex items-center gap-3 py-2.5 px-4 pl-11 rounded-lg transition-colors group ${
                      isActive(sub.path)
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <sub.icon className={`sidebar-submenu-icon w-4 h-4 transition-colors shrink-0 ${
                      isActive(sub.path) ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'
                    }`} />
                    <span className="sidebar-submenu-text font-medium text-sm whitespace-nowrap">
                      {sub.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer p-4 border-t border-slate-800 h-20 flex items-center">
        <div className={`sidebar-user-profile flex items-center gap-3 w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="sidebar-user-avatar w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-info overflow-hidden transition-all duration-300">
              <p className="sidebar-user-name text-sm font-medium truncate">Admin User</p>
              <p className="sidebar-user-role text-xs text-slate-400 truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
