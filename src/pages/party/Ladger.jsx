import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useApi from '../../hooks/useApi';
import Cookies from 'js-cookie';
import Pagination from '../../components/Pagination';



const Ladger = ({ partyId }) => {
  const companyData = useSelector((store) => store.userDetail);
  const companyDetails = companyData?.companies?.filter((c, _) => c._id === companyData.activeCompany)
  const [companyName, setCompanyName] = useState('');
  const [partyData, setPartyData] = useState(null);
  const { getApiData } = useApi()
  const [ladgers, setLadgers] = useState([])
  const [activePage, setActivePage] = useState(1);
  const [dataLimit, setDataLimit] = useState(50);
  const [totalData, setTotalData] = useState()


  useEffect(() => {
    if (companyDetails && companyDetails?.length > 0) {
      let name = companyDetails[0]?.name || '';
      if (name.length > 20) {
        name = name.slice(0, 20) + '...';
      }
      setCompanyName(name);
    }
  }, [companyDetails]);


  useEffect(() => {
    const get = async () => {
      const partyData = await getApiData("party", partyId);
      setPartyData(partyData.data);
    }

    get()
  }, [])


  // Get party ladger details;
  useEffect(() => {
    const get = async () => {
      const url = process.env.REACT_APP_API_URL + `/party/ladger?page=${activePage}&limit=${dataLimit}`;
      const token = Cookies.get("token");

      const req = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({ partyId, token })
      });
      const res = await req.json();
      setLadgers([...res.data]);
      setTotalData(res.totalData)
      console.log(res);

    }

    get()
  }, [])


  return (
    <div className='content__body__main  relative'>
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
           text-2xl font-semibold text-blue-400 
           drop-shadow-[0_0_8px_rgba(255,235,0,0.8)]">
        Coming Soon
      </p>
      <div className='blur-sm select-none'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-bold'>
              {companyName}
            </p>
            <p className='text-xs text-gray-400'>Phone: {companyDetails && companyDetails[0]?.phone}</p>
          </div>

          <p className='font-bold text-gray-400'>Party Ladger</p>
        </div>
        <hr />

        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <p className='text-xs text-gray-400'>To,</p>
            <p className='font-bold text-xs'>{partyData?.name}</p>
            <p className='text-xs text-gray-400'>Phone: {partyData?.contactNumber || "--"}</p>
          </div>
          <div className='w-[200px] h-[90px] rounded border p-2'>
            <p className='text-xs text-gray-400 text-right border-b w-full pb-1'>Date - Date</p>
            {/* <hr /> */}
            <p className='text-xs text-gray-400 text-right'>Total Receivable</p>
            <p className='font-bold text-right'>6000</p>
          </div>
        </div>

        <div className='table__responsive mb-3'>
          <table className='w-full border mt-5'>
            <thead className='bg-gray-100'>
              <tr>
                <td className='p-2'>Date</td>
                <td>Voucher</td>
                <td>Transaction No.</td>
                <td>Credit</td>
                <td>Debit</td>
                <td>Balance</td>
              </tr>
            </thead>
            <tbody className='text-xs'>
              {
                ladgers.map((l, _) => {
                  return <tr className='border-b'>
                    <td className='p-2'>{new Date(l.date).toLocaleDateString()}</td>
                    <td>{l.voucher}</td>
                    <td>{l.transactionNo}</td>
                    <td>{l.credit}</td>
                    <td>{l.debit}</td>
                    <td>{l.balance}</td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </div>
        {/* table end; */}

        <Pagination
          activePage={activePage}
          dataLimit={dataLimit}
          setActivePage={setActivePage}
          totalData={totalData}
        />
      </div>

    </div>
  )
}

export default Ladger;
