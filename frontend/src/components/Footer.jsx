import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const FooterLink = ({ href, children }) => (
  <li className="footer-list-item">
    <a href={href} className="footer-link text-gray-600 hover:text-black">
      {children}
    </a>
  </li>
);

const Footer = () => {
  return (
    <footer className="footer border-t border-[#eaeceb]">
      <div className="container-default max-w-6xl mx-auto px-4 py-16">
        {/* Footer top  */}
        <div className="footer-top flex flex-col md:flex-row justify-between items-center">
          {/* Nhóm thông tin liên lạc (trái) */}
          <div className="footer-contact-wrapper flex flex-col md:flex-row items-center gap-8 md:gap-0">
            {/* Location */}
            <div className="links-block contact md:pr-8">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.prod.website-files.com/5f186b75b647cf7c841cecae/5f19da151552c5758b49b723_icon-contact-01-farm-template.svg"
                  alt="Location Icon"
                  className="footer-contact-icon h-4 w-4"
                />
                <h3 className="uppercase-large contact uppercase  text-sm text-[#92a0a0] leading-[18px] font-medium">
                  Địa điểm
                </h3>
              </div>
              <div className="footer-contact-text text-[22px] font-bold text-[#122423] tracking-[-0.18px] leading-[30.008px] text-left">
                3/2, P.Xuân Khánh
                <br />
                Q.Ninh Kiểu, Tp. Cần Thơ
              </div>
            </div>

            {/* THÊM MỚI: Đường kẻ dọc */}
            <div className="divider w-px h-16 bg-[#eaeceb] hidden md:block"></div>
            <div className="links-block contact md:px-8">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.prod.website-files.com/5f186b75b647cf7c841cecae/5f19da159b63bf1252295334_icon-contact-02-farm-template.svg"
                  alt="Email Icon"
                  className="footer-contact-icon h-4 w-4"
                />
                <h3 className="uppercase-large contact uppercase  text-sm text-[#92a0a0] leading-[18px] font-medium">
                  Email
                </h3>
              </div>
              <div className="mt-2 text-left">
                <a
                  href="mailto:contact@farm.com"
                  className="footer-contact-text block text-[22px] font-bold text-[#122423] tracking-[-0.18px] leading-[30.008px]"
                >
                  our-store@gmail.com
                </a>
                <a
                  href="mailto:sales@farm.com"
                  className="footer-contact-text block text-[22px] font-bold text-[#122423] tracking-[-0.18px] leading-[30.008px]"
                >
                  our-company@farm.com
                </a>
              </div>
            </div>

            {/* THÊM MỚI: Đường kẻ dọc */}
            <div className="divider w-px h-16 bg-[#eaeceb] hidden md:block"></div>

            {/* Phone */}
            {/* Cập nhật: Thêm padding 'md:pl-8' */}
            <div className="links-block contact md:pl-8">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.prod.website-files.com/5f186b75b647cf7c841cecae/5f19da15dcfbfa532dcc6c82_icon-contact-03-farm-template.svg"
                  alt="Phone Icon"
                  className="footer-contact-icon h-4 w-4"
                />
                <h3 className="uppercase-large contact uppercase  text-sm text-[#92a0a0] leading-[18px] font-medium">
                  Điện thoại
                </h3>
              </div>
              <div className="mt-2 text-left">
                <a
                  href="tel:(213)215-6247"
                  className="footer-contact-text block text-[22px] font-bold text-[#122423] tracking-[-0.18px] leading-[30.008px]"
                >
                  (213) 215 - 6247
                </a>
                <a
                  href="tel:(213)240-6914"
                  className="footer-contact-text block text-[22px] font-bold text-[#122423] tracking-[-0.18px] leading-[30.008px]"
                >
                  (213) 240 - 6914
                </a>
              </div>
            </div>
          </div>

          {/* Nút Contact Us (phải) */}
          <a
            href="/contact"
            className="button-primary inline-block bg-yellow-400 text-gray-900 font-bold py-4 px-8 rounded-full mt-8 md:mt-0"
          >
            <div className="button-text">
              Liên hệ <span className="arrow-button">→</span>
            </div>
          </a>
        </div>
        {/* Duong ke ngang */}
        <div className="divider footer-line h-px w-full bg-[#eaeceb] my-12"></div>
        {/* Footer bottom */}
        <div className="footer-links-block grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Logo, Copyright, Socials */}
          <div className="links-block main flex flex-col gap-5 justify-start items-start">
            <a href="/" className="footer-logo-link inline-block">
              <img
                src="https://cdn.prod.website-files.com/5f186b75b647cf7c841cecae/5f1899c321f9e6021e4a3fc4_logo-02-farm-template.svg"
                alt="Farm Logo"
                className="footer-logo h-10"
              />
            </a>
            <div className="small-print text-[#464e4e] tracking-[-0.16px] leading-[30px] mb-8 flex flex-col">
              <h3>
                Copyright © Farm | Designed by{" "}
                <a
                  href="https://brixtemplates.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold"
                >
                  BRIX Templates
                </a>
              </h3>
            </div>
            <div className="footer-social-media-grid flex gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-black"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-black"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-black"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Cột 2: Pages */}
          <div className="links-block">
            <h3 className="footer-title font-bold text-lg mb-4 font-serif">
              Trang
            </h3>
            <ul className="list-footer list-none flex flex-col gap-2">
              <FooterLink href="/home">Trang chủ</FooterLink>
              <FooterLink href="/about">Về chúng tôi</FooterLink>
              <FooterLink href="/reviews">Đánh giá</FooterLink>
              <FooterLink href="/contact">Liên hệ</FooterLink>
              <FooterLink href="/blog">Bài viết</FooterLink>
              <FooterLink href="/store">Sản phẩm</FooterLink>
            </ul>
          </div>

          {/* Cột 3: Utility Pages */}
          <div className="links-block">
            <h3 className="footer-title font-bold text-lg mb-4 font-serif">
              Trang tiện ích
            </h3>
            <ul className="list-footer list-none flex flex-col gap-2">
              <FooterLink href="/utility-pages/styleguide">
                Style Guide
              </FooterLink>
              <FooterLink href="/404">404 Not Found</FooterLink>
              <FooterLink href="/401">Password Protected</FooterLink>
              <FooterLink href="/utility-pages/start-here">
                Start Here
              </FooterLink>
              <FooterLink href="/utility-pages/licenses">Licences</FooterLink>
            </ul>
          </div>

          {/* Cột 4: Newsletter */}
          <div className="footer-newsletter flex flex-col gap-4">
            <h3 className="footer-title font-bold text-lg font-serif">
              Đăng kí nhận tin tức mới
            </h3>
            <p className="paragraph footer-newsletter text-gray-600">
              Điền email để nhận tin tức mới mỗi ngày với chúng tôi.
            </p>
            <form className="footer-newsletter-form flex rounded-lg items-center">
              <input
                type="email"
                className="input w-full h-[32px] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Điền email vào đây ...."
                required
              />
              <button
                type="submit"
                className="button-inside bg-gray-800 text-white p-6 h-[32px] rounded-full flex items-center w-[100px]"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      </div>
      <div
        className="footer-bottom w-full min-h-[223px] bg-cover bg-top bg-no-repeat"
        style={{
          backgroundImage: "url('/footer-bottom.jpg')",
        }}
      ></div>
    </footer>
  );
};

export default Footer;
