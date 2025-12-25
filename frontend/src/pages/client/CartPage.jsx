// src/pages/CartPage.js
import React, { useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import {
  updateCartItemQuantity,
  removeItemFromCart,
  setCheckoutSelection,
  changeCartItemVariant,
} from "../../redux/slices/cartSlice";

function CustomCheckbox({
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`h-5 w-5 rounded border-gray-400 text-green-600 focus:ring-green-500 
      ${disabled ? "cursor-not-allowed bg-gray-200" : "cursor-pointer"}`}
    />
  );
}

const getVariantDetails = (productData, selectedVariantId) => {
  if (!productData) {
    return {
      selected: { name: "Lỗi", sellingPrice: 0, totalQuantity: 0 },
      allOptions: [],
    };
  }

  const formatVariantName = (unit, weight, fallbackName = "Tiêu chuẩn") => {
    if (unit) {
      return unit;
    }
    if (weight) {
      return `${weight} kg`;
    }
    return fallbackName;
  };
  // ------------------------------------------

  const allOptions = [];
  allOptions.push({
    _id: "base_product",
    name: formatVariantName(productData.unit, productData.weight),
    sellingPrice: productData.sellingPrice,
    totalQuantity: productData.quantity,
    unit: productData.unit,
    weight: productData.weight,
  });
  (productData.variants || []).forEach((variant) => {
    const priceData = (productData.variantsWithPrice || []).find(
      (p) => p._id === variant._id
    );
    const quantityData = (productData.variantsWithQuantity || []).find(
      (q) => q._id === variant._id
    );

    const variantUnit = variant.unit || priceData?.unit;
    const variantWeight = variant.weight || priceData?.weight;

    allOptions.push({
      ...variant,
      name: variant.name || formatVariantName(variantUnit, variantWeight),
      sellingPrice: priceData?.sellingPrice || 0,
      totalQuantity: quantityData?.quantity || 0,
      unit: variantUnit,
      weight: variantWeight,
    });
  });
  const selected =
    allOptions.find((opt) => opt._id === selectedVariantId) || allOptions[0];
  return { selected, allOptions };
};

