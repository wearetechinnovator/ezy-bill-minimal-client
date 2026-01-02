import { useEffect, useState } from "react";
import DataShimmer from "../../components/DataShimmer";
import Nav from "../../components/Nav";
import SideNav from "../../components/SideNav";
import { Icons } from "../../helper/icons";
import useMyToaster from "../../hooks/useMyToaster";
import Cookies from 'js-cookie';




document.title = "Report | Daybook";
const DayBook = () => {
    const toast = useMyToaster();
    const [billData, setBillData] = useState([]);
    const [ascending, setAscending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterData, setFilterData] = useState({
        formDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        voucher: 'sales',
    })
    const [totalAmount, setTotalAmount] = useState(null);




    const getData = async () => {
        if (Object.values(filterData).some((field) => !field || field === "")) {
            return toast("Please fill all filters", 'error');
        }

        try {
            setLoading(true);
            setTotalAmount(0);
            const token = Cookies.get("token");

            let url = process.env.REACT_APP_API_URL;
            if (filterData.voucher === "sales") url += "/salesinvoice/filter";
            else if (filterData.voucher === "purchase") url += "/purchaseinvoice/filter";

            const payload = {
                fromDate: filterData.formDate,
                toDate: filterData.toDate,
                token: token
            }

            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            const res = await req.json();

            setLoading(false);
            if (req.status !== 200 || res.data.length < 1) {
                setBillData([]);
                return toast('No bill found in this voucher', 'error');
            }

            setBillData([...res?.data])
            setLoading(false);

            const total = res.data.reduce((acc, i) => acc + i.finalAmount, 0);
            setTotalAmount(total)

        } catch (error) {
            return toast("Something went to wrong", 'error');
        }
    }
    useEffect(() => {
        getData();
    }, [])


    const sortByDate = () => {
        const sorted = [...billData].sort((a, b) => {
            const dateA = new Date(a.invoiceDate);
            const dateB = new Date(b.invoiceDate);
            return ascending ? dateA - dateB : dateB - dateA;
        });

        setBillData(sorted);
        setAscending(!ascending);
    };


    const resetFilter = () => {
        setFilterData(pv => {
            return {
                ...pv,
                formDate: new Date().toISOString().split("T")[0],
                toDate: new Date().toISOString().split("T")[0],
                voucher: 'sales',
            }
        })

        getData();
    }


    return (
        <>
            <Nav title={"DayBook"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className="content__body__main mb-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className='flex flex-col gap-1 w-full lg:w-1/2'>
                                <p className='text-xs'>From Date</p>
                                <input
                                    type='date'
                                    value={filterData.formDate}
                                    onChange={(e) => {
                                        setFilterData({ ...filterData, formDate: e.target.value })
                                    }}
                                />
                            </div>
                            <div className='flex flex-col gap-1 w-full lg:w-1/2'>
                                <p className='text-xs'>To Date</p>
                                <input
                                    type='date'
                                    value={filterData.toDate}
                                    onChange={(e) => {
                                        setFilterData({ ...filterData, toDate: e.target.value })
                                    }}
                                />
                            </div>
                            <div className='flex flex-col gap-1 w-full lg:w-1/2'>
                                <p className='text-xs'>Select Voucher</p>
                                <select
                                    value={filterData.voucher}
                                    onChange={(e) => {
                                        setFilterData({ ...filterData, voucher: e.target.value })
                                    }}
                                >
                                    <option value="">Select</option>
                                    <option value="sales">Sales</option>
                                    <option value="purchase">Purchase</option>
                                </select>
                            </div>
                            <div className='w-full flex justify-end gap-3 mt-3'>
                                <button
                                    className='add-bill-btn'
                                    onClick={getData}
                                >
                                    <Icons.SEARCH />
                                    Search
                                </button>
                                <button
                                    className='reset-bill-btn'
                                    onClick={resetFilter}
                                >
                                    <Icons.RESET />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>


                    {
                        !loading ?
                            <div className='content__body__main'>
                                {/* Table start */}
                                {billData.length > 0 ?
                                    <div className='overflow-x-auto list__table'>
                                        <table className='min-w-full bg-white' id='listQuotation'>
                                            <thead className='list__table__head'>
                                                <tr>
                                                    <th className='py-2 px-4 border-b cursor-pointer' onClick={sortByDate}>
                                                        <div className='flex items-center justify-center'>
                                                            Date {ascending ? <Icons.DROPDOWN /> : <Icons.DROPUP />}
                                                        </div>
                                                    </th>
                                                    <th className='py-2 px-4 border-b'>Invoice No.</th>
                                                    <th className='py-2 px-4 border-b'>Party Name</th>
                                                    <th className='py-2 px-4 border-b'>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    billData?.map((b, _) => {
                                                        return <tr key={_}>
                                                            <td align="center" className="py-2 ">{b.invoiceDate.split("T")[0]}</td>
                                                            <td className='px-4 border-b' align="center">
                                                                {b.salesInvoiceNumber || b.purchaseInvoiceNumber}
                                                            </td>
                                                            <td className='px-4 border-b' align="center">{b.party.name}</td>
                                                            <td className='px-4 border-b' align="center">{b.finalAmount}</td>
                                                        </tr>
                                                    })
                                                }
                                            </tbody>
                                            <tfoot className="border">
                                                <tr>
                                                    <td colSpan={3}
                                                        align="right"
                                                        className="py-2 font-semibold uppercase text-[15px]"
                                                    >
                                                        Total Amount
                                                    </td>
                                                    <td align="center" className="font-semibold text-[15px]">
                                                        {totalAmount}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    :
                                    <p className="font-semibold text-xl text-gray-300 flex flex-col items-center">
                                        <Icons.INVOICE className="text-2xl" />
                                        No Data Found
                                    </p>
                                }
                            </div>
                            : <DataShimmer />
                    }
                </div>
            </main>
        </>
    )
}

export default DayBook;