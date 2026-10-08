import logo from '../../assets/logo.png';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export default function Sidebar({ children, bottomItems, isMobileOpen, onCloseMobile }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen transition-all duration-300 ${
          expanded ? 'w-64' : 'w-20'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className="h-full flex flex-col bg-floral-white-100 border-r border-carbon-black-400/20 shadow-sm overflow-hidden">
          <div
            className={`p-4 pb-2 flex items-center font-poppins text-sm h-16 flex-shrink-0 ${
              expanded ? 'justify-between' : 'justify-center'
            }`}
          >
            <img
              src={logo}
              alt="Logo"
              className={`overflow-hidden transition-all ${
                expanded ? 'w-9' : 'w-0'
              }`}
            />

            <p
              className={`overflow-hidden font-bold transition-all whitespace-nowrap text-carbon-black-100 ${
                expanded ? 'w-40 ml-2' : 'w-0'
              }`}
            >
              Smart Campus
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded((curr) => !curr)}
                className="hidden md:flex p-1.5 rounded-lg hover:bg-yellow-300 transition-all w-9 h-9 items-center justify-center flex-shrink-0 cursor-pointer text-carbon-black-100"
                title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {expanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>

              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg hover:bg-yellow-300 transition-all w-9 h-9 flex items-center justify-center flex-shrink-0 text-carbon-black-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <SidebarContext.Provider value={{ expanded, onCloseMobile }}>
            <ul className="flex-1 min-h-0 p-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {children}
            </ul>

            {bottomItems && (
              <div className="flex-shrink-0 border-t border-carbon-black-400/20">
                <ul className="p-3 flex flex-col gap-1">
                  {bottomItems}
                </ul>
              </div>
            )}
          </SidebarContext.Provider>

          <div
            className={`border-t border-carbon-black-400/20 flex p-3 items-center overflow-hidden h-16 flex-shrink-0 ${
              expanded ? 'justify-start' : 'justify-center'
            }`}
          >
            <img
              src={logo}
              alt="Logo"
              className="w-9 min-w-[36px] flex-shrink-0"
            />

            <div
              className={`flex justify-between items-center font-poppins text-xs font-semibold text-carbon-black-600 transition-all overflow-hidden ${
                expanded
                  ? 'w-40 ml-3 opacity-100'
                  : 'w-0 opacity-0 pointer-events-none'
              }`}
            >
              <p className="whitespace-nowrap">Portal v1.1</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({ text, icon, active, alert, to, onClick }) {
  const { expanded, onCloseMobile } = useContext(SidebarContext);
  const location = useLocation();

  const isCurrent = active !== undefined ? active : (to && location.pathname === to);

  const handleClick = (e) => {
    if (onCloseMobile) onCloseMobile();
    if (onClick) onClick(e);
  };

  const itemContent = (
    <li
      onClick={handleClick}
      className={`relative flex items-center rounded-xl cursor-pointer font-poppins text-sm transition-all group flex-shrink-0 ${
        isCurrent
          ? 'bg-yellow-300 text-black font-semibold shadow-xs'
          : 'text-carbon-black-600 hover:bg-yellow-100 hover:text-black'
      } ${
        expanded
          ? 'justify-start gap-3 px-3 py-2 w-full'
          : 'justify-center p-2 mx-auto w-12 h-12'
      }`}
    >
      <div className="flex items-center justify-center min-w-[24px] min-h-[24px] flex-shrink-0">
        {icon}
      </div>

      <span
        className={`overflow-hidden transition-all whitespace-nowrap ${
          expanded
            ? 'w-40 opacity-100'
            : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        {text}
      </span>

      {alert && (
        <span
          className={`absolute rounded-full bg-red-500 ${
            expanded ? 'right-3 w-2 h-2' : 'top-2.5 right-2.5 w-2 h-2'
          }`}
        />
      )}

      {!expanded && (
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-carbon-black-100 text-yellow-300 text-xs opacity-0 -translate-x-3 transition-all group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap z-50 pointer-events-none shadow-md">
          {text}
        </div>
      )}
    </li>
  );

  if (to) {
    return <Link to={to} className="block w-full">{itemContent}</Link>;
  }

  return itemContent;
}