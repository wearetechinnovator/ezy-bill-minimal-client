import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { SelectPicker, DatePicker, Button } from 'rsuite';
import { FaRegCheckCircle } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import { IoMdArrowRoundBack } from "react-icons/io";
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';


const TransactionAdd = ({ mode }) => {
  const { getApiData } = useApi();
  const [inputval, setInputval] = useState({
    transactionType: '', purpose: '', transactionNumber: '', transactionDate: '',
    paymentMode: '', account: '', amount: '', note: ''
  })
  // Store account
  const [account, setAccount] = useState([]);
  const toast = useMyToaster();
  const { id } = useParams();
  const navigate = useNavigate();



  useEffect(() => {
    if (mode) {
      const get = async () => {
        const url = process.env.REACT_APP_API_URL + "/other-transaction/get";
        const cookie = Cookies.get("token");

        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: cookie, id: id })
        })
        const res = await req.json();
        console.log(res)
        setInputval({ ...inputval, ...res.data });
      }

      get();
    }
  }, [mode])


  useEffect(() => {
    const apiData = async () => {
      {
        const data = await getApiData("account");
        const account = data.data.map(d => ({ label: d.title, value: d._id }));
        setAccount([...account])
      }
    }

    apiData();
  }, [])


  const saveTransaction = async (e) => {
    if (inputval.transactionType === "" || inputval.purpose === "" || inputval.transactionNumber === "" ||
      inputval.transactionDate === "" || inputval.paymentMode === "" || inputval.account === "" || inputval.amount === "") {
      return toast("fill the blank", "error");
    }

    try {
      const url = process.env.REACT_APP_API_URL + "/other-transaction/add";
      const token = Cookies.get("token");

      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(!mode ? { ...inputval, token } : { ...inputval, token, update: true, id: id })
      })
      const res = await req.json();
      if (req.status !== 200 || res.err) {
        return toast(res.err, 'error');
      }

      if (mode) {
        return toast('Transaction update successfully', 'success');
      }

      clearForm();
      
      toast('Transaction add successfully', 'success');
      navigate("/admin/other-transaction")
      return 


    } catch (error) {
      console.log(error);
      return toast('Something went wrong', 'error')
    }

  }

  const clearForm = () => {
    setInputval({
      transactionType: '', purpose: '', transactionNumber: '', transactionDate: '',
      paymentMode: '', account: '', amount: '', note: ''
    })
  }



  return (
    <>
      <Nav title={mode ? "Edit transations" : "Add transations"} />
      <main id="main">
        <SideNav />
        <div className='content__body '>
          <div className='content__body__main bg-white' >
            <div className='flex justify-between gap-4 flex-col lg:flex-row'>
              <div className='w-full'>
                <div>
                  <p className='ml-1 mb-1'> Select Transaction Type</p>
                  <select
                    onChange={(e) => {
                      setInputval({ ...inputval, transactionType: e.target.value })
                    }}
                    value={inputval.transactionType}
                  >
                    <option value="">--Select Type--</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <p className='ml-1 mb-1 mt-2'>Purpose</p>
                  <input type='text' onChange={(e) => setInputval({ ...inputval, purpose: e.target.value })}
                    value={inputval.purpose} />
                </div>
                <div>
                  <p className='ml-1 mb-1 mt-2'>Transaction Number</p>
                  <input type='number' onChange={(e) => setInputval({ ...inputval, transactionNumber: e.target.value })}
                    value={inputval.transactionNumber} />
                </div>
                <div>
                  <p className='ml-1 mb-1 mt-2'>Transaction Date</p>
                  <input type='date' onChange={(e) => setInputval({ ...inputval, transactionDate: e.target.value })}
                    value={inputval.transactionDate} />
                </div>
              </div>
              <div className='w-full'>
                <div>
                  <p className='ml-1 mb-1'>Payment Mode</p>
                  <select
                    onChange={(e) => {
                      setInputval({ ...inputval, paymentMode: e.target.value })
                    }}
                    value={inputval.paymentMode}
                  >
                    <option value="">--Select Type--</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div >
                  <p className='ml-1 mb-1 mt-2'>Account</p>
                  <SelectPicker className='w-full'
                    onChange={(v) => setInputval({ ...inputval, account: v })}
                    data={account}
                    value={inputval.account}
                  />
                </div>
                <div>
                  <p className='ml-1 mb-1 mt-2'>Amount</p>
                  <input type='number' onChange={(e) =>
                    setInputval({ ...inputval, amount: e.target.value })}
                    value={inputval.amount} />
                </div>
                <div>
                  <p className='ml-1 mb-1 mt-2'>Note/Remark</p>
                  <input type='text' onChange={(e) =>
                    setInputval({ ...inputval, note: e.target.value })}
                    value={inputval.note} />
                </div>
              </div>
            </div>
            <div className='flex justify-center pt-9 mb-6'>
              <div className='flex rounded-sm bg-green-500 text-white'>
                <FaRegCheckCircle className='mt-3 ml-2' />
                <button className='p-2' onClick={saveTransaction}>{mode ? "Update" : "Save"}</button>
              </div>
              <div className='flex rounded-sm ml-4 bg-blue-500 text-white'>
                <LuRefreshCcw className='mt-3 ml-2' />
                <button className='p-2' onClick={clearForm}>Reset</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default TransactionAdd;

