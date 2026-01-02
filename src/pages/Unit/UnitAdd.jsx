import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav'
import { FaRegCheckCircle } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import useMyToaster from '../../hooks/useMyToaster';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';


const UnitAdd = ({ mode }) => {
    const toast = useMyToaster();
    const [form, setForm] = useState({ title: '', details: '' });
    const { id } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        if (mode) {
            const get = async () => {
                const url = process.env.REACT_APP_API_URL + "/unit/get";
                const cookie = Cookies.get("token");

                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token: cookie, id: id })
                })
                const res = await req.json();
                setForm({ ...form, ...res.data });
            }

            get();
        }
    }, [mode])

    const saveData = async (e) => {
        if (form.title === "") {
            return toast("fill the blank", "error")
        }

        try {
            const url = process.env.REACT_APP_API_URL + "/unit/add";
            const token = Cookies.get("token");
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(!mode ? { ...form, token } : { ...form, token, update: true, id: id })
            })
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            if (!mode) {
                setForm({ title: "", details: '' });
            }

            toast(!mode ? "Unit create success" : "Unit update success", 'success');
            navigate('/admin/unit');
            return


        } catch (error) {
            return toast("Something went wrong", "error")
        }

    }


    const clearData = (e) => {
        setForm({
            title: '',
        })
    }

    return (
        <>
            <Nav title={mode ? "Update Unit" : "Add Unit"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main bg-white '>
                        <div className=' flex-col lg:flex-row'>
                            <div className='w-full'>
                                <div className='p-2'>
                                    <p className='pb-1'>Title <span className='required__text'>*</span></p>
                                    <input type='text' onChange={(e) => setForm({ ...form, title: e.target.value })} value={form.title} />
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-center pt-9 mb-6'>
                            <div className='flex rounded-sm bg-green-500 text-white'>
                                <FaRegCheckCircle className='mt-3 ml-2' />
                                <button className='p-2' onClick={saveData}>{mode ? "Update" : 'Save'}</button>
                            </div>
                            <div className='flex rounded-sm ml-4 bg-blue-500 text-white'>
                                <LuRefreshCcw className='mt-3 ml-2' />
                                <button className='p-2' onClick={clearData}>Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default UnitAdd