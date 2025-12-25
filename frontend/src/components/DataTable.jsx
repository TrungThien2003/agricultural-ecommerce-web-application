import React from "react";

export default function DataTable({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  actions,
}) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow p-4 text-gray-500 text-center">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-green-100 text-gray-800">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || actions) && (
              <th className="px-4 py-3">Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row._id}
              className="border-t hover:bg-gray-50 transition duration-100"
            >
              {columns.map((col) => {
                const raw = row[col.key];
                const value =
                  typeof raw === "object" && !col.render
                    ? JSON.stringify(raw)
                    : raw;

                return (
                  <td key={col.key} className="px-4 py-2 align-top">
                    {col.render ? col.render(raw, row) : value}
                  </td>
                );
              })}

              {(onEdit || onDelete || actions) && (
                <td className="px-4 py-2 flex gap-3 text-right">
                  {actions && actions(row)}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
