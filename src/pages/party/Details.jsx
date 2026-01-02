import React, { useEffect } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Icons } from '../../helper/icons';
import Profile from './Profile';
import Logs from './Logs';
import Ladger from './Ladger';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const Details = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const tab = query.get("tab") || "profile";

  // Update URL when tab button is clicked
  const handleTabClick = (tabName) => {
    navigate(`?tab=${tabName.toLowerCase()}`);
  };

  const renderTabContent = () => {
    if (tab === "profile") {
      return <Profile />;
    } else if (tab === "ledger") {
      return <Ladger partyId={id} />;
    } else if (tab === "logs") {
      return <Logs partyId={id} />;
    }
  };

  return (
    <>
      <Nav title={"Party Details"} />
      <main id='main'>
        <SideNav />
        <div className="content__body">
          <div className='party__details__header'>
            <button
              className={tab === "profile" ? "active" : ""}
              onClick={() => handleTabClick("profile")}
            >
              <Icons.USER /> Profile
            </button>
            <button
              className={tab === "ledger" ? "active" : ""}
              onClick={() => handleTabClick("ledger")}
            >
              <Icons.BOOK /> Ledger
            </button>
            <button
              className={tab === "logs" ? "active" : ""}
              onClick={() => handleTabClick("logs")}
            >
              <Icons.FILE /> Logs
            </button>
          </div>

          {renderTabContent()}
        </div>
      </main>
    </>
  );
};

export default Details;
