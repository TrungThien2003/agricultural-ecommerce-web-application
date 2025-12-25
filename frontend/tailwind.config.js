// /** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Quét tất cả các tệp React trong thư mục src
  ],
  theme: {
    extend: {
      fontFamily: {
        // Thêm 'serif' vào đây
        // 'DM Serif Display' sẽ là font chính
        // ...defaultTheme.fontFamily.serif là các font dự phòng (fallback)
        serif: ['"DM Serif Display"', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"), // Dòng này
  ],
};
