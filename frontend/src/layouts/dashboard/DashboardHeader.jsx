import { Button } from "../../components/Button/Button";
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector } from "react-redux";
const DashboardHeaderStyles = styled.div`
  background-color: white;
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  .logo {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 18px;
    font-weight: 600;
    img {
      max-width: 40px;
    }
  }
  .header-info {
    display: flex;
    gap: 12px;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
`;

const DashboardHeader = () => {
  const user = useSelector((state) => state.user);
  console.log("user", user);
  return (
    <DashboardHeaderStyles>
      <div className="header-right">
        <div to="/users/sign-out" className="header-info">
          <UserOutlined />
          <div>
            <span>{user.name}</span>
          </div>
        </div>
      </div>
    </DashboardHeaderStyles>
  );
};

export default DashboardHeader;
