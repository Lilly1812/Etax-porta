import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";

const currentYear = new Date().getFullYear();

export default function CompanyFormEdit({ isOpen, onClose, onSubmit, company }) {
  const [form, setForm] = useState({
    taxId: "",
    companystartdate: "",
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    periods: [],
  });
  const [newPeriod, setNewPeriod] = useState({
    type: "theo_nam",
    startYear: "",
    endYear: "",
  });

  // Khi prop company thay đổi, cập nhật lại form
  useEffect(() => {
    if (company) {
      setForm({
        taxId: company.taxId || "",
        companystartdate: company.companystartdate
          ? company.companystartdate.slice(0, 10)
          : "",
        name: company.name || "",
        address: company.address || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        periods: company.periods || [],
      });
    }
  }, [company, isOpen]);

  const addPeriod = () => {
    const start = parseInt(newPeriod.startYear);
    const end = parseInt(newPeriod.endYear);
    const companyStartYear = parseInt(form.companystartdate);

    if (!form.companystartdate) {
      alert("Vui lòng nhập thời gian thành lập trước");
      return;
    }

    if (isNaN(start) || isNaN(end) || start > end) {
      alert("Năm không hợp lệ.");
      return;
    }

    if (!newPeriod.startYear || !newPeriod.endYear) {
      alert("Vui lòng nhập đầy đủ năm bắt đầu và năm kết thúc.");
      return;
    }

    if (start < companyStartYear || end > currentYear) {
      alert(
        `Thời gian kê khai phải nằm trong khoảng từ năm thành lập (${companyStartYear}) đến năm hiện tại (${currentYear}).`
      );
      return;
    }

    const updated = [];

    form.periods.forEach((period) => {
      if (period.endYear < start || period.startYear > end) {
        updated.push(period);
      } else {
        if (period.startYear < start) {
          updated.push({
            startYear: period.startYear,
            endYear: start - 1,
            type: period.type,
          });
        }
        if (period.endYear > end) {
          updated.push({
            startYear: end + 1,
            endYear: period.endYear,
            type: period.type,
          });
        }
      }
    });

    updated.push({
      startYear: start,
      endYear: end,
      type: newPeriod.type,
    });

    updated.sort((a, b) => a.startYear - b.startYear);

    setForm((prev) => ({
      ...prev,
      periods: updated,
    }));
    setNewPeriod({ type: "theo_nam", startYear: "", endYear: "" });
  };

  const handleEditPeriod = (period) => {
    setNewPeriod({
      startYear: period.startYear.toString(),
      endYear: period.endYear.toString(),
      type: period.type,
    });

    setForm((prev) => ({
      ...prev,
      periods: prev.periods.filter(
        (p) =>
          !(
            p.startYear === period.startYear &&
            p.endYear === period.endYear &&
            p.type === period.type
          )
      ),
    }));
  };

  const handleDeletePeriod = (period) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xoá khoảng thời gian này không?")
    ) {
      setForm((prev) => ({
        ...prev,
        periods: prev.periods.filter(
          (p) =>
            !(
              p.startYear === period.startYear &&
              p.endYear === period.endYear &&
              p.type === period.type
            )
        ),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.taxId ||
      !form.name ||
      !form.address ||
      !form.periods ||
      !form.companystartdate
    ) {
      alert("Vui lòng nhập đầy đủ thông tin công ty.");
      return;
    }

    onSubmit(form);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "visible" : "invisible"}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-30" : "opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Sliding Sheet */}
      <div
        className={`absolute top-0 right-0 h-full w-[640px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 mx-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold">
            {company ? "Sửa công ty" : "Thêm công ty mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 pr-0 hover:bg-gray-100 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 ">
          <div className="flex-grow space-y-4 px-2 pb-4 ">
            <div className="flex w-full">
              <div className="w-2/3 pr-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã số thuế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Nhập mã số thuế"
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian thành lập <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.companystartdate}
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    const year = new Date(dateStr).getFullYear();
                    setForm({ ...form, companystartdate: dateStr });
                    setNewPeriod({ ...newPeriod, startYear: year });
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  min="1900-01-01"
                  max={`${currentYear}-12-31`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập tên công ty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="flex w-full">
              <div className="pr-4 w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="w-2/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Nhập website"
                />
              </div>
            </div>

            {/* Kỳ kê khai */}
            <div className="flex w-full items-end">
              <div className="w-4/12">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại kỳ kê khai <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPeriod.type}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, type: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="theo_nam">Theo năm</option>
                  <option value="theo_quy">Theo quý</option>
                  <option value="theo_thang">Theo tháng</option>
                </select>
              </div>

              <div className="w-1/4 ml-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={newPeriod.startYear}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, startYear: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="w-1/4 ml-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={newPeriod.endYear}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, endYear: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <button
                type="button"
                onClick={addPeriod}
                className="bg-green-500 text-white px-3 py-2 rounded ml-4 hover:bg-green-600"
              >
                Thêm
              </button>
            </div>

            {/* Hiển thị các giai đoạn kê khai */}
            <div className="mt-4 border border-gray-300 rounded overflow-y-scroll h-42">
              <table className="min-w-full text-sm text-left table-auto">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Từ năm
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Đến năm
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Loại kê khai
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {form.periods.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="px-4 py-2">{p.startYear}</td>
                      <td className="px-4 py-2">{p.endYear}</td>
                      <td className="px-4 py-2">
                        {p.type === "theo_nam"
                          ? "Theo năm"
                          : p.type === "theo_quy"
                          ? "Theo quý"
                          : "Theo tháng"}
                      </td>
                      <td className="px-4 py-2 flex gap-4">
                        <button
                          onClick={() => handleEditPeriod(p)}
                          className="text-gray-400 hover:text-black cursor-pointer transition-colors duration-300"
                        >
                          <MdOutlineEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeletePeriod(p)}
                          className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-300"
                        >
                          <MdDeleteOutline size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer with buttons */}
          <div className=" p-2">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}