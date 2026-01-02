import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav'
import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FaRegCheckCircle } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';





const AddAccount = ({ mode }) => {
    const toast = useMyToaster();
    const { id } = useParams();
    const [from, setForm] = useState({
        title: '', accountName: '', accountNumber: '', ifscCode: '', bankName: '', openingBalance: '',
        type: '', details: ''
    })
    const navigate = useNavigate()



    // Get data for update mode
    useEffect(() => {
        if (mode) {
            const get = async () => {
                const url = process.env.REACT_APP_API_URL + "/account/get";
                const cookie = Cookies.get("token");

                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token: cookie, id: id })
                })
                const res = await req.json();
                setForm({ ...from, ...res.data });

            }

            get();
        }
    }, [mode])



    const saveData = async (e) => {
        if (from.title === "" || from.type === "") {
            return toast("fill the blank", "error")
        }

        try {
            const url = process.env.REACT_APP_API_URL + "/account/add";
            const token = Cookies.get("token");

            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(!mode ? { ...from, token } : { ...from, token, update: true, id: id })
            })

            const res = await req.json();

            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            if (mode) {
                return toast("Account updated successfully", 'success')
            }


            toast("Account created successfully", 'success')
            navigate("/admin/account")
            clearData()
            return;



        } catch (error) {
            console.log(error)
            toast("Something went wrong", "error")
        }

    }

    const clearData = (e) => {
        setForm({
            title: '', accountName: '', accountNumber: '', ifscCode: '',
            bankName: '', openingBalance: '', type: ''
        })
    }

    return (
        <>
            <Nav title={"Account"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main bg-white '>
                        <div className='flex justify-between gap-6  flex-col lg:flex-row'>
                            <div className='w-full'>
                                <div className='p-2'>
                                    <p className='pb-1'>Title</p>
                                    <input type='text' onChange={(e) => setForm({ ...from, title: e.target.value })} value={from.title} />
                                </div>
                                <div className='p-2'>
                                    <p className='pb-1'>Account Holder Name (If Bank)</p>
                                    <input type='text' onChange={(e) => setForm({ ...from, accountName: e.target.value })} value={from.accountName} />
                                </div>
                                <div className='p-2'>
                                    <p className='pb-1'>Account Number (If Bank)</p>
                                    <input type="number" onChange={(e) => setForm({ ...from, accountNumber: e.target.value })} value={from.accountNumber} />
                                </div>
                            </div>
                            <div className='w-full'>
                                <div className='p-2'>
                                    <p className='pb-1'>IFSC Code (If Bank)</p>
                                    <input type='text' onChange={(e) => setForm({ ...from, ifscCode: e.target.value })} value={from.ifscCode} />
                                </div>
                                <div className='p-2'>
                                    <p className='pb-1'>Bank Name (If Bank)</p>
                                    <input type='text' onChange={(e) => setForm({ ...from, bankName: e.target.value })} value={from.bankName} />
                                </div>
                                <div className='p-2'>
                                    <p className='pb-1'>Opening Balance</p>
                                    <input type="text" onChange={(e) => setForm({ ...from, openingBalance: e.target.value })} value={from.openingBalance} />
                                </div>
                                <div className='ml-2 pt-2 '>
                                    <p className='pb-2'>Type</p>
                                    <select onChange={(e) => setForm({ ...from, type: e.target.value })} value={from.type} >
                                        <option value={""}>
                                            --Select--
                                        </option>
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-center pt-9 mb-6'>
                            <button
                                className='p-2 flex rounded-sm bg-green-500 text-white items-center gap-2'
                                onClick={saveData}>
                                <FaRegCheckCircle />
                                {mode ? "Update" : "Save"}
                            </button>

                            <button className='p-2 flex rounded-sm ml-4 bg-blue-500 text-white items-center gap-2'
                                onClick={clearData}>
                                <LuRefreshCcw />
                                Reset
                            </button>
                            {/* <div className="flex rounded-sm ml-4 bg-gray-500 text-white">
                                 <IoMdArrowRoundBack />
                                 <button className='p-2'>Back</button>
                             </div>*/}
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default AddAccount