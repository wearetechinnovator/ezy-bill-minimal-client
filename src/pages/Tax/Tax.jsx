import React, { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { MdEditSquare, MdFilterList } from "react-icons/md";
import { IoInformationCircle } from "react-icons/io5";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { MdOutlineRestorePage } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import downloadPdf from '../../helper/downloadPdf';
import Cookies from 'js-cookie';
import useMyToaster from '../../hooks/useMyToaster';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdMore } from 'react-icons/io';
import { Popover, Whisper } from 'rsuite';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';



const Tax = ({ mode }) => {
  const toast = useMyToaster();
  const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
  const [activePage, setActivePage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalData, setTotalData] = useState()
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const [taxData, settaxData] = useState([]);
  const tableRef = useRef(null);
  const [tableStatusData, setTableStatusData] = useState('active');
  const exportData = useMemo(() => {
    return taxData && taxData.map(({ title }) => ({
      Title: title
    }));
  }, [taxData]);
  const [loading, setLoading] = useState(true);


  // Get data;
  useEffect(() => {
    const getParty = async () => {
      try {
        const data = {
          token: Cookies.get("token"),
          trash: tableStatusData === "trash" ? true : false,
          all: tableStatusData === "all" ? true : false
        }
        const url = process.env.REACT_APP_API_URL + `/tax/get?page=${activePage}&limit=${dataLimit}`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(data)
        });
        const res = await req.json();
        setTotalData(res.totalData)
        settaxData([...res.data]);
        setLoading(false)

      } catch (error) {
        console.log(error)
      }
    }
    getParty();
  }, [tableStatusData, dataLimit, activePage])

  const searchTable = (e) => {
    const value = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.list__table tbody tr');

    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      let found = false;
      cols.forEach((col, index) => {
        if (index !== 0 && col.innerHTML.toLowerCase().includes(value)) {
          found = true;
        }
      });
      if (found) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  const selectAll = (e) => {
    if (e.target.checked) {
      setSelected(taxData.map((d, _) => d._id));
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((i, _) => i !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };


  const exportTable = async (whichType) => {
    if (whichType === "copy") {
      copyTable("listOfTax"); // Pass tableid
    }
    else if (whichType === "excel") {
      downloadExcel(exportData, 'tax-list.xlsx') // Pass data and filename
    }
    else if (whichType === "print") {
      printTable(tableRef, "Tax List"); // Pass table ref and title
    }
    else if (whichType === "pdf") {
      let document = exportPdf('Tax List', exportData);
      downloadPdf(document)
    }
  }


  const removeData = async (trash) => {
    if (selected.length === 0 || tableStatusData !== 'active') {
      return;
    }
    const url = process.env.REACT_APP_API_URL + "/tax/delete";
    try {
      const req = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids: selected, trash: trash })
      });
      const res = await req.json();

      if (req.status !== 200 || res.err) {
        return toast(res.err, 'error');
      }

      selected.forEach((id, _) => {
        settaxData((prevData) => {
          return prevData.filter((data, _) => data._id !== id)
        })
      });
      setSelected([]);

      return toast(res.msg, 'success');

    } catch (error) {
      console.log(error)
      toast("Something went wrong", "error")
    }
  }



  return (
    <>
      <Nav title={"Tax"} />
      <main id='main'>
        <SideNav />
        <Tooltip id='taxTooltip' />
        <div className='content__body'>
          {/* top section */}
          <div
            className={`mb-5 w-full bg-white rounded p-4 shadow-sm add_new_compnent overflow-hidden
            transition-all
          `}>
            <div className='flex justify-between items-center'>
              <div className='flex flex-col'>
                <select value={dataLimit} onChange={(e) => setDataLimit(e.target.value)}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex w-full flex-col lg:w-[300px]'>
                  <input type='text'
                    placeholder='Search...'
                    onChange={searchTable}
                    className='p-[6px]'
                  />
                </div>
                <button
                  onClick={() => removeData(false)}
                  className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
                  <MdDeleteOutline className='text-lg' />
                  Delete
                </button>
                <button
                  onClick={() => navigate("/admin/tax/add")}
                  className='bg-[#003E32] text-white '>
                  <IoIosAdd className='text-xl text-white' />
                  Add New
                </button>
                <div className='flex justify-end'>
                  <Whisper placement='leftStart' trigger={"click"}
                    speaker={<Popover full>
                      <div className='download__menu' onClick={() => exportTable('print')} >
                        <BiPrinter className='text-[16px]' />
                        Print Table
                      </div>
                      <div className='download__menu' onClick={() => exportTable('copy')}>
                        <FaRegCopy className='text-[16px]' />
                        Copy Table
                      </div>
                      <div className='download__menu' onClick={() => exportTable('pdf')}>
                        <FaRegFilePdf className="text-[16px]" />
                        Download Pdf
                      </div>
                      <div className='download__menu' onClick={() => exportTable('excel')} >
                        <FaRegFileExcel className='text-[16px]' />
                        Download Excel
                      </div>
                    </Popover>}
                  >
                    <div className='record__download' >
                      <IoMdMore />
                    </div>
                  </Whisper>
                </div>
              </div>
            </div>

            <div id='itemFilter'>
            </div>
          </div>
          {
            !loading ? taxData.length > 0 ? <div className='content__body__main'>

              {/* Table start */}
              <div className='overflow-x-auto list__table'>
                <table className='min-w-full bg-white' id='listOfTax' ref={tableRef}>
                  <thead className='list__table__head'>
                    <tr>
                      <th className='py-2 px-4 border-b w-[50px]'>
                        <input type='checkbox' onChange={selectAll} checked={taxData.length > 0 && selected.length === taxData.length} />
                      </th>
                      <th className='py-2 px-4 border-b' >Title</th>
                      <th className='py-2 px-4 border-b w-[70px]'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      taxData.map((data, i) => {
                        return <tr key={i}>
                          <td className='py-2 px-4 border-b max-w-[10px]'>
                            <input type='checkbox' checked={selected.includes(data._id)} onChange={() => handleCheckboxChange(data._id)} />
                          </td>
                          <td className='px-4 border-b' align='center'>{data.title}</td>

                          <td className='px-4 text-center'>
                            <Whisper
                              placement='leftStart'
                              trigger={"click"}
                              speaker={<Popover full>
                                <div
                                  className='table__list__action__icon'
                                  onClick={() => navigate(`/admin/tax/edit/${data._id}`)}
                                >
                                  <FaRegEdit className='text-[16px]' />
                                  Edit
                                </div>
                              </Popover>}
                            >
                              <div className='table__list__action' >
                                <FiMoreHorizontal />
                              </div>
                            </Whisper>
                          </td>
                        </tr >
                      })
                    }
                  </tbody >
                </table >
                <div className='paginate__parent'>
                  <p>Showing {taxData.length} of {totalData} entries</p>
                  {/* ----- Paginatin ----- */}
                  <div className='flex justify-end gap-2'>
                    {
                      activePage > 1 ? <div
                        onClick={() => setActivePage(activePage - 1)}
                        className='border bg-blue-600 text-white w-[20px] h-[20px] grid place-items-center rounded cursor-pointer'>
                        <GrFormPrevious />
                      </div> : null
                    }
                    {
                      Array.from({ length: Math.ceil((totalData / dataLimit)) }).map((_, i) => {
                        return <div
                          onClick={() => setActivePage(i + 1)}
                          className='border-blue-400 border w-[20px] h-[20px] text-center rounded cursor-pointer'
                          style={activePage === i + 1 ? { border: "1px solid blue" } : {}}
                        >
                          {i + 1}
                        </div>
                      })
                    }
                    {
                      (totalData / dataLimit) > activePage ? <div
                        onClick={() => setActivePage(activePage + 1)}
                        className='border bg-blue-600 text-white w-[20px] h-[20px] flex items-center justify-center rounded cursor-pointer'>
                        <GrFormNext />
                      </div> : null
                    }
                  </div>
                </div>
                {/* pagination end */}
              </div >
            </div>
              : <AddNew title={"Tax"} link={"/admin/tax/add"} />
              : <DataShimmer />
          }
        </div >
      </main >
    </>
  )
}


export default Tax;
