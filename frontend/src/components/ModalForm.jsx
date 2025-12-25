import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ModalForm({
  isOpen = true,
  size = "2xl",
  hideFooter = false,
  isSaving = false,
  showSaveButton = true,
  saveText = "Lưu",
  title,
  onClose,
  onSave,
  fields = [],
  defaultValues = {},
  children,
}) {
  const [formData, setFormData] = useState(defaultValues);
  const [previewUrls, setPreviewUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      setFormData(defaultValues);
      if (defaultValues.images) {
        setPreviewUrls({ images: defaultValues.images });
      }
    }
  }, [defaultValues]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const uploadToCloudinary = async (fileList) => {
    try {
      setUploading(true);
      const uploadPromises = Array.from(fileList).map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "product_images");
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dzguzxt6u/image/upload",
          { method: "POST", body: data }
        );
        const result = await res.json();
        if (!res.ok)
          throw new Error(result.error?.message || "Upload thất bại");
        return result.secure_url;
      });
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      alert("Tải ảnh thất bại, vui lòng thử lại!");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (key, files, multiple) => {
    setUploading(true);
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const localPreviews = fileList.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...localPreviews],
    }));
    const uploadedUrls = await uploadToCloudinary(fileList);
    handleChange(key, [...(formData[key] || []), ...uploadedUrls]);
  };

  const handleRemoveImage = (key, index) => {
    const newPreviews = [...(previewUrls[key] || [])];
    const newUrls = [...(formData[key] || [])];
    newPreviews.splice(index, 1);
    newUrls.splice(index, 1);
    setPreviewUrls((prev) => ({ ...prev, [key]: newPreviews }));
    handleChange(key, newUrls);
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full rounded-xl shadow-lg flex flex-col ${
          sizeClasses[size] || sizeClasses.md
        } max-h-[90vh]`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-green-700">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {children
            ? children
            : fields.map((f) => (
                <div key={f.key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                  </label>

                  {f.type === "custom" && f.render ? (
                    f.render(formData[f.key], (v) => handleChange(f.key, v))
                  ) : f.type === "select" ? (
                    <select
                      value={formData[f.key] || ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="border rounded-lg p-2 text-sm focus:ring focus:ring-green-200"
                      required={f.required}
                    >
                      <option value="">-- Chọn --</option>
                      {f.options?.map((opt) => (
                        <option
                          key={opt.value?._id || opt.value}
                          value={opt.value?._id || opt.value}
                        >
                          {opt.label?.name || opt.label || "Không xác định"}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      value={formData[f.key] || ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ""}
                      className="border rounded-lg p-2 text-sm focus:ring focus:ring-green-200"
                    />
                  ) : f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!formData[f.key]}
                      onChange={(e) => handleChange(f.key, e.target.checked)}
                      className="w-4 h-4"
                    />
                  ) : f.type === "file" ? (
                    <div>
                      <input
                        type="file"
                        accept={f.accept || "image/*"}
                        multiple={f.multiple || false}
                        onChange={async (e) =>
                          await handleFileChange(
                            f.key,
                            e.target.files,
                            f.multiple
                          )
                        }
                        className="border rounded-lg p-2 text-sm focus:ring focus:ring-green-200 w-full"
                      />
                      {previewUrls[f.key] && previewUrls[f.key].length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {previewUrls[f.key].map((url, i) => (
                            <div
                              key={i}
                              className="relative group border rounded-md overflow-hidden"
                            >
                              <img
                                src={url}
                                alt="preview"
                                className="w-20 h-20 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(f.key, i)}
                                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type={f.type || "text"}
                      value={formData[f.key] || ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ""}
                      className="border rounded-lg p-2 text-sm focus:ring focus:ring-green-200"
                      required={f.required}
                    />
                  )}
                </div>
              ))}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div className="flex justify-end gap-3 p-4 border-t mt-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              {children ? "Đóng" : "Hủy"}
            </button>

            {onSave && showSaveButton && (
              <button
                disabled={uploading || isSaving}
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {isSaving ? saveText : uploading ? "Đang tải ảnh..." : saveText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
