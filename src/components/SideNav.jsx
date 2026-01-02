import { useState } from 'react'
import { PiComputerTowerThin } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import { TbUsersGroup } from "react-icons/tb";
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useSelector } from 'react-redux';
import { Icons } from '../helper/icons';



const SideNav = () => {
  const userData = useSelector((store) => store.userDetail)
  const [sideBar, setSideBar] = useState(true);
  const isSideBarOpen = localStorage.getItem("sideBarOpenStatus");
  const activePath = window.location.pathname;

  const [links, setLinks] = useState({
    "main": [
      {
        name: 'Dashboard',
        icon: <Icons.HOME />,
        link: '/admin/dashboard',
        submenu: null
      },
      {
        name: 'Party',
        icon: <Icons.USERS />,
        link: '/admin/party',
        submenu: null
      },
      {
        name: 'Items',
        icon: <Icons.PRODUCT />,
        link: '/admin/item',
        submenu: null
      }
    ],
    "sales": [
      {
        name: 'Sales Invoice',
        icon: <PiComputerTowerThin />,
        link: '/admin/sales-invoice',
        submenu: null
      },
      {
        name: 'Quotation / Estimate',
        icon: <PiComputerTowerThin />,
        link: '/admin/quotation-estimate',
        submenu: null
      },
      {
        name: 'Proforma Invoice',
        icon: <PiComputerTowerThin />,
        link: '/admin/proforma-invoice',
        submenu: null
      },
      {
        name: 'Sales Return',
        icon: <PiComputerTowerThin />,
        link: '/admin/sales-return',
        submenu: null
      },
      {
        name: 'Payment In',
        icon: <PiComputerTowerThin />,
        link: '/admin/payment-in',
        submenu: null
      },
      {
        name: 'Credit Note',
        icon: <PiComputerTowerThin />,
        link: '/admin/credit-note',
        submenu: null
      },
      {
        name: 'Delivery Challan',
        icon: <PiComputerTowerThin />,
        link: '/admin/delivery-chalan',
        submenu: null
      },
    ],
    "Purshase": [
      {
        name: 'Purchase Invoice',
        icon: <PiComputerTowerThin />,
        link: '/admin/purchase-invoice',
        submenu: null
      },
      {
        name: 'Purchase Order',
        icon: <PiComputerTowerThin />,
        link: '/admin/purchase-order',
        submenu: null
      },
      {
        name: 'Purchase Return',
        icon: <PiComputerTowerThin />,
        link: '/admin/purchase-return',
        submenu: null
      },
      {
        name: 'Payment Out',
        icon: <PiComputerTowerThin />,
        link: '/admin/payment-out',
        submenu: null
      },
      {
        name: 'Debit Note',
        icon: <PiComputerTowerThin />,
        link: '/admin/debit-note',
        submenu: null
      },
    ],
    "Accounting": [
      {
        name: 'Accounts',
        icon: <Icons.BANK />,
        link: '/admin/account',
        submenu: null
      },
      {
        name: 'Other Transactions',
        icon: <Icons.TRANSACTION />,
        link: '/admin/other-transaction',
        submenu: null
      },
    ],
    "Setup": [
      {
        name: 'Site/Business Settings',
        icon: <IoSettingsOutline />,
        link: '/admin/dashboard',
        submenu: null
      },
      {
        name: 'User Management',
        icon: <TbUsersGroup />,
        link: '/admin/dashboard',
        submenu: null
      },
      {
        name: 'Unit',
        icon: <PiComputerTowerThin />,
        link: '/admin/unit',
        submenu: null
      },
      {
        name: 'Tax',
        icon: <PiComputerTowerThin />,
        link: '/admin/tax',
        submenu: null
      },
      {
        name: 'Items',
        icon: <PiComputerTowerThin />,
        link: null,
        submenu: [
          {
            name: 'Category',
            icon: <Icons.PRODUCT_CATEGORY />,
            link: '/admin/item-category',
            submenu: null
          },
          {
            name: 'Items',
            icon: <PiComputerTowerThin />,
            link: '/admin/item',
            submenu: null
          },
        ]
      },
    ]
  })
  const [openSubmenus, setOpenSubmenus] = useState([]);



  /** if user have not any company so visible only company creation page */
  // =====================================================================
  // useEffect(() => {
  //   let valid = true;

  //   if (userData.companies && userData.companies.length < 1) {
  //     valid = false;
  //   } else {
  //     valid = true;
  //   }

  //   setLinks(prevLinks =>
  //     Object.fromEntries(
  //       Object.entries(prevLinks).map(([category, items]) => [
  //         category,
  //         items.map(item => ({
  //           ...item,
  //           link: !valid ? "/admin/company" : item.link,
  //           submenu: item.submenu
  //             ? item.submenu.map(sub => ({
  //               ...sub,
  //               link: !valid ? "/admin/company" : sub.link,
  //             }))
  //             : null,
  //         })),
  //       ])
  //     )
  //   );
  // }, [userData])


  return (
    <aside className='side__nav  min-w-[175px] h-[calc(100vh-50px)] bg-[#003e32] text-white' id='sideBar'>
      <div className="side__nav__logo flex justify-center items-center">
      </div>
      <div className="side__nav__links pb-3">
        <div className="side__nav__link__group">
          <ul>
            {links.main.map((link, index) => (
              <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                <li className={`flex items-center ${link.link === activePath ? 'active__link' : ''}`} >
                  <span className='mr-3'>{link.icon}</span>
                  <span>{link.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </div>
        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Sales</h3>
          <ul className=''>
            {links.sales.map((link, index) => (
              <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                <li className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                  <span className='mr-3'>{link.icon}</span>
                  <span>{link.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </div>
        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Purshase</h3>
          <ul className=''>
            {links.Purshase.map((link, index) => (
              <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                <li className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                  <span className='mr-3'>{link.icon}</span>
                  <span >{link.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </div>
        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Accounting Solution</h3>
          <ul className=''>
            {links.Accounting.map((link, index) => (
              <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                <li className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                  <span className='mr-3'>{link.icon}</span>
                  <span >{link.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </div>

        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Setup</h3>
          <ul>
            <Link to={"/admin/site"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/site") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><IoSettingsOutline /></span>
                <span>Site/Business Settings</span>
              </li>
            </Link>
            <Link to={"/admin/unit"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/unit") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.UNIT /></span>
                <span>Unit</span>
              </li>
            </Link>
            <Link to={"/admin/tax"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/tax") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.TAX /></span>
                <span>Tax</span>
              </li>
            </Link>
            <Link to={"/admin/item-category"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/item-category") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.PRODUCT_CATEGORY /></span>
                <span>Item Category</span>
              </li>
            </Link>
          </ul>
        </div>

        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Report</h3>
          <ul>
            <Link to={"/admin/report/daybook"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/report/daybook") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.BOOK /></span>
                <span>Daybook</span>
              </li>
            </Link>
          </ul>
        </div>
      </div>
      <Tooltip id='sideBarItemToolTip' />
    </aside>
  );
}

export default SideNav