export default function CartPage() {
  const dispatch = useDispatch();
  const { products: cartItems, selectedItemIds } = useSelector(
    (state) => state.cart
  );

  const selectableItemIds = useMemo(() => {
    return cartItems
      .map((item) => {
        if (!item.productData) return null;
        const { selected } = getVariantDetails(
          item.productData,
          item.selectedVariantId
        );
        const cartItemId = `${item.productId}_${item.selectedVariantId}`;
        return { cartItemId, stock: selected.totalQuantity };
      })
      .filter((item) => item && item.stock > 0)
      .map((item) => item.cartItemId);
  }, [cartItems]);

  const isAllSelected =
    selectableItemIds.length > 0 &&
    selectedItemIds.length === selectableItemIds.length;
  const isIndeterminate =
    selectedItemIds.length > 0 &&
    selectedItemIds.length < selectableItemIds.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      dispatch(setCheckoutSelection(selectableItemIds));
    } else {
      dispatch(setCheckoutSelection([]));
    }
  };

  const handleSelectItem = (cartItemId) => {
    const newSelectedIds = selectedItemIds.includes(cartItemId)
      ? selectedItemIds.filter((id) => id !== cartItemId)
      : [...selectedItemIds, cartItemId];
    dispatch(setCheckoutSelection(newSelectedIds));
  };

  const handleUpdateQuantity = (productId, selectedVariantId, newQuantity) => {
    dispatch(
      updateCartItemQuantity({ productId, selectedVariantId, newQuantity })
    );
  };

  const handleRemoveItem = (productId, selectedVariantId) => {
    dispatch(removeItemFromCart({ productId, selectedVariantId }));
  };

  const handleChangeVariant = (productId, oldVariantId, newVariantId) => {
    const item = cartItems.find((item) => item.productId === productId);
    if (!item) return;

    const { productData } = item;
    const { selected: newVariant } = getVariantDetails(
      productData,
      newVariantId
    );

    if (newVariant.totalQuantity === 0) {
      alert("Biến thể này đã hết hàng, vui lòng chọn loại khác.");
      return;
    }

    dispatch(changeCartItemVariant({ productId, oldVariantId, newVariantId }));
  };

  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item) =>
      selectedItemIds.includes(`${item.productId}_${item.selectedVariantId}`)
    );
  }, [cartItems, selectedItemIds]);

  const subtotal = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => {
      if (!item.productData) return sum; // An toàn
      const { selected } = getVariantDetails(
        item.productData,
        item.selectedVariantId
      );
      return sum + (selected.sellingPrice || 0) * item.quantity;
    }, 0);
  }, [selectedCartItems]);

  const shippingFee = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header hideSearch={true}></Header>
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <nav className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/" className="text-[22px] hover:text-green-600">
            Trang chủ
          </Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[22px] font-medium text-gray-700">
            Giỏ hàng
          </span>
        </nav>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="text-gray-600 mb-6">
              Hãy quay lại trang sản phẩm để lựa chọn hàng nhé.
            </p>
            <Link
              to="/"
              className="inline-block bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
                <div className="flex items-center gap-2">
                  <CustomCheckbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Chọn tất cả
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                {cartItems.map((item) => {
                  if (!item || !item.productData) {
                    console.error("Lỗi dữ liệu giỏ hàng:", item);
                    return (
                      <div key={Math.random()} className="text-red-500">
                        Lỗi: Dữ liệu sản phẩm không hợp lệ
                      </div>
                    );
                  }

                  const { selected, allOptions } = getVariantDetails(
                    item.productData,
                    item.selectedVariantId
                  );
                  const cartItemId = `${item.productId}_${item.selectedVariantId}`;
                  const isOutOfStock = selected.totalQuantity === 0;
                  const isChecked = selectedItemIds.includes(cartItemId);

                  return (
                    <div
                      key={cartItemId}
                      className={`flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-6 
                      ${isOutOfStock ? "opacity-60" : ""}`}
                    >
                      <div className="flex-shrink-0 pt-1 md:pt-10">
                        <CustomCheckbox
                          checked={!isOutOfStock && isChecked}
                          disabled={isOutOfStock}
                          onChange={() => handleSelectItem(cartItemId)}
                        />
                      </div>
                      <img
                        src={item.productData.images[0]}
                        alt={item.productData.name}
                        className="w-full md:w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            {item.productData.name}
                          </h2>

                          {allOptions.length > 1 ? (
                            <div className="relative mt-1 w-full md:w-52">
                              <select
                                value={item.selectedVariantId}
                                onChange={(e) =>
                                  handleChangeVariant(
                                    item.productId,
                                    item.selectedVariantId,
                                    e.target.value
                                  )
                                }
                                className="appearance-none block w-full bg-white text-sm text-gray-600 
                                            border border-gray-300 rounded-md shadow-sm 
                                            py-2 pl-3 pr-8 
                                            focus:border-green-500 focus:ring-1 focus:ring-green-500"
                              >
                                {allOptions.map((variant) => (
                                  <option
                                    key={variant._id}
                                    value={variant._id}
                                    disabled={variant.totalQuantity === 0}
                                  >
                                    {variant.name}{" "}
                                    {variant.totalQuantity === 0
                                      ? "(Hết hàng)"
                                      : ""}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">
                              Phân loại:{" "}
                              <span className="font-medium text-gray-700">
                                {selected.name}
                              </span>
                            </p>
                          )}

                          {/* ***** HIỂN THỊ GIÁ CÓ KÈM ĐƠN VỊ ***** */}
                          <div className="flex items-baseline gap-1 mt-2">
                            <p className="text-lg font-bold text-green-700">
                              {selected.sellingPrice.toLocaleString("vi-VN")}₫
                            </p>
                            <p className="text-sm font-medium text-gray-500">
                              {selected.weight && selected.unit
                                ? `/ ${selected.weight} kg / ${selected.unit}`
                                : selected.weight
                                ? `/ ${selected.weight} kg`
                                : selected.unit
                                ? `/ ${selected.unit}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="inline-flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.selectedVariantId,
                                  item.quantity - 1
                                )
                              }
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg disabled:opacity-50"
                              disabled={isOutOfStock || item.quantity === 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-5 py-2 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.selectedVariantId,
                                  item.quantity + 1
                                )
                              }
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-50"
                              disabled={
                                isOutOfStock ||
                                item.quantity === selected.totalQuantity
                              }
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(
                                item.productId,
                                item.selectedVariantId
                              )
                            }
                            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </button>
                        </div>
                        {isOutOfStock ? (
                          <div className="text-red-600 text-sm font-semibold mt-2 flex items-center gap-1">
                            <AlertTriangle size={16} />
                            Đã hết hàng
                          </div>
                        ) : (
                          item.quantity > selected.totalQuantity && (
                            <div className="text-red-600 text-xs mt-2 flex items-center gap-1">
                              <AlertTriangle size={14} />
                              Chỉ còn {selected.totalQuantity} sản phẩm trong
                              kho.
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Tóm tắt đơn hàng
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({selectedItemIds.length} sản phẩm):</span>
                    <span className="font-medium">
                      {subtotal.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">
                      {shippingFee === 0
                        ? "Miễn phí"
                        : `${shippingFee.toLocaleString("vi-VN")}₫`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Tổng cộng:</span>
                      <span>{total.toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className={`mt-6 w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all 
                    ${
                      selectedItemIds.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#c9d935] hover:bg-[#339b76]"
                    }`}
                  onClick={(e) => {
                    if (selectedItemIds.length === 0) e.preventDefault();
                  }}
                  state={{
                    items: cartItems
                      .filter((item) =>
                        selectedItemIds.includes(
                          `${item.productId}_${item.selectedVariantId}`
                        )
                      )
                      .map((item) => {
                        const { selected } = getVariantDetails(
                          item.productData,
                          item.selectedVariantId
                        );
                        return {
                          cartItemId: `${item.productId}_${item.selectedVariantId}`,
                          productName: item.productData.name,
                          productImage: item.productData.images[0],
                          variantName: selected.name,
                          price: selected.sellingPrice,
                          quantity: item.quantity,
                        };
                      }),
                    total: total,
                    shippingFee: shippingFee,
                    subtotal: subtotal,
                  }}
                >
                  Đặt hàng ({selectedItemIds.length})
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}
