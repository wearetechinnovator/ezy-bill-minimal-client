import React, { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
// import MyBreadCrumb from '../../components/BreadCrumb';
import { Popover, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { MdFilterList, MdOutlineArrowDropDown } from "react-icons/md";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdInformationCircleOutline, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { TbZoomReset } from 'react-icons/tb';
import { LuSearch } from 'react-icons/lu';
import { FiMoreHorizontal } from 'react-icons/fi';
import { RiArrowDropUpFill } from "react-icons/ri";
import Pagination from '../../components/Pagination';
import { useDispatch } from 'react-redux';
import { toggleModal } from '../../store/deleteModalSlice';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';




// Proforma page
document.title = "Debit Note";
const DebitNote = () => {
  const toast = useMyToaster();
  const dispatch = useDispatch();
  const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
  const [activePage, setActivePage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalData, setTotalData] = useState();
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const [billData, setBillData] = useState([]);
  const tableRef = useRef(null);
  const [tableStatusData, setTableStatusData] = useState('active');
  const exportData = useMemo(() => {
    return billData && billData.map(({ debitNoteDate, debitNoteNumber, party }) => ({
      "Debit Note Date": debitNoteDate,
      "Debit Note Number": debitNoteNumber,
      "Party": party.name,
    }));
  }, [billData]);
  const [loading, setLoading] = useState(true);
  const [filterToggle, setFilterToggle] = useState(false);
  const [filterData, setFilterData] = useState({
    productName: "", fromDate: '', toDate: '', billNo: '', party: '',
    gst: "", billDate: ''
  })
  const [ascending, setAscending] = useState(true);




  // Get data;
  const getData = async () => {
    try {
      const data = {
        token: Cookies.get("token"),
        trash: tableStatusData === "trash" ? true : false,
        all: tableStatusData === "all" ? true : false
      }
      const url = process.env.REACT_APP_API_URL + `/debitnote/get?page=${activePage}&limit=${dataLimit}`;
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
      });
      const res = await req.json();
      console.log(res)
      setTotalData(res.totalData)
      setBillData([...res.data]);
      setLoading(false);

    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {

    getData();
  }, [tableStatusData, dataLimit, activePage])


  const sortByDate = () => {
    const sorted = [...billData].sort((a, b) => {
      const dateA = new Date(a.debitNoteDate);
      const dateB = new Date(b.debitNoteDate);
      return ascending ? dateA - dateB : dateB - dateA;
    });
    setBillData(sorted);
    setAscending(!ascending);
  };

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
      setSelected(billData.map(data => data._id));
    } else {
      setSelected([]);
    }
  };


  const handleCheckboxChange = (id) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((previd, _) => previd !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };


  const exportTable = async (whichType) => {
    if (whichType === "copy") {
      copyTable("listQuotation"); // Pass tableid
    }
    else if (whichType === "excel") {
      downloadExcel(exportData, 'debitnote.xlsx') // Pass data and filename
    }
    else if (whichType === "print") {
      printTable(tableRef, "Debit Note List"); // Pass table ref and title
    }
    else if (whichType === "pdf") {
      let document = exportPdf('Debit Note List', exportData);
      downloadPdf(document)
    }
  }



  const removeData = async (trash) => {
    if (selected.length === 0 || tableStatusData !== 'active') {
      return;
    }
    const url = process.env.REACT_APP_API_URL + "/debitnote/delete";
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
        setBillData((prevData) => {
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


  const getFilterData = async () => {
    if ([
      filterData.billDate, filterData.party, filterData.billNo, filterData.fromDate,
      filterData.toDate, filterData.gst, filterData.productName
    ].every((field) => field === "" || !field)) {
      return toast("Choose a filter option", 'error')
    }

    try {
      const url = process.env.REACT_APP_API_URL + `/debitnote/filter?page=${activePage}&limit=${dataLimit}`;

      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({ token: Cookies.get("token"), ...filterData })
      });
      const res = await req.json();

      console.log(res)
      setTotalData(res?.totalData)
      setBillData([...res?.data])

    } catch (error) {
      console.log(error)
      return toast("Something went wrong", 'error')
    }
  }


  const clearFilterData = () => {
    getData()
    setFilterData({
      productName: "", fromDate: '', toDate: '', billNo: '', party: '',
      gst: "", billDate: ''
    })
  }




  return (
    <>
      <Nav title={"Debit Note"} />
      <main id='main'>
        <SideNav />
        <Tooltip id='debitTooltip' />
        <DeleteConfirmModal
          title={"Debit Note"}
          onYesFunc={removeData}
        />

        <div className='content__body'>
          {/* top section */}
          <div className={`add_new_compnent ${filterToggle ? 'h-[265px]' : 'h-[45px]'} `}>
            <div className='flex justify-between items-center'>
              <div className='flex flex-col'>
                <select value={dataLimit} onChange={(e) => setDataLimit(e.target.value)}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className='flex items-center gap-2 listing__btn_grp'>
                <div className='flex w-full flex-col lg:w-[300px]'>
                  <input type='text'
                    placeholder='Search...'
                    onChange={searchTable}
                    className='p-[6px]'
                  />
                </div>
                <button onClick={() => {
                  setFilterToggle(!filterToggle)
                }}
                  className={`${filterToggle ? 'bg-gray-200 border-gray-300' : 'bg-gray-100'} border`}>
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
                  onClick={() => navigate("/admin/debit-note/add")}
                  className='bg-[#003E32] text-white '>
                  <IoIosAdd className='text-xl text-white' />
                  Add New
                </button>
                {billData.length > 0 && <div className='flex justify-end'>
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
                </div>}
              </div>
            </div>

            <div id='filterToggle'>
              <hr />

              <div className='grid gap-4 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1' id='filterBill'>
                <div>
                  <p>Product Name</p>
                  <input type="text"
                    value={filterData.productName}
                    onChange={(e) => setFilterData({ ...filterData, productName: e.target.value })}
                  />
                </div>
                <div>
                  <p>Bill No</p>
                  <input type="text"
                    value={filterData.billNo}
                    onChange={(e) => setFilterData({ ...filterData, billNo: e.target.value })}
                  />
                </div>
                <div>
                  <p>From Date</p>
                  <input type="date"
                    value={filterData.fromDate}
                    onChange={(e) => setFilterData({ ...filterData, fromDate: e.target.value })}
                  />
                </div>
                <div>
                  <p>To Date</p>
                  <input type="date"
                    value={filterData.toDate}
                    onChange={(e) => setFilterData({ ...filterData, toDate: e.target.value })}
                  />
                </div>
                <div>
                  <p>Party</p>
                  <input type="text"
                    value={filterData.party}
                    onChange={(e) => setFilterData({ ...filterData, party: e.target.value })}
                  />
                </div>
                <div>
                  <p>GSTIN</p>
                  <input type="text"
                    value={filterData.gst}
                    onChange={(e) => setFilterData({ ...filterData, gst: e.target.value })}
                  />
                </div>
              </div>

              <div className='w-full flex justify-end gap-2 mt-5' id='filterBtnGrp'>
                <button onClick={getFilterData}>
                  <LuSearch />
                  Search
                </button>
                <button onClick={clearFilterData}>
                  <TbZoomReset />
                  Reset
                </button>
              </div>
            </div>
          </div>
          {
            !loading ? billData.length > 0 ? <div className='content__body__main'>


              {/* Table start */}
              <div className='overflow-x-auto list__table'>
                <table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
                  <thead className='list__table__head'>
                    <tr>
                      <th className='py-2 px-4 border-b'>
                        <input type='checkbox' onChange={selectAll} checked={billData.length > 0 && selected.length === billData.length} />
                      </th>
                      <th className='py-2 px-4 border-b cursor-pointer' onClick={sortByDate}>
                        <div className='flex items-center justify-center'>
                          Date {ascending ? <MdOutlineArrowDropDown /> : <RiArrowDropUpFill />}
                        </div>
                      </th>
                      <th className='py-2 px-4 border-b'>Debit Note Number</th>
                      <th className='py-2 px-4 border-b'>Party Name</th>
                      <th className='py-2 px-4 border-b'>Amount</th>
                      <th className='py-2 px-4 border-b'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      billData.map((data, i) => {
                        return <tr key={i}
                          onClick={() => navigate(`/admin/bill/details/debitnote/${data._id}`)}>
                          <td className='py-2 px-4 border-b max-w-[10px]'>
                            <input type='checkbox'
                              checked={selected.includes(data._id)}
                              onChange={() => handleCheckboxChange(data._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className='px-4 border-b' align='center'>{new Date(data.debitNoteDate).toLocaleDateString()}</td>
                          <td className='px-4 border-b' align='center'>{data.debitNoteNumber}</td>
                          <td className='px-4 border-b' align='center'>{data.party.name}</td>
                          <td className='px-4 border-b' align='center'>{data.finalAmount}</td>
                          <td className='px-4 text-center'>
                            <Whisper
                              placement='leftStart'
                              trigger={"click"}
                              speaker={<Popover full>
                                <div
                                  className='table__list__action__icon'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/debit-note/edit/${data._id}`)
                                  }}
                                >
                                  <FaRegEdit className='text-[16px]' />
                                  Edit
                                </div>
                                <div
                                  className='table__list__action__icon'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/bill/details/debitnote/${data._id}`)
                                  }}
                                >
                                  <IoMdInformationCircleOutline className='text-[16px]' />
                                  Details
                                </div>
                              </Popover>}
                            >
                              <div className='table__list__action' onClick={(e) => e.stopPropagation()}>
                                <FiMoreHorizontal />
                              </div>
                            </Whisper>
                          </td>
                        </tr>
                      })
                    }
                  </tbody>
                </table>
                <div className='paginate__parent'>
                  <p>Showing {billData.length} of {totalData} entries</p>
                  {/* ----- Paginatin ----- */}
                  <Pagination
                    activePage={activePage}
                    totalData={totalData}
                    dataLimit={dataLimit}
                    setActivePage={setActivePage}
                  />
                </div>
                {/* pagination end */}
              </div>
            </div>
              : <AddNew title={"Debit note"} link={'/admin/debit-note/add'} />
              : <DataShimmer />
          }
        </div>
      </main>

    </>
  )
}

export default DebitNote;

