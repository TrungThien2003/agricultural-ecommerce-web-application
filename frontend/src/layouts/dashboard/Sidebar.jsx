import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
const SidebarStyles = styled.div`
  width: 300px;
  background: #ffffff;
  box-shadow: 10px 10px 20px rgba(218, 213, 213, 0.15);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  .menu-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 14px 20px;
    font-weight: 500;
    color: ${(props) => props.theme.gray80};
    margin-bottom: 20px;
    cursor: pointer;
    &.active,
    &:hover {
      background: #f1fbf7;
      color: ${(props) => props.theme.primary};
    }
  }
  @media screen and (max-width: 1023.98px) {
    display: none;
  }
`;
const sidebarLinks = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },

  {
    title: "Category",
    url: "/category",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
  {
    title: "User",
    url: "/manage/user",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    title: "Revenue",
    url: "statistic/revenue",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="#000000"
        version="1.1"
        id="Layer_1"
        viewBox="0 0 256 252"
        enable-background="new 0 0 256 252"
      >
        <path d="M59.406,88.486L50.54,60.801h50.68L90.352,88.486H59.406z M20.567,146.773  c0-21.393,11.841-39.869,29.63-49.078h50.737c17.789,9.209,29.973,27.685,29.973,49.078c0,30.316-24.711,55.027-55.027,55.027  C45.22,201.801,20.567,177.09,20.567,146.773z M80.857,159.987c0,3.26-2.974,4.919-7.265,4.919c-4.976,0-9.553-1.659-12.87-3.318  l-2.288,8.866c2.917,1.659,7.894,2.974,13.156,3.318v7.264h7.551v-7.894c8.923-1.316,13.843-7.265,13.843-14.186  c0-6.921-3.661-11.154-12.87-14.472c-6.578-2.288-9.209-3.947-9.209-6.578c0-2.002,1.659-4.29,6.578-4.29  c5.606,0,9.209,1.659,11.211,2.631l2.288-8.58c-2.631-1.316-5.949-2.288-11.211-2.631v-6.921h-7.551v7.207  c-8.237,1.659-13.156,6.921-13.156,13.843c0,7.608,5.606,11.555,13.843,14.186C78.511,155.354,81.143,157.012,80.857,159.987z   M198.608,91.221c-1.756-1.828-1.698-4.734,0.13-6.491s4.734-1.698,6.491,0.13s1.698,4.734-0.13,6.491  S200.364,93.049,198.608,91.221z M229.263,82.637c1.828-1.756,1.887-4.662,0.13-6.491s-4.662-1.887-6.491-0.13  c-1.828,1.756-1.887,4.662-0.13,6.491S227.434,84.394,229.263,82.637z M171.883,56.775c1.828-1.756,1.887-4.662,0.13-6.491  c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491S170.055,58.532,171.883,56.775z M239.094,60.108  c1.828-1.756,1.887-4.662,0.13-6.491s-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491C234.36,61.806,237.266,61.864,239.094,60.108  z M204.274,24.598c1.828-1.756,1.887-4.662,0.13-6.491c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491  C199.54,26.296,202.445,26.354,204.274,24.598z M229.857,35.032c1.828-1.756,1.887-4.662,0.13-6.491  c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491C225.123,36.73,228.029,36.788,229.857,35.032z M182.436,34.261  c1.828-1.756,1.887-4.662,0.13-6.491c-1.756-1.828-4.662-1.887-6.491-0.13s-1.887,4.662-0.13,6.491S180.607,36.017,182.436,34.261z   M190.179,61.832l-16.368,15.724l-1.58,6.822l6.88-1.305l16.368-15.724c4.637,2.618,10.782,2.02,15.012-2.044  c5.15-4.947,5.309-12.88,0.362-18.03s-12.88-5.309-18.03-0.362C188.593,50.978,187.573,56.91,190.179,61.832z M253.968,54.72  c0,21.672-13.201,40.348-31.968,48.417V119h-15.232v88.777c0,17.087-13.772,30.858-30.859,30.858h-26.12v11.181H2V215h148v13.484  l26.675-0.05c11.476,0,20.657-9.181,20.657-20.657V119H182v-15.814c-18.828-8.041-32.083-26.75-32.083-48.466  c0-29.073,23.463-52.536,52.536-52.536C231.271,2.184,254.989,25.646,253.968,54.72z M241.747,34.102  c-11.375-21.68-38.232-30.052-59.912-18.677c-21.68,11.375-30.052,38.232-18.677,59.912c11.375,21.68,38.232,30.052,59.912,18.677  C244.75,82.639,253.122,55.782,241.747,34.102z" />
      </svg>
    ),
  },
  {
    title: "Product",
    url: "/manage/product",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="0" fill="none" width="24" height="24" />

        <g>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22 3H2v6h1v11c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V9h1V3zM4 5h16v2H4V5zm15 15H5V9h14v11zM9 11h6c0 1.105-.895 2-2 2h-2c-1.105 0-2-.895-2-2z"
          />
        </g>
      </svg>
    ),
  },
  {
    title: "Stock",
    url: "/statistic/quantity",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="#000000"
        version="1.1"
        viewBox="0 0 226 226"
        enable-background="new 0 0 226 226"
        className="w-6 h-6"
      >
        <g>
          <path d="M210.12,39.812L115.688,0.537c-1.721-0.716-3.655-0.716-5.376,0L15.88,39.812c-2.611,1.086-4.312,3.636-4.312,6.463V219   c0,3.866,3.134,7,7,7h188.864c3.866,0,7-3.134,7-7V46.276C214.432,43.448,212.731,40.898,210.12,39.812z M200.432,212H25.568   V50.946L113,14.582l87.432,36.364V212z" />
          <path d="m76.94,95.529l-29.667,29.667c-2.734,2.734-2.734,7.166 0,9.899 1.367,1.367 3.158,2.05 4.95,2.05s3.583-0.684 4.95-2.05l29.667-29.667c5.019-5.019 12.952-5.422 18.455-0.936 11.09,9.042 27.083,8.23 37.201-1.887l24.283-24.283v7.907c0,3.866 3.134,7 7,7s7-3.134 7-7v-24.703c0-3.866-3.134-7-7-7h-24.703c-3.866,0-7,3.134-7,7s3.134,7 7,7h7.7l-24.18,24.18c-5.019,5.019-12.954,5.422-18.455,0.937-11.09-9.044-27.083-8.233-37.201,1.886z" />
          <path d="m35.256,150.711c0,3.866 3.134,7 7,7h141.487c3.866,0 7-3.134 7-7s-3.134-7-7-7h-141.487c-3.866,0-7,3.133-7,7z" />
          <path d="m183.744,164.139h-141.488c-3.866,0-7,3.134-7,7s3.134,7 7,7h141.487c3.866,0 7-3.134 7-7s-3.133-7-6.999-7z" />
          <path d="m183.744,184.567h-141.488c-3.866,0-7,3.134-7,7s3.134,7 7,7h141.487c3.866,0 7-3.134 7-7s-3.133-7-6.999-7z" />
        </g>
      </svg>
    ),
  },

  {
    title: "Logout",
    url: "/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    ),
    onClick: () => {},
  },
];
const Sidebar = () => {
  return (
    <SidebarStyles className="sidebar">
      <NavLink to="/" className="logos  flex items-center">
        <img src="/logo.svg" alt="decathon" className="logo mx-0" />
        <span className="p-2 hidden lg:inline-block flex-shrink-0">
          Deathron
        </span>
      </NavLink>
      {sidebarLinks.map((link) => {
        if (link.onClick)
          return (
            <div className="menu-item" onClick={link.onClick} key={link.title}>
              <span className="menu-icon">{link.icon}</span>
              <span className="menu-text">{link.title}</span>
            </div>
          );
        return (
          <NavLink to={link.url} className="menu-item" key={link.title}>
            <span className="menu-icon">{link.icon}</span>
            <span className="menu-text">{link.title}</span>
          </NavLink>
        );
      })}
    </SidebarStyles>
  );
};

export default Sidebar;
