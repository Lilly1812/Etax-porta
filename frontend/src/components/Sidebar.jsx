import React from "react";
import { MdDashboard, MdMail, MdStorage, MdSearch, MdFileDownload, MdFolderOpen, MdLibraryBooks, MdBusiness, MdAccountBalance, MdSettings, MdChevronLeft, MdChevronRight } from "react-icons/md";

const menuItems = [
  { label: "Tổng quan", icon: <MdDashboard size={22} /> },
  { label: "Tải tờ khai thuế", icon: <MdFileDownload size={22} /> },
];

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }

  toggleCollapse = () => {
    this.setState((prev) => ({ collapsed: !prev.collapsed }));
  };

  render() {
    const { active, onSelect } = this.props;
    const { collapsed } = this.state;
    return (
      <div className={`bg-blue-900 text-white ${collapsed ? "w-20" : "w-60"} min-h-screen flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between p-6 border-b border-blue-800">
          {!collapsed && <span className="font-bold text-xl">GAM INVOICE</span>}
          <button
            className="text-white focus:outline-none"
            onClick={this.toggleCollapse}
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {collapsed ? <MdChevronRight size={24} /> : <MdChevronLeft size={24} />}
          </button>
        </div>
        <div className="flex-1">
          {menuItems.map((item, idx) => (
            <div
              key={item.label}
              className={`px-6 py-3 cursor-pointer hover:bg-blue-800 transition flex items-center gap-3 ${active === idx ? "bg-blue-800" : ""}`}
              onClick={() => onSelect(idx)}
              title={collapsed ? item.label : undefined}
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-blue-800 text-sm">
          {!collapsed && <>Gói dịch vụ: <b>Advance</b></>}
        </div>
        <div className="p-4 text-xs text-blue-200">{!collapsed && "MinhBT11"}</div>
      </div>
    );
  }
} 