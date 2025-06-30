import React, { useState, useEffect } from "react";
import logo from "../../assets/indocement.png";
import { useNavigate, useLocation } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import logout from "../../assets/logout.png";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { menuItems } from "../../utils/menuItems";
import { clearAuth } from "../../utils/token";
import Swal from "sweetalert2";
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const activeItem = menuItems.find(
      (item) =>
        item.path === currentPath ||
        item.subItems?.some((sub) => sub.path === currentPath)
    );
    if (activeItem) {
      setActiveMenu(activeItem.key);
    }
  }, [currentPath]);
  const handleMenuClick = (menu, path) => {
    setActiveMenu(menu);
    if (currentPath !== path) {
      navigate(path);
    }
  };
  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };
  const onLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Please wait...",
          text: "Currently processing ",
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        setTimeout(() => {
          Swal.close();
        }, 1000);
        setTimeout(() => {
          clearAuth();
          navigate("/login");
        }, 1200);
      }
    });
  };
  const userRole = localStorage.getItem("role");
  // const filteredMenuItems = menuItems.filter(item => 
  //   !item.roles || item.roles.includes(userRole)
  // );
  const filteredMenuItems = menuItems
  return (
    <>
      {/* Top Bar Search */}
      <nav
        className="fixed w-full py-5 bg-white shadow-md transition-all duration-500 ease-out right-0"
        style={{ zIndex: 99 }}
      >
        <div className="px-3 py-4 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <form className="flex items-center gap-2 max-w-md ml-auto"></form>
          </div>
        </div>
      </nav>
      {/* Side Bar Navigation */}
      <div
        className={`fixed top-0 left-0 ${
          isSidebarOpen ? "w-[245px]" : "w-[60px]"
        } h-screen transition-transform`}
        aria-label="Sidebar"
        style={{ zIndex: 99, }}
      >
        <div style={{overflow:'hidden'}} className={`h-full pb-4 overflow-y-auto bg-[#004AAD]`}>
          <div
            className={`flex ${
              isSidebarOpen
                ? "bg-[#004AAD] flex h-[70px]"
                : "bg-white py-3 px-3 flex h-[70px]"
            }`}
          >
            {isSidebarOpen ? (
              <div style={{ backgroundColor: "white" }} className="flex">
                <img
                  src={logo}
                  style={{ width: "210px", height: "35px" }}
                  className={`px-6 mt-4 hidden lg:inline`}
                  alt="Logo"
                />
                <button
                  style={{ marginTop: "-15px" }}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <svg
                    className={`w-[45px] h-8 text-black`}
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75  0 012 10z"
                    ></path>
                  </svg>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <svg
                  className={`w-8 ms-1 h-8 text-white`}
                  aria-hidden="true"
                  fill="current Color"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
            )}
          </div>

          {isSidebarOpen ? (
            <div className="flex px-3 mt-4 flex-col items-center">
              <div className="flex flex-col items-center m-auto bg-[#9BB8CD] py-2 px-5 rounded-lg">
                <div className="ms-1">
                  <img src={logout} alt="Logout Icon" width={70} height={70} />
                </div>
                <div className="flex text-center justify-center flex-col mt-2">
                  <h5
                    className="text-white"
                    style={{ fontSize: "18px", fontWeight: "600" }}
                  >
                    {localStorage.getItem("fullname")}
                  </h5>
                  <h6
                    className="text-[#fa2626]"
                    style={{ fontSize: "12px", fontWeight: "600" }}
                  >
                    {localStorage.getItem("role")}
                  </h6>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="flex gap-2 items-center m-auto  mt-2 bg-[#9BB8CD] py-3 px-2 rounded-lg">
                <img src={logout} alt="Logout Icon" width={30} height={30} />
              </div>
            </div>
          )}
         <List className="space-y-2 font-medium mt-6 mx-4">
            {filteredMenuItems.map((item) => (
              <div key={item.key}>
                <ListItem
                  button
                  onClick={() => {
                    if (item.subItems) {
                      toggleDropdown(item.key);
                    } else {
                      handleMenuClick(item.key, item.path);
                    }
                  }}
                  sx={{
                    backgroundColor:
                      activeMenu === item.key ? "#4CC9FE" : "transparent",
                    color: "white",
                    borderTopRightRadius: "50px",
                    borderBottomRightRadius: "50px",
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                  {item.subItems && <ExpandMoreIcon sx={{ color: "white" }} />}
                </ListItem>
                {item.subItems && (
                  <Collapse
                    in={openDropdown === item.key}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItem
                          key={subItem.key}
                          button
                          onClick={() =>
                            handleMenuClick(subItem.key, subItem.path)
                          }
                          sx={{
                            borderBottom:
                              activeMenu === subItem.key
                                ? "4px solid #4CC9FE"
                                : "transparent",
                            color: "white",
                            borderTopRightRadius: "50px",
                            borderBottomRightRadius: "50px",
                          }}
                        >
                          <ListItemText
                            primary={subItem.title}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </div>
            ))}
          </List>

          <div className="absolute bottom-5 left-0 right-0">
            {setIsSidebarOpen ? (
              <button
                onClick={onLogout}
                className={`flex  m-auto items-center justify-center p-2 rounded-lg text-white bg-[#fa2626] hover:text-white transition duration-300 ${
                  isSidebarOpen ? "w-[200px]" : "w-[60px]"
                }`}
              >
                {isSidebarOpen ? (
                  <span>
                    {" "}
                    <LogoutIcon fontSize="small" className="me-1" />
                    Logout
                  </span>
                ) : (
                  <LogoutIcon fontSize="small" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;