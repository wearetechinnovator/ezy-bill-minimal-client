import SideNav from '../components/SideNav'
import Nav from '../components/Nav'
import { SelectPicker } from 'rsuite';
import { MdUploadFile } from "react-icons/md";
import { LuFileX2 } from "react-icons/lu";
import { countryList, statesAndUTs } from '../helper/data';
import { useEffect, useState } from 'react';
import checkfile from '../helper/checkfile'
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie'
import { Icons } from '../helper/icons';



const Setting = () => {
  const toast = useMyToaster();
  const [companyData, setCompanyData] = useState({
    name: '', phone: '', email: '', gst: '', pan: '', invoiceLogo: '', signature: '',
    address: '', country: '', state: '', purchaseInitial: '', poInitial: '', invoiceInitial: '',
    proformaInitial: '', purchaseNextCount: '', expireReminder: "", poNextCount: '', invoiceNextCount: '', proformaNextCount: '',
    salesReminder: '', purchaseReminder: '', quotationInitial: '', creditNoteInitial: '',
    deliverChalanInitial: '', salesReturnInitial: '', quotationCount: '', creditNoteCount: '',
    salesReturnCount: '', deliveryChalanCount: '', logoFileName: '', signatureFileName: "",
    city: '', pin: ''
  })
  const token = Cookies.get("token");



  // Get Company Details;
  useEffect(() => {
    (async () => {
      try {
        const url = process.env.REACT_APP_API_URL + "/company/get";
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token })
        });
        const res = await req.json();
        setCompanyData({ ...res })

      } catch (error) {
        console.log(error)
      }
    })()
  }, [])



  const fileUpload = async (e, field) => {
    const validatefile = await checkfile(e.target.files[0]);
    if (typeof (validatefile) !== "boolean") {
      return toast("invalid file type. Only JPG, PNG, JPEG supported", 'error');
    }


    else if (field === "invoiceLogo") {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        setCompanyData({ ...companyData, invoiceLogo: reader.result, logoFileName: e.target.files[0].name });
      }
    }

    else if (field === "signutre") {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        setCompanyData({ ...companyData, signature: reader.result, signatureFileName: e.target.files[0].name });
      }
    }
  }

  const removeUpload = (field) => {
    if (field === "logoFileName") {
      setCompanyData({ ...companyData, logoFileName: "", invoiceLogo: "" });
    } else if (field === "signatureFileName") {
      setCompanyData({ ...companyData, signatureFileName: "", signature: "" });
    }
  }


  const updateCompany = async () => {
    if ([companyData.name, companyData.address, companyData.phone,
    companyData.email, companyData.gst, companyData.pan, companyData.state, companyData.country
    ].some((field) => field === "")) {
      return toast("fill the require", "error")
    }

    try {
      const updateCompanyData = { ...companyData, update: true, token: Cookies.get("token") };
      const url = process.env.REACT_APP_API_URL + "/company/add";
      const req = await fetch(url, {
        method: "POST",
        body: JSON.stringify(updateCompanyData),
        headers: {
          "Content-Type": 'application/json'
        }
      });
      const res = await req.json();
      if (req.status !== 200 || res.update === false) {
        return toast(res.err, 'error')
      }

      document.location.reload();
      return toast(res.msg, 'success')

    } catch (error) {
      return toast("Something went wrong", "warning")
    }

  }


  return (
    <>
      <Nav title={"Site/Business"} />
      <main id='main'>
        <SideNav />
        <div className='content__body' id='Settings'>
          <div className="content__body__main bg-white">
            <p className='font-bold'>Company Creation</p>
            <hr />
            <div className='flex flex-col gap-2'>
              <div className='forms grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5'>
                {/* first col */}
                <div className='flex flex-col gap-2'>
                  <div>
                    <p>Company Name</p>
                    <input type="text"
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      value={companyData.name}
                    />
                  </div>
                  <div>
                    <p>Company Phone</p>
                    <input type="text" onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      value={companyData.phone} />
                  </div>
                  <div>
                    <p>Company Email</p>
                    <input type="text" onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      value={companyData.email} />
                  </div>
                  <div>
                    <p>GST</p>
                    <input type="text" onChange={(e) => setCompanyData({ ...companyData, gst: e.target.value })}
                      value={companyData.gst} />
                  </div>
                  <div>
                    <p>PAN</p>
                    <input type="text" onChange={(e) => setCompanyData({ ...companyData, pan: e.target.value })}
                      value={companyData.pan} />
                  </div>
                </div>
                {/* Second col */}
                <div className='flex flex-col gap-2'>
                  <div>
                    <p>
                      Bill/Invoice Logo
                      <span className='text-[10px] ml-2'>
                        Only JPG, PNG and JPEG file supported,
                      </span>
                      <span className='text-[10px] ml-2'>
                        Maximum file size 1MB
                      </span>
                    </p>
                    <div className='file__uploader__div'>
                      <span className='file__name'>{companyData.logoFileName}</span>
                      <div className="flex gap-2">
                        <input type="file" id="invoiceLogo" className='hidden' onChange={(e) => fileUpload(e, 'invoiceLogo')} />
                        <label htmlFor="invoiceLogo" className='file__upload' title='Upload'>
                          <MdUploadFile />
                        </label>
                        {
                          companyData.logoFileName && <LuFileX2 className='remove__upload ' title='Remove upload'
                            onClick={() => removeUpload('logoFileName')} />
                        }
                      </div>
                    </div>
                  </div>
                  <div>
                    <p>
                      Authority Signature
                      <span className='text-[10px] ml-2'>
                        Only JPG, PNG and JPEG file supported,
                      </span>
                      <span className='text-[10px] ml-2'>
                        Maximum file size 1MB
                      </span>
                    </p>
                    <div className='file__uploader__div'>
                      <span className='file__name'>{companyData.signatureFileName}</span>
                      <div className="flex gap-2">
                        <input type="file" id="signutre" className='hidden' onChange={(e) => fileUpload(e, 'signutre')} />
                        <label htmlFor="signutre" className='file__upload' title='Upload'>
                          <MdUploadFile />
                        </label>
                        {
                          companyData.signatureFileName && <LuFileX2 className='remove__upload' title='Remove upload'
                            onClick={() => removeUpload('signatureFileName')} />
                        }
                      </div>
                    </div>
                  </div>
                  <div>
                    <p>Company Address</p>
                    <textarea rows={1}
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    ></textarea>
                  </div>
                  <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                    <div className='w-full'>
                      <p>Select Country</p>
                      <SelectPicker className='w-full' data={countryList}
                        value={companyData.country} onChange={(v) => setCompanyData({ ...companyData, country: v })} />
                    </div>
                    <div className='w-full'>
                      <p>Select State</p>
                      <SelectPicker className='w-full' data={statesAndUTs}
                        value={companyData.state} onChange={(v) => setCompanyData({ ...companyData, state: v })} />
                    </div>
                  </div>
                  <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                    <div className='w-full'>
                      <p>City</p>
                      <input className='w-full'
                        value={companyData.city}
                        onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                      />
                    </div>
                    <div className='w-full'>
                      <p>PIN</p>
                      <input className='w-full'
                        value={companyData.pin}
                        onChange={(e) => setCompanyData({ ...companyData, pin: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='overflow-x-auto mt-5'>
                <table className='table-style w-full'>
                  <thead className='bg-gray-200 h-[30px]'>
                    <tr>
                      <th>Purchase Initial</th>
                      <th>PO Initial</th>
                      <th>Sales Initial</th>
                      <th>Proforma Initial</th>
                      <th>Quotation Initial</th>
                      <th>Credit Note Initial</th>
                      <th>Sales Return Initial</th>
                      <th>Deliver Chalan Initial</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, purchaseInitial: e.target.value })}
                          value={companyData.purchaseInitial} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, poInitial: e.target.value })}
                          value={companyData.poInitial} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, invoiceInitial: e.target.value })}
                          value={companyData.invoiceInitial} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, proformaInitial: e.target.value })}
                          value={companyData.proformaInitial} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, quotationInitial: e.target.value })}
                          value={companyData.quotationInitial} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, creditNoteInitial: e.target.value })}
                          value={companyData.creditNoteInitial} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, salesReturnInitial: e.target.value })}
                          value={companyData.salesReturnInitial} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, deliverChalanInitial: e.target.value })}
                          value={companyData.deliverChalanInitial} />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className='bg-gray-200 h-[30px]'>
                      {
                        Array.from({ length: 8 }).map((_, i) => <th key={i}>Next Count</th>)
                      }
                    </tr>
                    <tr>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, purchaseNextCount: e.target.value })}
                          value={companyData.purchaseNextCount} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, poNextCount: e.target.value })}
                          value={companyData.poNextCount} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, invoiceNextCount: e.target.value })}
                          value={companyData.invoiceNextCount} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, proformaNextCount: e.target.value })}
                          value={companyData.proformaNextCount} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, quotationCount: e.target.value })}
                          value={companyData.quotationCount} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, creditNoteCount: e.target.value })}
                          value={companyData.creditNoteCount} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, salesReturnCount: e.target.value })}
                          value={companyData.salesReturnCount} />
                      </td>
                      <td className='min-w-[150px]'>
                        <input type="text" onChange={(e) => setCompanyData({ ...companyData, deliveryChalanCount: e.target.value })}
                          value={companyData.deliveryChalanCount} />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="w-full flex flex-col lg:flex-row gap-2 lg:gap-5">
                <div className='w-full'>
                  <p>Sales Invoice Reminder (Days Before)</p>
                  <input type="text" onChange={(e) => setCompanyData({ ...companyData, salesReminder: e.target.value })}
                    value={companyData.salesReminder} />
                </div>
                <div className='w-full'>
                  <p>Purchase Invoice Reminder (Days Before)</p>
                  <input type="text" onChange={(e) => setCompanyData({ ...companyData, purchaseReminder: e.target.value })}
                    value={companyData.purchaseReminder} />
                </div>
                <div className='w-full'>
                  <p>Expire Reminder (Days Before)</p>
                  <input type="text" onChange={(e) => setCompanyData({ ...companyData, expireReminder: e.target.value })}
                    value={companyData.expireReminder} />
                </div>
              </div>
              <div className='w-full flex justify-center gap-3 my-3'>
                <button
                  onClick={updateCompany}
                  className='bg-green-500 hover:bg-green-400 text-md text-white rounded w-[80px] flex items-center justify-center gap-1 py-2
                  '>
                  <Icons.CHECK />
                  Update
                </button>
                <button className='bg-blue-800 hover:bg-blue-700 text-md text-white rounded w-[70px] flex items-center justify-center gap-1 py-2'>
                  <Icons.RESET />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Setting