import React, { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Pagination, Popover, Whisper } from 'rsuite';
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
import useMyToaster from '../../hooks/useMyToaster';
import downloadPdf from '../../helper/downloadPdf';
import Cookies from 'js-cookie';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdInformationCircleOutline, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';
import { toggleModal } from '../../store/deleteModalSlice';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useDispatch } from 'react-redux';





const Transaction = () => {
  const toast = useMyToaster();
  const dispatch = useDispatch();
  const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
  const [activePage, setActivePage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalData, setTotalData] = useState()
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const [transactionData, setTransactionData] = useState([]);
  const tableRef = useRef(null);
  const [tableStatusData, setTableStatusData] = useState('active');
  const exportData = useMemo(() => {
    return transactionData && transactionData.map(({
      transactionDate, purpose, transactionNumber, transactionType,
      amount
    }) => ({
      Date: transactionDate,
      Purpose: purpose,
      "Transaction Number": transactionNumber,
      "Transaction Type": transactionType,
      Amount: amount
    }));
  }, [transactionData]);
  const [loading, setLoading] = useState(true)


  // Get data;
  useEffect(() => {
    const getTransaction = async () => {
      try {
        const data = {
          token: Cookies.get("token"),
          trash: tableStatusData === "trash" ? true : false,
          all: tableStatusData === "all" ? true : false
        }
        const url = process.env.REACT_APP_API_URL + `/other-transaction/get?page=${activePage}&limit=${dataLimit}`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(data)
        });
        const res = await req.json();
        setTotalData(res.totalData)
        setTransactionData([...res.data]);
        setLoading(false);

      } catch (error) {
        console.log(error)
      }
    }
    getTransaction();
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
      setSelected(Array.from({ length: 10 }, (_, i) => i));
    } else {
      setSelected([]);
    }
  };




  const handleCheckboxChange = (index) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };



  const exportTable = async (whichType) => {
    if (whichType === "copy") {
      copyTable("listTransaction"); // Pass tableid
    }
    else if (whichType === "excel") {
      downloadExcel(exportData, 'transaction-list.xlsx') // Pass data and filename
    }
    else if (whichType === "print") {
      printTable(tableRef, "Transaction List"); // Pass table ref and title
    }
    else if (whichType === "pdf") {
      let document = exportPdf('Transaction List', exportData);
      downloadPdf(document)
    }
  }



  const removeData = async (trash) => {
    if (selected.length === 0 || tableStatusData !== 'active') {
      return;
    }
    const url = process.env.REACT_APP_API_URL + "/other-transaction/delete";
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
        setTransactionData((prevData) => {
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
      <Nav title={"Other Transaction"} />
      <main id='main'>
        <SideNav />
        <Tooltip id='transactionTooltip' />
        <DeleteConfirmModal
          title={"Other Transaction"}
          onYesFunc={removeData}
        />

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
                <button className='bg-gray-100 border'>
                  <MdFilterList className='text-xl' />
                  Filter
                </button>
                <button
                  onClick={() => {
                    if (selected.length > 0) dispatch(toggleModal(true));
                  }}
                  className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
                  <MdDeleteOutline className='text-lg' />
                  Delete
                </button>
                <button
                  onClick={() => navigate("/admin/other-transaction/add")}
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

            <div id='transactionFilter'>
            </div>
          </div>
          {
            !loading ? transactionData.length > 0 ? <div className='content__body__main'>

              {/* Table start */}
              <div className='overflow-x-auto list__table'>
                <table className='min-w-full bg-white' id='listTransaction'>
                  <thead className='list__table__head'>
                    <tr>
                      <th className='py-2 px-4 border-b'>
                        <input type='checkbox' onChange={selectAll} checked={selected.length === 10} />
                      </th>
                      <th className='py-2 px-4 border-b'>Date</th>
                      <th className='py-2 px-4 border-b'>Purpose</th>
                      <th className='py-2 px-4 border-b'>Transaction Number</th>
                      <th className='py-2 px-4 border-b'>Type</th>
                      <th className='py-2 px-4 border-b'>Amount</th>
                      <th className='py-2 px-4 border-b'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      transactionData.map((data, i) => {
                        return <tr key={i}>
                          <td className='py-2 px-4 border-b max-w-[10px]'>
                            <input type='checkbox' checked={selected.includes(data._id)} onChange={() => handleCheckboxChange(data._id)} />
                          </td>
                          <td className='px-4 border-b' align='center'>{data.transactionDate}</td>
                          <td className='px-4 border-b' align='center'>{data.purpose}</td>
                          <td className='px-4 border-b' align='center'>{data.transactionNumber}</td>
                          <td className='px-4 border-b' align='center'>{data.transactionType}</td>
                          <td className='px-4 border-b' align='center'>{data.amount}</td>
                          <td className='px-4 text-center'>
                            <Whisper
                              placement='leftStart'
                              trigger={"click"}
                              speaker={<Popover full>
                                <div
                                  className='table__list__action__icon'
                                  onClick={() => navigate(`/admin/other-transaction/edit/${data._id}`)}
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
                </table>
                <div className='paginate__parent'>
                  <p>Showing {transactionData.length} of {totalData} entries</p>
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
              </div>
            </div>
              : <AddNew title={"Transaction"} link={'/admin/other-transaction/add'} />
              : <DataShimmer />
          }
        </div>
      </main>
    </>
  )
}

export default Transaction