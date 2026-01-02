import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { SelectPicker } from 'rsuite';
import useApi from '../../hooks/useApi';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';



// --- PAYMENT IN ---
const AddPayment = ({ mode }) => {


  return (
    <>
      <Nav title={"Add Payment"} />
      <main id='main'>
        <SideNav />
        <div className='content__body'>
          <AddPaymentInComponent mode={mode} />
        </div>
      </main>

    </>
  )
}

const AddPaymentInComponent = ({ mode, partyId, invoiceNumber, due }) => {
  const navigate = useNavigate();
  const { getApiData } = useApi();
  const toast = useMyToaster();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    party: partyId || "", paymentInNumber: "", paymentInDate: "", paymentMode: "", account: "",
    amount: "", details: "", invoiceId: ''
  })
  // const [dueAmount, setDueAmount] = useState(null);

  // Store party
  // const [party, setParty] = useState([]);
  // Store account
  const [account, setAccount] = useState([]);
  // Store invoice number
  const [invoice, setInvoice] = useState([]);
  // invoice data
  const [invoiceData, setInvoiceData] = useState([]);
  let [checkedInv, setCheckedInv] = useState([]);
  let [tempAmount, setTempAmount] = useState(0);



  useEffect(() => {
    if (formData.amount) {
      let totalSelected = 0;
      for (const item of checkedInv) {
        totalSelected += parseInt(item.dueAmount, 10);
      }
      const remaining = parseInt(formData.amount, 10) - totalSelected;

      setTempAmount(remaining);
    }
  }, [formData.amount, checkedInv]);


  // Get invoice
  useEffect(() => {
    const getInvoice = async () => {
      try {
        const url = process.env.REACT_APP_API_URL + "/salesinvoice/get";
        const cookie = Cookies.get("token");

        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: cookie, invoice: true, party: formData.party })
        })
        const res = await req.json();
        const inv = res.data.map((inv) => ({
          value: inv.salesInvoiceNumber, label: inv.salesInvoiceNumber,
          due: inv.dueAmount
        }));
        console.log(res.data);
        setInvoiceData([...res.data]);
        setInvoice([...inv])

      } catch (error) {
        console.log(error);
        return toast("Something went wrong", "error");
      }
    }

    getInvoice();

  }, [formData.party])



  // Get data for update mode
  useEffect(() => {
    if (mode) {
      const get = async () => {
        const res = await getApiData("paymentin", id);
        setFormData({ ...formData, ...res.data, paymentInDate: res.data.paymentInDate.split('T')[0] });
      }
      get();
    }
  }, [mode])


  useEffect(() => {
    const apiData = async () => {
      // {
      //   const data = await getApiData("party");
      //   const party = data.data.map(d => ({ label: d.name, value: d._id }));
      //   setParty([...party]);
      // }
      {
        const data = await getApiData("account");
        const account = data.data.map(d => ({ label: d.title, value: d._id }));
        setAccount([...account])
      }
    }

    apiData();
  }, [])



  const savePayment = async () => {
    if (formData.party === "") {
      return toast("Please select a party", "error");
    } else if (formData.paymentInNumber === "") {
      return toast("Please enter a payment number", "error");
    } else if (formData.paymentInDate === "") {
      return toast("Please select a payment date", "error");
    } else if (formData.paymentMode === "") {
      return toast("Please select a payment mode", "error");
    } else if (formData.account === "") {
      return toast("Please select an account", "error");
    }

    if (checkedInv.length <= 0) {
      return toast("Select invoice", 'error');
    }


    try {
      const url = process.env.REACT_APP_API_URL + "/paymentin/add";
      const token = Cookies.get("token");

      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          !mode ? { ...formData, token, checkedInv }
            : { ...formData, token, update: true, id: id, checkedInv }
        )
      });
      const res = await req.json();
      if (req.status !== 200 || res.err) {
        return toast(res.err, 'error');
      }

      if (mode) {
        toast('Payment update successfully', 'success');
        navigate(-1);
        return;
      }

      clear();

      toast('Payment add successfully', 'success');
      navigate('/admin/payment-in');
      return


    } catch (error) {
      console.log(error);
      return toast('Something went wrong', 'error')
    }

  }

  const clear = () => {
    setFormData({
      party: "", paymentInNumber: "", paymentInDate: "", paymentMode: "", account: "",
      amount: "", details: "", invoiceId: ''
    })
  }


  // On check satelment;
  const handleSettlement = (e, inv) => {
    const { checked } = e.target;
    const due = parseInt(inv.dueAmount);

    if (checked) {
      if (tempAmount <= 0) {
        toast("No amount left to allocate", "error");
        e.preventDefault();
        e.target.checked = false;
        return;
      }

      const alloc = Math.min(tempAmount, due);

      const updatedCheckedInv = [...checkedInv, { ...inv, allocated: alloc }];
      setCheckedInv(updatedCheckedInv);
      setTempAmount(tempAmount - alloc);
    }
    else {
      const existing = checkedInv.find((d) => d._id === inv._id);
      const updatedCheckedInv = checkedInv.filter((d) => d._id !== inv._id);

      if (existing) {
        setTempAmount(tempAmount + existing.allocated);
      }

      setCheckedInv(updatedCheckedInv);
    }
  };

  return <>
    <div className='content__body__main bg-white'>
      <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-0'>
        {/* First Column */}
        <div className='flex flex-col gap-2'>
          <div>
            <p className='mb-1'>Select Party</p>
            <MySelect2
              model={"party"}
              partyType={"customer"}
              onType={(v) => {
                setFormData({ ...formData, party: v })
              }}
              value={formData.party}
            />
          </div>

          <div>
            <p className='mb-1'>Amount</p>
            <input type='text'
              value={formData.amount}
              onChange={
                checkedInv.length > 0 ? null :
                  (e) => setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>

          <div>
            <p className='mb-1'>Payment in Number</p>
            <input type='text'
              value={formData.paymentInNumber}
              onChange={(e) => setFormData({
                ...formData, paymentInNumber: e.target.value
              })}
            />
          </div>
        </div>

        {/* Second Column */}
        <div className='flex flex-col gap-2'>
          <div>
            <p className='mb-1'>Payment in Date</p>
            <input type="date"
              onChange={(e) => {
                setFormData({ ...formData, paymentInDate: e.target.value })
              }}
              value={formData.paymentInDate}
              className='w-full'
            />
          </div>
          <div>
            <p className='mb-1'>Payment Mode</p>
            <select name="mode" id=""
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}>
              <option value="">--Select--</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          {formData.paymentMode !== 'cash' && <div>
            <p className='mb-1'>Account</p>
            <SelectPicker className='w-full'
              data={account}
              onChange={(v) => setFormData({ ...formData, account: v })}
              value={formData.account}
            />
          </div>}
        </div>
      </div>
    </div>
    {/* ::::::::::::::::::::::::::::::::::::::::::::: */}
    {/* :::::::::::::::::: [SETELMENT] :::::::::::::: */}
    {/* ::::::::::::::::::::::::::::::::::::::::::::: */}
    <div className='content__body__main mt-3'>
      <table className='w-full border'>
        <thead className='bg-gray-200'>
          <tr >
            <td></td>
            <td className='p-2 font-medium'>Date</td>
            <td className='font-medium'>Invoice Number</td>
            <td className='font-medium'>Invoice Amount</td>
            {/* <td className='font-medium'>Invoice Amount Settled</td> */}
            <td className='font-medium'>TDS Amount</td>
          </tr>
        </thead>
        <tbody>
          {
            invoiceData.length > 0 ? invoiceData.map((inv, i) => {
              return (
                <tr key={i} className='border-gray-300'>
                  <td className='p-2 max-w-2'>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSettlement(e, inv)}
                    />
                  </td>
                  <td>{inv.invoiceDate.split('T')[0]}</td>
                  <td>{inv.salesInvoiceNumber}</td>
                  {/* <td>{inv.amount || 0}</td> */}
                  <td>{inv.dueAmount || 0}</td>
                  <td>{inv.tdsAmount || 0}</td>
                </tr>
              )
            }) : <tr className='text-center'>
              <td colSpan={5} className='py-5 text-gray-500 font-bold'>No Invoice found</td>
            </tr>
          }
        </tbody>
      </table>

      <div className='w-full flex justify-end gap-3 mt-3'>
        <button
          onClick={savePayment}
          className='bg-green-500 hover:bg-green-400 save__and__reset__btns'>
          <Icons.CHECK />
          {!mode ? "Save" : "Update"}
        </button>
        <button
          onClick={clear}
          className='bg-blue-800 hover:bg-blue-700 save__and__reset__btns'>
          <Icons.RESET />
          Reset
        </button>
      </div>
    </div>
    {/* Salement div close here */}
  </>
}

export {
  AddPaymentInComponent
}
export default AddPayment;