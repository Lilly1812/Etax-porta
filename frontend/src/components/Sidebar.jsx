import React from "react";
import { useCompany } from '../context/CompanyContext';
import { MdDashboard, MdMail, MdStorage, MdSearch, MdFileDownload, MdFolderOpen, MdLibraryBooks, MdBusiness, MdAccountBalance, MdSettings, MdChevronLeft, MdChevronRight } from "react-icons/md";
import logo from '../assets/logo.jpg'; // Import the logo

export default function Sidebar({ active, onSelect, onCollapse }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { selectedCompany } = useCompany();

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  // Define all menu items
  const menuItems = [
    
    { 
      id: 1,
      label: "Tổng quan", 
      icon: <MdDashboard size={22} />,
      alwaysShow: false
    },
    { 
      id: 2,
      label: "Tải tờ khai thuế", 
      icon: <MdFileDownload size={22} />,
      alwaysShow: false
    },
    { 
      id: 3,
      label: "Tra cứu nghĩa vụ kê khai", 
      icon: <MdSearch size={22} />,
      alwaysShow: false
    },
    { 
      id: 4,
      label: "Nghĩa vụ nộp thuế", 
      icon: <MdAccountBalance size={22} />,
      alwaysShow: false
    },
    { 
      id: 0,
      label: "Công ty", 
      icon: <MdBusiness size={22} />,
      alwaysShow: true // This item is always visible
    },
  ];

  // Filter menu items based on whether a company is selected
  const visibleMenuItems = menuItems.filter(item => 
    item.alwaysShow || selectedCompany
  );

  return (
    <div className={` bg-white text-[#1f1f1f] ${collapsed ? "w-18" : "w-60"} h-screen flex flex-col transition-all duration-300 shadow-lg overflow-hidden`}>
      <button 
        className="flex items-center justify-center p-4 pb-2 shrink-0"
        onClick={handleCollapse}
        title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
      >
        {!collapsed ? (
          <div className="w-full flex items-center justify-center gap-2 border-b-2 border-gray-300 pb-4">
            <img 
              src="/favicon.png" 
              alt="Logo" 
              className="h-8 w-8 object-cover rounded"
            />
            <img 
              src={logo} 
              alt="BizNext Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
        ) : (
          <img 
            src="/favicon.png" 
            alt="Logo" 
            className="h-8 w-8 object-cover rounded"
          />
        )}
      </button>

      <div className="flex-1 overflow-y-auto">
        {visibleMenuItems.map((item) => (
          <div
            key={item.id}
            className={`text-sm rounded-3xl m-2 px-4 py-3 cursor-pointer hover:bg-[#234e98] hover:text-white transition flex items-center gap-3 ${
              active === item.id ? "bg-[#e7eaee]" : ""
            }`}
            onClick={() => onSelect(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </div>

      {selectedCompany && (
        <div className="px-4">
          <div className="p-4 border-t-2 border-gray-300 text-sm">
            {!collapsed && <>Gói dịch vụ: <b>Advance</b></>}
          </div>
          <div className="p-4 pt-0 text-xs text-[#234e98]">
            {!collapsed && (
              <div className="flex flex-col gap-1">
                <div>{selectedCompany.name}</div>
                <div>MST: {selectedCompany.taxId}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 