import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LanguageSelector from '../LanguageSelector/LanguageSelector'
import { HiMenuAlt2 } from "react-icons/hi";
import fish_img from '../../assets/fish_img.png'
import fruits_img from '../../assets/fruits_img.png'
import cooking_img from '../../assets/cooking_img.png'
import biscuits_img from '../../assets/biscuits_img.png'
import household_img from '../../assets/household_img.png'
import pet_care_img from '../../assets/pet_care_img.png'
import milk_img from '../../assets/milk_img.png'
import drink_img from '../../assets/drink_img.png'

import {
  MdOutlineArrowDropDown,
  MdShoppingCart,
  MdContactSupport,
  MdPolicy,
  MdQuestionAnswer,
  MdSecurity,
  MdInfo,
  MdWbSunny,
} from "react-icons/md";
import MobileMenu from '../MobileMenu/MobileMenu';
const Navbar = ({ category }) => {
  const [showCategory, setShowCategory] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const dropdownRef = useRef(null);
  const dropdownRefPage = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const selectedSubcategory = queryParams.get('subcategory');
  const navigate = useNavigate()


  const toggleSubmenu = (label) => {
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCategory(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRefPage.current && !dropdownRefPage.current.contains(e.target)) {
        setIsOpen(false);
        // setActiveSubmenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const menuItems = [
    {
      label: "Fish & Meat",
      icon: fish_img,
      submenu: ["Fish", "Meat"],
    },
    {
      label: "Fruits & Vegetables",
      icon: fruits_img,
      submenu: ["Fruits", "Vegetables"],
    },
    {
      label: "Cooking Essentials",
      icon: cooking_img,
      submenu: ["Flour", "Oil"],
    },
    {
      label: "Biscuits & Cakes",
      icon: biscuits_img,
      submenu: ["Biscuits", "Cakes"],
    },
    {
      label: "Household Tools",
      icon: household_img,
      submenu: ["Water Filter", "Cleaner Tools"],
    },
    {
      label: "Pet Care",
      icon: pet_care_img,
      submenu: ["Dog Care", "Cat Care"],
    },
    {
      label: "Milks & Dairy",
      icon: milk_img,
      submenu: ["Butter & Ghee", "Ice Cream"],
    },
    {
      label: "Drinks",
      icon: drink_img,
      submenu: ["Tea", "Water", "Juice", "Coffee", "Energy Drinks"],
    },
  ];


  const pagesMenu = [
   
    { label: "About Us", icon: <MdInfo />, link: "/about" },
    { label: "Contact Us", icon: <MdContactSupport />, link: "/contact" },
    { label: "Weather", icon: <MdWbSunny />, link: "/weather" },
    { label: "FAQ", icon: <MdQuestionAnswer />, link: "/faq" },
    { label: "Privacy Policy", icon: <MdPolicy />, link: "/privacy-policy" },
    { label: "Terms & Conditions", icon: <MdSecurity />, link: "/terms-condition" },
  ];
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop) {
        // scrolling down
        setIsSticky(true);
      } else {
        // scrolling up
        setIsSticky(false);
      }

      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);


  return (
    <div
      className={`bg-white border-b p-2 ${isSticky ? "fixed top-18  w-full shadow-md z-5" : ""}`}
      style={{ border: "1px solid #e5e7eb" }}
    >
      <div className='container'>
        <div className='row gy-4 justify-center'>
          <div className='col-lg-6 '>
            <div className='left_list'>
              <ul className="flex nav_left gap-10 items-center mt-2 relative">
                <li className="relative" ref={dropdownRef}>

                  <button
                    onClick={() => {
                      setShowCategory(!showCategory);

                      setActiveSubmenu(null); // Reset submenu when closing main
                    }}
                    className="flex items-center gap-1"
                    style={{ color: "#707070" }}
                  >
                    Categories <MdOutlineArrowDropDown />
                  </button>

                  {/* Dropdown with fixed height + scroll */}
                  {showCategory && (
                    <ul className="absolute w-[260px] z-500 bg-white shadow top-11 left-0 p-3 rounded max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {menuItems.map((item, index) => (
                        <li key={index} className="mb-1">
                          <div
                            className="flex justify-between items-center cursor-pointer py-2 hover:bg-gray-100 rounded px-2"
                            onClick={() => { toggleSubmenu(item.label) }}
                          >
                            <span className="flex items-center gap-2 text-sm text-slate-700">
                              <img src={item.icon} alt="icon" className="w-5 h-5" />
                              {item.label}
                            </span>
                            <MdOutlineArrowDropDown
                              className={`transition-transform duration-300 ${activeSubmenu === item.label ? "rotate-180" : ""
                                }`}
                            />
                          </div>

                          {/* Submenu styled */}
                          <ul
                            className={`bg-gray-50 ml-4 mt-1 rounded px-3 transition-all duration-300 overflow-hidden ${activeSubmenu === item.label ? "max-h-40 py-2" : "max-h-0"
                              }`}
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <li
                                key={subIndex}
                                onClick={() => {
                                  navigate(
                                    `/search?category=${encodeURIComponent(item.label)}&subcategory=${encodeURIComponent(subItem)}`
                                  );
                                   setShowCategory(false);
                                }}
                                className={`py-1 text-sm px-2 cursor-pointer ${selectedSubcategory === subItem ? "text-gray-600 font-medium" : "text-green-600 hover:text-blue-500"
                                  }`}
                              >
                                <Link to="#" className="block">
                                  {subItem}
                                </Link>
                              </li>

                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Other links */}
                <li>
                  <Link to="/about" className="hover:text-blue-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-blue-500">
                    Contact Us
                  </Link>
                </li>
                <li className="relative" ref={dropdownRefPage}>
                  <button   
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 px-3 py-2 rounded-md hover:text-blue-600 transition duration-200"
                    style={{ color: "#707070" }}
                  >
                    Pages <MdOutlineArrowDropDown size={18} />
                  </button>

                  {isOpen && (
                    <ul className="absolute left-0 top-full mt-2 w-64 bg-white shadow-xl border border-gray-200 rounded-md z-50 overflow-hidden">
                      {pagesMenu.map((item, index) => (
                        <li key={index}>
                          <Link
                            to={item.link}
                             onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                          >
                            <span className="text-green-600 text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

              </ul>
            </div>
          </div>
          <div className='col-lg-6 right_col_nav flex justify-between'>
            <button className='text-end flex justify-end text-green-600 menu_icon' onClick={() => setMobileOpen(true)} ><HiMenuAlt2 size={27} /></button>
            <div className='flex nav_left items-center justify-end gap-4 Right_list'>
              <LanguageSelector />
              <ul className='left_links flex items-center justify-end gap-4'>
                <li><Link to={'/Privacy-policy'}>Privacy Policy</Link></li>
                <li><Link to={'/terms-condition'}>Terms & Conditions</Link></li>
              </ul>

            </div>
            <div className='languageselector'>
              <LanguageSelector />
            </div>
          </div>

        </div>
      </div>
      <MobileMenu isOpen={mobileOpen} setIsOpen={setMobileOpen} />
    </div>
  )
}

export default Navbar
