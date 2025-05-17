import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSearch, 
  FiBell, 
  FiSettings, 
  FiGlobe, 
  FiChevronDown,
  FiUser,
  FiDollarSign,
  FiLock,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications] = useState(3); // Example notification count
  const { handleLogout } = useAuth();

  return (
    <header className="bg-white shadow-lg ">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tìm kiếm..."
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Button */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <FiGlobe className="h-5 w-5" />
            </button>

            {/* Notification Button */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full relative">
              <FiBell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {notifications}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <FiSettings className="h-5 w-5" />
            </button>

            {/* Avatar & Name Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                
                <div className="flex items-center">
                  <div className="text-sm text-right">
                    <p className="text-gray-900 font-medium">MinhBT11</p>
                    <p className="text-gray-500 text-xs">buthiminh2508@gmail.com</p>
                  </div>
                  <FiChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    M
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 w-58 px-4 shadow-lg py-1 bg-white z-50 mt-3">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-300">
                    Bạn có thể tạo 3 công ty
                  </div>
                  
                  <a href="#" className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <FiUser className="mr-3 h-4 w-4" />
                    Xác thực tài khoản
                  </a>
                  
                  <a href="#" className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <FiUser className="mr-3 h-4 w-4" />
                    Thông tin tài khoản
                  </a>
                  
                  <a href="#" className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <FiLock className="mr-3 h-4 w-4" />
                    Đổi mật khẩu
                  </a>
                  
                  <a href="#" className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <FiDollarSign className="mr-3 h-4 w-4" />
                    Thu nhập của bạn
                  </a>
                  
                  <div className="border-t border-gray-300"></div>
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <FiLogOut className="mr-3 h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 