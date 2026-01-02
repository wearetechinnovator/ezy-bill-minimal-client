import Nav from '../../components/Nav'
import SideNav from '../../components/SideNav'
import useApi from '../../hooks/useApi'
import BarCodeModal from '../../components/BarCodeModal'
import { useNavigate, useParams } from 'react-router-dom'
import { use, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { toggleBarCodeModal } from '../../store/barcodeModalSlice'
import { Icons } from '../../helper/icons'
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';



const Details = () => {
  const toast = useMyToaster()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState();
  const { getApiData } = useApi();
  const [tax, setTax] = useState();
  const [purchaseInvoice, setPurchaseInvoice] = useState([]);
  const [purchaseInvoiceLoading, setPurchaseInvoiceLoading] = useState(false);
  const userDetails = useSelector((store) => store.userDetail);
  const [expireReminder, setExpireReminder] = useState(null);



  // Get Expire Reminder
  useEffect(() => {
    const activeCompany = userDetails?.activeCompany;
    const companyData = userDetails?.companies?.find(c => c._id === activeCompany);
    setExpireReminder(parseInt(companyData?.expireReminder));
  }, [userDetails])


  // Get Items and Tax
  useEffect(() => {
    (async () => {
      const item = await getApiData("item", id);
      const tax = await getApiData("tax", item?.data?.tax);
      setTax(tax.data.title);
      setData(item.data);
    })()
  }, [])



  // Get Purchase Inoice
  useEffect(() => {
    (async () => {
      setPurchaseInvoiceLoading(true);

      try {
        const payload = {
          token: Cookies.get("token"),
          itemId: id
        }
        const url = process.env.REACT_APP_API_URL + `/item/get-purchase-invoice`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const res = await req.json();
        setPurchaseInvoiceLoading(false);

        if (req.status === 200) {
          setPurchaseInvoice(res);
        }


      } catch (error) {
        console.log(error);
        setPurchaseInvoiceLoading(false);
        return toast("Something went wrong", 'error')
      }
    })()
  }, [])



  // Diffrance Date then get Expire days;
  const getExpiryStatus = (expireDate) => {
    const today = new Date();
    const exp = new Date(expireDate);

    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);

    const diff = exp - today;
    const days = Math.round(diff / (1000 * 60 * 60 * 24));

    let status = "";

    if (days === 0) status = "Today";
    else if (days < 0) status = "Expired";
    else status = `${days} days`;

    return { status, days };
  };



  return (
    <>
      <Nav title={"Item Details"} />
      <BarCodeModal data={data} />
      <main id='main'>
        <SideNav />

        <div className="content__body flex flex-col">
          <div className='content__body__main'>
            <div className='details__header'>
              <p><Icons.INVOICE /> General Details</p>
              <Icons.PENCIL
                onClick={() => navigate(`/admin/item/edit/${id}`)}
                className='pencil' />
            </div>
            <hr />

            <div className='flex flex-col md:flex-row gap-2 pl-4'>
              <div className='flex flex-col text-xs w-full gap-5'>
                <div>
                  <p className='text-gray-600 text-sm'>Item name</p>
                  <p>{data?.title}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>GST Tax (%)</p>
                  <p>{tax}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Sale Price</p>
                  <p>
                    {data?.salePrice || '--'}
                    <sub>{data?.saleTaxType === '0' ? ' Without Tax' : ' With Tax'}</sub>
                  </p>
                </div>
              </div>
              {/* First Column Close */}

              <div className='flex flex-col text-xs w-full gap-5'>
                <div>
                  <p className='text-gray-600 text-sm'>Type</p>
                  <p>{data?.type || "--"}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>HSN</p>
                  <p>{data?.hsn || "--"}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Purchase Price</p>
                  <p>
                    {data?.purchasePrice || "--"}
                    <sub>{data?.purchaseTaxType === '0' ? ' Without Tax' : ' With Tax'}</sub>
                  </p>
                </div>
              </div>
              {/* Second Column Close */}

              <div className='flex flex-col text-xs w-full gap-5'>
                <div>
                  <p className='text-gray-600 text-sm'>Category</p>
                  <p>{data?.category?.title || "--"}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Item Code</p>
                  <p>{data?.itemCode || "--"}</p>
                </div>
                <div>
                  {data?.itemCode && <button
                    className='bg-blue-500 hover:bg-blue-600 uppercase px-3 py-1 rounded-full text-white text-xs'
                    onClick={() => {
                      dispatch(toggleBarCodeModal(true));
                    }}
                  >
                    View Barcode
                  </button>}
                </div>
              </div>
              {/* Last Column Close */}

            </div>
          </div>

          {/* ================================= [Item's Purchase Table] ============================= */}
          {/* ======================================================================================= */}
          <div className='content__body__main mt-4'>
            <div className='details__header'>
              <p><Icons.INVOICE /> Item's Purchase Bill </p>
            </div>
            <hr />
            <div className='item__details__table'>
              <table>
                <thead>
                  <tr>
                    <td>Invoice No.</td>
                    <td>Invoice Date</td>
                    <td>Expire Date</td>
                    <td align='center'>Qun Left</td>
                  </tr>
                </thead>
                <tbody>
                  {
                    purchaseInvoice.map((p, i) => {
                      const item = p.items.find(i => i.itemId === id);
                      const expire = getExpiryStatus(item.expireDate.split("T")[0]);
                      return (
                        <tr key={i}>
                          <td>{p.purchaseInvoiceNumber}</td>
                          <td>{p.invoiceDate.split("T")[0]}</td>
                          <td>
                            {item.expireDate.split("T")[0]}
                            <span className={`${expire.days < 0 ? 'bg-red-600' : (expire.days <= expireReminder ? 'bg-yellow-600' : 'bg-blue-400')} badge ml-2`}>
                              {expire.status}
                            </span>
                          </td>
                          <td align='center'>{item.qunLeft} <sub>{item.selectedUnit}</sub></td>
                        </tr>
                      );
                    })
                  }
                  {
                    !purchaseInvoiceLoading ? purchaseInvoice.length < 1 && (
                      <tr>
                        <td colSpan={4} align='center' className='text-[15px] text-gray-400 uppercase'>
                          No Invoice found
                        </td>
                      </tr>
                    ): <tr>
                        <td colSpan={4} align='center' className='text-[14px] text-blue-400 uppercase'>
                          Loading...
                        </td>
                      </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Details;
