import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import SideNav from "../components/SideNav";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import Cookies from 'js-cookie';
import { Link } from "react-router-dom";



document.title = "Dashboard";
const Dashboard = () => {
  const [accountBalanceData, setAccountBalanceData] = useState([])
  const [recentPurchase, setRecentPurchase] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [totalCollect, setTotalCollect] = useState(null);
  const [totalPay, setTotalPay] = useState(null);
  const [cashFlowData, setCashFlowData] = useState([]);
  const COLORS = ["#00C49F", "#0088FE", "#FF8042", "#FFBB28"];



  // Get Payment In Details
  useEffect(() => {
    // Dummy data
    const cashFlowData = [
      { name: "Jan" },
      { name: "Feb" },
      { name: "Mar" },
      { name: "Apr" },
      { name: "May" },
      { name: "Jun" },
      { name: "Jul" },
      { name: "Aug" },
      { name: "Sep" },
      { name: "Oct" },
      { name: "Nov" },
      { name: "Dec" },
    ];

    (async () => {
      try {
        const [res, res2] = await Promise.all([
          fetch(process.env.REACT_APP_API_URL + `/paymentin/month-wise`, {
            method: "POST",
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify({ token: Cookies.get("token") })
          }).then(res => res.json()),

          fetch(process.env.REACT_APP_API_URL + `/paymentout/month-wise`, {
            method: "POST",
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify({ token: Cookies.get("token") })
          }).then(res => res.json()),
        ]);

        cashFlowData.forEach((month, index) => {
          month.Collect = res[index]?.totalAmount || 0;
          month.Pay = res2[index]?.totalAmount || 0;
        });

        setCashFlowData(cashFlowData);

      } catch (error) {
        console.log(error)
      }
    })()
  }, []);


  // Get Account Details;
  useEffect(() => {
    (async () => {
      try {
        const data = {
          token: Cookies.get("token"),
          all: true
        }
        const url = process.env.REACT_APP_API_URL + `/account/get?page=${1}&limit=${100000}`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(data)
        });
        const res = await req.json();

        const accountBalanceDataChartData = res.data.reduce((acc, i) => {
          acc.push({ name: i.title, value: i.openingBalance });
          return acc;
        }, [])

        setAccountBalanceData(accountBalanceDataChartData)

      } catch (error) {
        console.log(error)
      }
    })()
  }, [])


  // Get Total Pay;
  useEffect(() => {
    (async () => {
      try {
        const url = process.env.REACT_APP_API_URL + `/purchaseinvoice/get-total-pay`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: Cookies.get('token') })
        });
        const res = await req.json();

        if (req.status === 200) {
          if (res.length > 0) {
            setTotalPay(res[0].totalAmount)
          } else {
            setTotalPay(0)
          }
        }

      } catch (error) {
        console.log(error)
      }
    })()
  }, [])


  // Get Total Collect;
  useEffect(() => {
    (async () => {
      try {
        const url = process.env.REACT_APP_API_URL + `/salesinvoice/get-total-collect`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: Cookies.get('token') })
        });
        const res = await req.json();
        if (req.status === 200) {
          if (res.length > 0) {
            setTotalCollect(res[0].totalAmount)
          } else {
            setTotalCollect(0)
          }
        }

      } catch (error) {
        console.log(error)
      }
    })()
  }, [])


  // Get Recent Purchase Invoice
  useEffect(() => {
    (async () => {
      try {
        const data = {
          token: Cookies.get("token"),
          all: false
        }
        const url = process.env.REACT_APP_API_URL + `/purchaseinvoice/get?page=${1}&limit=${2}`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(data)
        });
        const res = await req.json();
        setRecentPurchase(res?.data || []);

      } catch (error) {
        console.log(error)
      }
    })()
  }, [])


  // Get Recent Sales Invoice
  useEffect(() => {
    (async () => {
      try {
        const data = {
          token: Cookies.get("token"),
          all: false
        }
        const url = process.env.REACT_APP_API_URL + `/salesinvoice/get?page=${1}&limit=${2}`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(data)
        });
        const res = await req.json();
        setRecentSales(res?.data || [])

      } catch (error) {
        console.log(error)
      }
    })()
  }, [])


  return (
    <>
      <Nav title={"Dashboard"} />
      <main id="main">
        <SideNav />
        <div className="content__body p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow rounded-md px-4 py-2 flex items-center justify-between">
              <div>
                <p className="text-gray-500">To Collect</p>
                <p className="text-3xl font-bold text-green-600">{totalCollect?.toFixed(2)}</p>
                <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                  <FiTrendingUp />
                </p>
              </div>
            </div>
            <div className="bg-white shadow rounded-md px-4 py-2 flex items-center justify-between">
              <div>
                <p className="text-gray-500">To Pay</p>
                <p className="text-3xl font-bold text-red-600">{totalPay?.toFixed(2)}</p>
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <FiTrendingDown />
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-white shadow rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4">Cash Flow</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cashFlowData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Collect" fill="#00C49F" />
                  <Bar dataKey="Pay" fill="#FF5A5F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white shadow rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4">Account Wise Balance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={accountBalanceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {accountBalanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Sales */}
            <div className="bg-white shadow rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Sales</h3>
                <Link to="/admin/sales-invoice"
                  className="text-xs text-blue-500 hover:text-blue-500 cursor-pointer">
                  See All
                </Link>
              </div>
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Party</th>
                    <th className="p-2">Invoice No</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>

                  {
                    recentSales?.map((s, i) => {
                      return <tr className="border-b" key={i}>
                        <td className="p-2">{s.party?.name}</td>
                        <td className="p-2">{s.salesInvoiceNumber}</td>
                        <td className="p-2">{s.invoiceDate.split("T")[0]}</td>
                        <td className="p-2 text-green-600">{s.finalAmount}</td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>

            {/* Recent Purchases */}
            <div className="bg-white shadow rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Purchases</h3>
                <Link to="/admin/purchase-invoice"
                  className="text-xs text-blue-500 cursor-pointer">
                  See All
                </Link>
              </div>
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Party</th>
                    <th className="p-2">Invoice No</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    recentPurchase?.map((p, i) => {
                      return <tr className="border-b" key={i}>
                        <td className="p-2">{p.party?.name}</td>
                        <td className="p-2">{p.originalInvoiceNumber}</td>
                        <td className="p-2 text-red-600">{p.finalAmount}</td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
