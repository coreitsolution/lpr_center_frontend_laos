import { Gb, La } from "react-flags-select"
import "./nav.scss";
import { useCallback, useEffect, useState, useRef } from "react";
import MenuIcon from "./menu-icon/menuicon";
import { NavLink } from "react-router-dom";
import RiArrowDownSFill from "~icons/ri/arrow-down-s-fill";
import RiArrowUpSFill from "~icons/ri/arrow-up-s-fill";
import { useDispatch } from "react-redux"
import { AppDispatch } from "../app/store"
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
// import { useNavigate } from "react-router-dom";

// Context
import { useHamburger } from "../context/HamburgerContext";

// API
import {
  logout
} from "../features/auth/authSlice"

// Image Assets
import User from "../assets/icons/user.png"

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../config/runtimeConfig';

dayjs.extend(buddhistEra);

function Nav() {
  // const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { PROJECT_NAME, NAV_LOGO_BG_WHITE } = getUrls();

  // i18n
  const { i18n, t } = useTranslation();

  // State
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [_, setBarChartOpen] = useState(false);

  // Data
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [languageSelected, setLanguageSelect] = useState(i18n.language ?? "en");
  const [sidePosition, setSidePosition] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>("");
  const { isOpen, toggleMenu } = useHamburger();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs(new Date()).format(i18n.language === 'th' ? 'BBBB-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss'))
    }, 1000)

    return () => clearInterval(interval)
  }, [dispatch])

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    setLanguageSelect(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
  }

  const handleSlideUp = useCallback(() => {
    setSidePosition((prev: number) => Math.min(prev + 68, 0));
  }, []);

  const handleSlideDown = () => {
    setSidePosition((prev: number) => Math.max(prev - 68, -100));
  };

  const navItems = [
    { path: "/center/real-time-monitor", icon: "checking", label: "real-time" },
    { path: "/center/search-plate-with-condition", icon: "search-condition", label: "search-condition" },
    // {
    //   path: "/center/search-plate-before-after",
    //   icon: "gps",
    //   label: "gps",
    // },
    // {
    //   path: "/center/search-suspect-person",
    //   icon: "detect-person",
    //   label: "search-suspect-person",
    // },
    {
      path: "/center/special-plate",
      icon: "special-plate",
      label: "special-plate",
    },
    // {
    //   path: "/center/suspect-people",
    //   icon: "order-detect-person",
    //   label: "special-suspect-person",
    // },
    { path: "/center/manage-user", icon: "add-user", label: "manage-user" },
    { path: "/center/setting", icon: "settings", label: "settings" },
    { path: "/center/manage-checkpoint-cameras", icon: "manage-checkpoint-cameras", label: "manage-checkpoint-cameras" },
    // { icon: "bar-chart", 
    //   label: "bar-chart",
    //   hasSubmenu: true,
    //   subPath: [
    //     { path: "/center/chart/log", icon: "log", label: "log" },
    //     { path: "/center/chart/graph", icon: "graph", label: "graph" },
    //     { path: "/center/chart/end-user", icon: "user-cross", label: "user-cross" },
    //     { path: "/center/chart/camera-installation-points", icon: "camera-location", label: "camera-location" },
    //     { path: "/center/chart/camera-status", icon: "search-keyword", label: "search-keyword" },
    //   ]
    // },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        imgRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !imgRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setDropdownVisible(true)
  }

  // const handleProfileClick = (e: React.MouseEvent) => {
  //   e.stopPropagation()
  //   setDropdownVisible(false)
  //   navigate(`/center/user-info`, { state: { allowed: true } });
  // };
  
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDropdownVisible(false)
    dispatch(logout())
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 min-w-[1300px]">
      <div className="flex justify-between items-center bg-black">
        {/* Status Section */}
        <div 
          className="flex-1 bg-[#2B9BED] text-white"
          style={{ clipPath: "polygon(0% 0%, 98.3% 0%, 95% 100%, 0% 100%)" }}
        >
          <div 
            className="flex pt-[6px] justify-center bg-black mb-[3px]" 
            style={{ clipPath: "polygon(0% 0%, 98.1% 0%, 94.9% 100%, 0% 100%)" }}
          >
            <div className="flex w-full">
              <div className="flex items-center justify-center space-x-1 ml-[10px]">
                {/* Hamburger Icon */}
                <div 
                  onClick={toggleMenu}
                  className="hamburger-menu"
                >
                  <button className="hamburger-icon mx-5">
                    <div className={`line ${isOpen ? "open" : ""}`} />
                    <div className={`line ${isOpen ? "open" : ""}`} />
                    <div className={`line ${isOpen ? "open" : ""}`} />
                  </button>
                </div>
                <div className={`flex justify-center items-center ${NAV_LOGO_BG_WHITE ? "bg-white" : ""}`}>
                  <img src="/project-logo/sm-logo.png" alt="Logo" className="w-[80px] h-[55px]" />
                </div>
                <span className="text-[25px]">{PROJECT_NAME}</span>
              </div>
            </div>
            <div className="flex w-full h-[50px]">
              <div className="flex flex-cols mb-[4px] items-center justify-center">
                <p className="text-[15px] h-[25px] text-cyan-300">
                  {currentTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-5 mr-[50px] text-white">
          <p className="text-[20px] w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-center">User</p>
          <div className="relative">
            <div className="bg-gradient-to-b from-[#0CFCEE] to-[#0B23FC] p-[2px] rounded-full">
              <img 
                ref={imgRef}
                src={User} 
                alt="User" 
                className="w-11 h-11 bg-black rounded-full" 
                onClick={handleButtonClick}
              />
            </div>
            {
              dropdownVisible && (
                <div
                  className="flex items-center justify-center absolute right-0 mt-1 w-[130px] bg-gradient-to-b from-[#0CFCEE] to-[#0B23FC] rounded-[5px] p-[2px] shadow-lg z-51"
                  ref={dropdownRef}
                >
                  <div className="bg-black w-full h-full rounded-[5px]">
                    <ul className="py-1">
                      {/* <li
                        className={`px-4 py-1 hover:bg-[#CBD3D9] hover:text-black cursor-pointer text-sm text-white text-center`}
                        onClick={handleProfileClick}
                      >
                        {t('menu.profile')}
                      </li>
                      <div className="border-b-[1px] border-[#2B9BED] mx-2"></div> */}
                      <li
                        className={`px-4 py-1 hover:bg-[#CBD3D9] hover:text-black cursor-pointer text-sm text-white text-center`}
                        onClick={handleLogoutClick}
                      >
                        {t('menu.logout')}
                      </li>
                    </ul>
                  </div>
                </div>
              )
            }
          </div>
          <div className="grid grid-cols-[20px_auto] border border-white rounded-[5px] py-[3px] px-[12px]">
            <span className="mr-[5px]">
              {
                (() => {
                  switch (languageSelected) {
                    case 'en':
                      return <Gb />;
                    case 'la':
                      return <La />;
                    default:
                      return <Gb />;
                  }
                })()
              }
            </span>
            <select 
              className="bg-transparent text-[12px] text-center focus:outline-none focus:ring-0" 
              value={languageSelected} 
              onChange={handleLanguageChange}
            >
              <option className="text-black" value="en">English</option>
              <option className="text-black" value="la">Lao</option>
            </select>
          </div>
        </div>
      </div>

      {/* side nav */}
      <div className={`fixed h-[70vh] w-[80px] bg-black mt-[2rem] border-2 border-[#2B9BED] rounded-xl px-2 py-12 transition-transform duration-300
        ${isOpen ? "translate-x-0 translate-y-1 left-3" : "-translate-x-full translate-y-1 left-0"}
        `}>
        <div className="absolute top-3 left-0 w-full flex justify-center">
          {sidePosition !== 0 && (
            <RiArrowUpSFill
              className="text-white cursor-pointer w-[2.5em] h-[2.5em]"
              onClick={handleSlideUp}
            />
          )}
        </div>
        <div className="overflow-hidden h-[58vh]">
          <div
            style={{ transform: `translateY(${sidePosition}px)` }}
            className="flex flex-col gap-2 transition-transform duration-300 ease-out"
          >
            {/* {navItems.map((item, index) => (
              <div key={index}>
                {item.label === "bar-chart" ? (
                  <div className="flex flex-col gap-2">
                    <div onClick={() => setBarChartOpen((prev) => !prev)}>
                      <MenuIcon
                        iconUrl={`/icons/${item.icon}.png`}
                        menuName={item.label}
                        isActive={barChartOpen}
                        isSubMenu={false}
                      />
                    </div>

                    {barChartOpen && (
                      <>
                        <div className="w-full h-[3px] bg-[#2B9BED]" />
                        <div className="flex flex-col gap-2">
                          {item.subPath?.map((subItem, subIndex) => (
                            <NavLink 
                              key={subIndex} 
                              to={subItem.path ?? "#"}
                            >
                              {({ isActive }) => {
                                if (isActive) {
                                  setBarChartOpen(true);
                                }
                                return (
                                  <MenuIcon
                                    iconUrl={ `/icons/${subItem.icon}${isActive ? "-active" : ""}.png`}
                                    menuName={subItem.label}
                                    isActive={isActive}
                                    isSubMenu={true}
                                  />
                                );
                              }}
                            </NavLink>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <NavLink 
                    key={index} 
                    to={item.path ?? "#"}
                    onClick={() => {
                      setBarChartOpen(false);
                    }}
                  >
                    {({ isActive }) => {
                      {
                        const isInBarChartSubPath = barChartOpen && 
                          item.subPath?.some(subItem => 
                            window.location.pathname === subItem.path
                          );
                        
                        return (
                          <div onClick={() => {
                            setBarChartOpen(false);
                          }}>
                            <MenuIcon
                              iconUrl={`/icons/${item.icon}${isActive ? "-active" : ""}.png`}
                              menuName={item.label}
                              isActive={isActive && !isInBarChartSubPath}
                              isSubMenu={false}
                            />
                          </div>
                        );
                      }
                    }}
                  </NavLink>
                )}
              </div>
            ))} */}
            {navItems.map((item, index) => (
              <div key={index}>
                <NavLink 
                  key={index} 
                  to={item.path ?? "#"}
                >
                  {({ isActive }) => {
                    {
                      return (
                        <div onClick={() => {
                          setBarChartOpen(false);
                        }}>
                          <MenuIcon
                            iconUrl={`/icons/${item.icon}${isActive ? "-active" : ""}.png`}
                            menuName={item.label}
                            isActive={isActive}
                            isSubMenu={false}
                          />
                        </div>
                      );
                    }
                  }}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 pb-3 w-full flex justify-center bg-black rounded-b-[10px]">
          {/* {sidePosition !== -400 && (
            <RiArrowDownSFill
              className="text-white cursor-pointer w-[2.5em] h-[2.5em]"
              onClick={handleSlideDown}
            />
          )} */}
          {sidePosition !== -100 && (
            <RiArrowDownSFill
              className="text-white cursor-pointer w-[2.5em] h-[2.5em]"
              onClick={handleSlideDown}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
