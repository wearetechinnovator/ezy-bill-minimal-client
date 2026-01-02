import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SelectPicker, DatePicker, Button, TagPicker } from 'rsuite';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import useBillPrefix from '../../hooks/useBillPrefix';
import Cookies from 'js-cookie';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import swal from 'sweetalert';
import AddPartyModal from '../../components/AddPartyModal';
import AddItemModal from '../../components/AddItemModal';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';
import useFormHandle from '../../hooks/useFormHandle';



document.title = "Sales Invoice";
const SalesInvoice = ({ mode }) => {
  const toast = useMyToaster();
  const { id } = useParams()
  const getBillPrefix = useBillPrefix("invoice");
  const { getApiData } = useApi();
  const getPartyModalState = useSelector((store) => store.partyModalSlice.show);
  const getItemModalState = useSelector((store) => store.itemModalSlice.show);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemRowSet = {
    rowItem: 1, itemName: '', description: '', hsn: '', qun: '1', qunLeft: 0, itemId: '',
    unit: [], selectedUnit: '', price: '', discountPerAmount: '', discountPerPercentage: '',
    tax: '', taxAmount: '', amount: '', perDiscountType: "", //for checking purpose only
    itemInvoice: [], itemInvoiceList: [],//invoice full data,
    scaneItemCodeValue: ''
  }
  const additionalRowSet = {
    additionalRowsItem: 1, particular: '', amount: ''
  }
  const [ItemRows, setItemRows] = useState([itemRowSet]);
  const [additionalRows, setAdditionalRow] = useState([additionalRowSet]); //{ additionalRowsItem: 1 }
  const [formData, setFormData] = useState({
    party: '', salesInvoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0], DueDate: '',
    items: ItemRows, additionalCharge: additionalRows, note: '', terms: '',
    discountType: '', discountAmount: '', discountPercentage: '', paymentStatus: '0',
    paymentAccount: '', finalAmount: '', paymentAmount: '', autoRoundOff: false,
    roundOffAmount: null, roundOffType: '0' //1 =`add` | 0 =`reduce`
  })
  const location = useLocation();
  const fromWhichBill = location.state?.fromWhichBill || null;
  const activeRowIndexRef = useRef(null); // For tracking active row index


  const [perPrice, setPerPrice] = useState(null);
  const [perTax, setPerTax] = useState(null);
  const [perDiscount, setPerDiscount] = useState(null);
  const [perQun, setPerQun] = useState(null)

  // When change discount type;
  const [discountToggler, setDiscountToggler] = useState(true);

  // Store all items without filter
  const [items, setItems] = useState([]);
  // Store units
  const [unit, setUnit] = useState([]);
  // Store taxes
  const [tax, setTax] = useState([]);
  // Store party
  const [party, setParty] = useState([]);
  // Account
  const [account, setAccount] = useState([])


  // store label and value pair for dropdown
  const [itemData, setItemData] = useState([])
  const [taxData, setTaxData] = useState([]);

  // Form hook
  const {
    onItemChange, addItem, deleteItem, changeDiscountType,
    calculateFinalAmount
  } = useFormHandle();




  // Barcode Scan function;
  useEffect(() => {
    let buffer = "";
    let lastTime = 0;

    const handler = (e) => {
      const now = Date.now();
      const diff = now - lastTime;

      if (diff > 80) buffer = "";
      lastTime = now;

      if (e.key.length === 1) buffer += e.key;

      if (e.key === "Enter" && buffer.length > 0) {
        const scannedCode = buffer;
        buffer = "";
        console.log("SCANNER:", scannedCode);

        (async () => {
          const data = await getApiData("item", null, scannedCode);

          if (!data?.data?._id) return; // item not found

          const scannedId = data.data._id;

          // 1️⃣ Check if item already exists → increase qty
          const existIndex = ItemRows.findIndex(
            (row) => String(row.itemId) === String(scannedId)
          );

          if (existIndex !== -1) {
            setItemRows((prev) => {
              const updated = [...prev];
              updated[existIndex].qun = Number(updated[existIndex].qun || 0) + 1;
              return updated;
            });

            activeRowIndexRef.current = existIndex;
            return;
          }

          // 2️⃣ If first row is empty (default row), USE it instead of adding new row
          const firstEmpty =
            ItemRows.length === 1 &&
            (!ItemRows[0].itemId || ItemRows[0].itemId === "");

          if (firstEmpty) {
            activeRowIndexRef.current = 0;

            onItemChange(
              scannedId,
              0,           // first row
              tax,
              ItemRows,
              setItemRows,
              setItems,
              "sale"
            );

            return; // important → prevent adding new row
          }

          // 3️⃣ Otherwise add new row + fill item
          const newRow = {
            ...itemRowSet,
            rowItem: ItemRows.length + 1,
          };

          const newRows = [...ItemRows, newRow];
          const newIndex = newRows.length - 1;

          setItemRows(newRows);
          activeRowIndexRef.current = newIndex;

          onItemChange(
            scannedId,
            newIndex,
            tax,
            newRows,       // use newRows (not old ItemRows)
            setItemRows,
            setItems,
            "sale"
          );
        })();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [ItemRows, tax, getApiData, onItemChange]);



  const get = async () => {
    try {
      let url;
      
      if (mode === 'edit' || !mode) {
        url = `${process.env.REACT_APP_API_URL}${"/salesinvoice/get"}`
      }
      else if (mode === "convert" && fromWhichBill === "proforma") {
        url = `${process.env.REACT_APP_API_URL}${"/proforma/get"}`
      }
      else if (mode === "convert" && fromWhichBill === "quotation") {
        url = `${process.env.REACT_APP_API_URL}${"/quotation/get"}`
      }

      const cookie = Cookies.get("token");

      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({ token: cookie, id: id })
      })
      const res = await req.json();
      const removeProformaNumber = { ...res.data };
      delete removeProformaNumber.proformaNumber;

      const cleanedData = {
        ...removeProformaNumber,
        invoiceDate: res.data.invoiceDate
          ? new Date(res.data.invoiceDate).toISOString().split("T")[0]
          : "",
      };

      setFormData(prev => ({
        ...prev,
        ...cleanedData
      }));

      if (mode) {
        setAdditionalRow([...res.data.additionalCharge]);
        setItemRows([...res.data.items]);
      }

      if (res.data.discountType != "no") {
        setDiscountToggler(false);
      }
    } catch (error) {
      console.log(error)
      toast("Data not get something went wrong", 'error')
    }
  }
  useEffect(() => {
    if (id) {
      get();
    }
  }, [id, fromWhichBill])


  // Set invoice number;
  useEffect(() => {
    if ((getBillPrefix && mode === "convert") || (getBillPrefix && !mode)) {
      setFormData(prev => ({ ...prev, salesInvoiceNumber: getBillPrefix[0] + getBillPrefix[1] }));

    }
    else if (getBillPrefix && mode === "edit") {
      get();
    }

  }, [getBillPrefix?.length, mode]);



  // Get all data from api
  useState(() => {
    const apiData = async () => {
      {
        const data = await getApiData("item");
        setItems([...data.data]);

        const newItemData = data.data.map(d => ({ label: d.title, value: d.title }));
        setItemData(newItemData);
      }
      {
        const data = await getApiData("unit");
        const unit = data.data.map(d => ({ label: d.title, value: d.title }));
        setUnit([...unit]);
      }
      {
        const data = await getApiData("tax");
        const tax = data.data.map(d => ({ label: d.title, value: d.gst }));
        setTax([...data.data]);
        setTaxData([...tax]);
      }
      {
        const data = await getApiData("party");
        const party = data.data.map(d => ({ label: d.name, value: d._id }));
        setParty([...party]);
      }
      {
        const data = await getApiData("account")
        setAccount([...data.data])
      }
    }

    apiData();

  }, [])



  // When `discount type is before` and apply discount this useEffect run;
  useEffect(() => {
    if (formData.discountType === "before" && ItemRows.length > 0) {
      setItemRows(prevItems =>
        prevItems.map(i => {
          const percentage = ((parseFloat(formData.discountAmount || 0) / parseFloat(i.price || 0) * 100)).toFixed(2);
          const amount = (parseFloat(formData.discountAmount || 0) / parseFloat(prevItems.length)).toFixed(2);
          return {
            ...i,
            discountPerPercentage: percentage,
            discountPerAmount: amount,
          }
        })
      );
    }
  }, [formData.discountAmount, ItemRows.length]);


  const onPerDiscountAmountChange = (val, index) => {
    let item = [...ItemRows];
    let amount = parseFloat(item[index].price) * parseFloat(item[index].qun);
    let percentage = ((parseFloat(val) / amount) * 100).toFixed(2);

    if (item[index].perDiscountType !== "percentage" || formData.discountType === "before") {
      item[index].discountPerAmount = isNaN(val) || val === 0 ? (0).toFixed(2) : val;
      item[index].discountPerPercentage = isNaN(percentage) ? (0).toFixed(2) : percentage;
    }
    setItemRows(item);

  }


  const onPerDiscountPercentageChange = (val, index) => {
    let item = [...ItemRows];
    let amount = parseFloat(item[index].price) * parseFloat(item[index].qun);
    // let percentage = (parseFloat(val) / amount) * 100;
    let dis_amount = amount / 100 * val

    if (item[index].perDiscountType !== "amount" || formData.discountType === "before") {
      item[index].discountPerPercentage = val;
      item[index].discountPerAmount = (dis_amount).toFixed(2);
    }
    setItemRows(item);

  }


  const calculatePerTaxAmount = (index) => {
    const tax = ItemRows[index].tax / 100;
    const qun = ItemRows[index].qun;
    const price = ItemRows[index].price;
    const disAmount = ItemRows[index].discountPerAmount;
    const amount = ((qun * price) - disAmount);
    const taxamount = (amount * tax).toFixed(2);

    return taxamount;
  }


  const calculatePerAmount = (index) => {
    const qun = ItemRows[index].qun;
    const price = ItemRows[index].price;
    const disAmount = ItemRows[index].discountPerAmount;
    const totalPerAmount = parseFloat((qun * price) - disAmount) + parseFloat(calculatePerTaxAmount(index));

    return (totalPerAmount).toFixed(2);
  }



  // Save Final Amount;
  useEffect(() => {
    const finalAmount = calculateFinalAmount(
      additionalRows, formData, subTotal, formData.autoRoundOff,
      formData.roundOffAmount, formData.roundOffType
    );
    setFormData((prevData) => ({
      ...prevData,
      finalAmount
    }));
  }, [ItemRows, additionalRows, formData.autoRoundOff, formData.roundOffAmount, formData.roundOffType]);



  // Return Sub-Total
  /*
    Total Discount.
    Total Tax.
    Total Amount.
  */
  const subTotal = useCallback(() => {
    const subTotal = (which) => {
      let total = 0;

      ItemRows.forEach((item, index) => {
        if (which === "discount") {
          if (item.discountPerAmount) {
            total = (parseFloat(total) + parseFloat(item.discountPerAmount)).toFixed(2)
          }
        }
        else if (which === "tax") {
          total = (parseFloat(total) + parseFloat(calculatePerTaxAmount(index))).toFixed(2);
        }
        else if (which === "amount") {
          total = (parseFloat(total) + parseFloat(calculatePerAmount(index))).toFixed(2);
        }
      })

      return !isNaN(total) ? total : 0.00;

    }
    return subTotal;
  }, [ItemRows, perPrice, perTax, perDiscount, perQun])



  const onDiscountAmountChange = (e) => {
    if (discountToggler !== null) {
      const value = e.target.value || (0).toFixed(2);
      let per = ((value / subTotal()('amount')) * 100).toFixed(2) //Get percentage
      setFormData({ ...formData, discountAmount: e.target.value, discountPercentage: per });
    }

  }


  // *Save bill
  const saveBill = async () => {
    if (!formData.party) {
      return toast("Please select party", "error");
    } else if (!formData.salesInvoiceNumber) {
      return toast("Please enter invoice number", "error");
    } else if (!formData.invoiceDate) {
      return toast("Please select invoice date", "error");
    }


    for (let row of ItemRows) {
      if (row.itemName === "") {
        return toast("Please select item", "error");
      } else if (row.qun === "") {
        return toast("Please enter quantity", "error");
      } else if (row.unit === "") {
        return toast("Please select unit", "error");
      } else if (row.price === "") {
        return toast("Please enter price", "error");
      }
    }

    // Add Per Item Tax and Amound before save
    ItemRows.forEach((row, index) => {
      row.taxAmount = calculatePerTaxAmount(index);
      row.amount = calculatePerAmount(index);
    });
    setItemRows([...ItemRows]);

    try {
      const url = process.env.REACT_APP_API_URL + "/salesinvoice/add";
      const token = Cookies.get("token");

      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(!mode || mode !== "edit" ? { ...formData, token } : { ...formData, token, update: true, id: id })
      })
      const res = await req.json();
      if (req.status !== 200 || res.err) {
        return toast(res.err, 'error');
      }

      if (mode === "edit") {
        toast('Invoice update successfully', 'success');
        navigate(-1);
        return;
      }

      clearForm();

      // if this is converted by proforma then delete the proforma
      // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
      if (mode === "convert" && fromWhichBill === "proforma") {
        try {
          await fetch(process.env.REACT_APP_API_URL + "/proforma/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: [id], trash: false })
          });

        } catch (error) {
          console.log("Proforma not deleted: " + error);
        }
      }

      else if (mode === "convert" && fromWhichBill === "quotation") {
        try {
          const url = process.env.REACT_APP_API_URL + "/quotation/add";
          await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ token, id, update: true, billStatus: "convert" })
          })

        } catch (error) {
          console.log(error);
          return toast('Quotation status not change', 'error')
        }
      }


      toast('Invoice add successfully', 'success');
      navigate('/admin/sales-invoice')
      return


    } catch (error) {
      console.log(error);
      return toast('Something went wrong', 'error')
    }

  }


  // *Clear form values;
  const clearForm = () => {
    setItemRows([itemRowSet]);
    setAdditionalRow([additionalRowSet])
    setFormData({
      party: '', salesInvoiceNumber: '', invoiceDate: '', DueDate: '', items: ItemRows,
      additionalCharge: additionalRows, note: '', terms: '',
      discountType: '', discountAmount: '', discountPercentage: ''
    });

  }


  const getInvoiceListByProductId = async (id, index) => {
    try {
      const url = process.env.REACT_APP_API_URL + "/purchaseinvoice/get-item-invoice";
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: Cookies.get("token"), itemId: id })
      })
      const res = await req.json();
      if (req.status !== 200) {
        return toast(res.err, "warning");
      }

      setItemRows((p) => {
        const prevItems = [...p];
        prevItems[index].itemInvoice = [];
        prevItems[index].itemInvoiceList = res;

        res.forEach((i, _) => {
          // find index;
          const invIndex = i.items.findIndex((it, _) => String(it.itemId) === String(id));

          if (parseInt(i.items[invIndex].qunLeft) > 0) {
            prevItems[index].qunLeft = parseInt(prevItems[index].qunLeft || 0) + parseInt(i.items[invIndex].qunLeft || 0);
            prevItems[index].itemInvoice.push({
              label: `${i.purchaseInvoiceNumber} \t(Qun. ${i.items[invIndex].qunLeft} ${i.items[invIndex].selectedUnit}) \t(Exp. ${i.items[invIndex].expireDate.split("T")[0]})`,
              value: i.purchaseInvoiceNumber
            });
          }

        })

        return prevItems;
      })

    } catch (error) {
      console.log(error);
      return toast("Invoice no get", "error")
    }
  }


  return (
    <>
      <Nav title={mode == "edit" ? "Update Sales Invoice" : "Add Sales Invoice"} />
      <main id='main'>
        <SideNav />
        <AddPartyModal open={getPartyModalState} />
        <AddItemModal open={getItemModalState} />
        <div className='content__body'>
          <div className='content__body__main bg-white' id='addQuotationTable'>

            <div className='top__btn__grp'>
              <div className='extra__btns'>
                {/* {mode === "edit" && <button onClick={() => {
                  swal({
                    title: "Are you sure?",
                    icon: "warning",
                    buttons: true,
                  })
                    .then((cnv) => {
                      if (cnv) {
                        swal("Invoice successfully duplicate", {
                          icon: "success",
                        });
                        navigate(`/admin/sales-invoice/add/${id}`)
                      }
                    });
                }}><Icons.COPY />Duplicate invoice</button>} */}
                {/* <button onClick={saveBill}><Icons.CHECK />{mode ? "Update" : "Save"}</button> */}
              </div>
            </div>

            <div className='flex flex-col lg:flex-row items-center justify-around gap-4'>
              <div className='flex flex-col gap-2 w-full'>
                <p className='text-xs'>Select Party <span className='required__text'>*</span></p>
                <MySelect2
                  model={"party"}
                  partyType={"customer"}
                  onType={(v) => {
                    setFormData({ ...formData, party: v })
                  }}
                  value={formData.party?._id}
                />
              </div>
              <div className='flex flex-col gap-2 w-full lg:w-1/2'>
                <p className='text-xs'>Sales Invoice Number <span className='required__text'>*</span></p>
                <input type="text"
                  onChange={(e) => setFormData({ ...formData, salesInvoiceNumber: e.target.value })}
                  value={formData.salesInvoiceNumber || ""}
                />
              </div>
              <div className='flex flex-col gap-2 w-full lg:w-1/2'>
                <p className='text-xs'>Invoice Date <span className='required__text'>*</span></p>
                <input type="date"
                  onChange={(e) => {
                    setFormData({ ...formData, invoiceDate: e.target.value })
                  }}
                  value={formData.invoiceDate || ""}
                />
              </div>
              <div className='flex flex-col gap-2 w-full lg:w-1/2'>
                <p className='text-xs'>Due Date</p>
                <input type="date"
                  onChange={(e) => {
                    setFormData({ ...formData, DueDate: e.target.value })
                  }}
                  value={formData.DueDate}
                />
              </div>
            </div>

            <div className='overflow-x-auto rounded'>
              <table className='add__table min-w-full table-style'>
                <thead >
                  <tr>
                    <th style={{ "width": "*" }}>Item</th>
                    <th style={{ "width": "6%" }}>HSN/SAC</th>
                    <th style={{ "width": "5%" }}>QTY</th>
                    <th style={{ "width": "7%" }}>Unit</th>
                    <th style={{ "width": "10%" }}>Price/Item</th>
                    <th style={{ "width": "10%" }}>Discount</th>
                    <th style={{ "width": "10%" }}>Tax</th>
                    <th style={{ "width": "10%" }}>Amount</th>
                    <th style={{ "width": "3%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {ItemRows.map((i, index) => (
                    <tr key={i.rowItem} className='border-b' onClick={(e) => {
                      activeRowIndexRef.current = index;
                    }}>

                      {/* Item name and description */}
                      <td>
                        <div className='flex flex-col gap-2'>
                          <MySelect2
                            model={"item"}
                            onType={(v) => {
                              onItemChange(v, index, tax, ItemRows, setItemRows, setItems, 'sale');
                              if (v) {
                                getInvoiceListByProductId(v, index);
                              } else {
                                setItemRows((p) => {
                                  const prevItems = [...p];
                                  prevItems[index].itemInvoice = []
                                  return prevItems;
                                })
                              }
                            }}
                            value={ItemRows[index].itemId}
                          />
                          <TagPicker
                            data={ItemRows[index].itemInvoice}
                            onChange={(v) => {
                              setItemRows((p) => {
                                const prevItems = [...p];

                                v.forEach((inv, _) => {
                                  const invoiceData = prevItems[index].itemInvoiceList.find((i, _) => i.purchaseInvoiceNumber === inv);
                                  prevItems[index].qunLeft = parseInt(prevItems[index].qunLeft || 0) + parseInt(invoiceData.items[0].qunLeft || 0);
                                })

                                return prevItems;
                              })
                            }}
                          />
                          <input type='text' className='input-style' placeholder='Description'
                            onChange={(e) => {
                              let item = [...ItemRows];
                              item[index].description = e.target.value;
                              setItemRows(item);
                            }}
                            value={ItemRows[index].description}
                          />
                        </div>
                      </td>
                      <td>
                        <input type='text' className='w-[70px] input-style'
                          onChange={(e) => {
                            let item = [...ItemRows];
                            item[index].hsn = e.target.value;
                            setItemRows(item);
                          }}
                          value={ItemRows[index].hsn}
                        />
                      </td>
                      <td>
                        <input type='text' className='input-style'
                          onChange={(e) => {
                            if (parseInt(e.target.value) > ItemRows[index].qunLeft) {
                              return toast("Insufficient stock", 'warning')
                            }

                            let item = [...ItemRows];
                            item[index].qun = e.target.value;
                            setItemRows(item);
                            setPerQun(e.target.value);
                            if (formData.discountType !== "before") {
                            }
                            onPerDiscountPercentageChange(formData.items[index].discountPerPercentage, index);
                            onPerDiscountAmountChange(formData.items[index].discountPerAmount, index);
                          }}
                          value={ItemRows[index].qun}
                        />
                      </td>
                      <td>
                        <select className='input-style'
                          onChange={(e) => {
                            let item = [...ItemRows];
                            item[index].selectedUnit = e.target.value;
                            setItemRows(item);
                          }}
                          value={ItemRows[index].selectedUnit}
                        >
                          {
                            ItemRows[index].unit.map((u, _) => {
                              return <option key={_} value={u}>{u}</option>
                            })
                          }
                        </select>
                      </td>
                      <td align='center'>
                        <div>
                          <input type='text' className='input-style'
                            onChange={(e) => {
                              let item = [...ItemRows];
                              item[index].price = e.target.value;
                              setItemRows(item);
                              setPerPrice(e.target.value);
                              if (formData.discountType !== "before") {
                              }
                              onPerDiscountPercentageChange(formData.items[index].discountPerPercentage, index);
                              onPerDiscountAmountChange(formData.items[index].discountPerAmount, index);
                            }}
                            value={ItemRows[index].price}
                          />
                        </div>
                      </td>
                      <td> {/** Discount amount and percentage */}
                        <div className={`w-[100px] flex flex-col gap-2 items-center`} >
                          <div className='add-table-discount-input'>
                            <input type="text"
                              className={`${formData.discountType === 'before' ? 'bg-gray-100' : ''} `}
                              onChange={formData.discountType !== 'before' ? (e) => {
                                let form = { ...formData };
                                form.items[index].perDiscountType = 'amount';
                                setFormData({ ...form });
                                onPerDiscountAmountChange(e.target.value, index)
                              } : null}
                              value={ItemRows[index].discountPerAmount}
                            // value={calculatePerDiscountAmount(index)}
                            />
                            <div><Icons.RUPES /></div>
                          </div>
                          <div className='add-table-discount-input' >
                            <input type="text"
                              className={`${formData.discountType === 'before' ? 'bg-gray-100' : ''} `}
                              onChange={formData.discountType !== 'before' ? (e) => {
                                let form = { ...formData };
                                form.items[index].perDiscountType = 'percentage';
                                setFormData({ ...form });
                                onPerDiscountPercentageChange(e.target.value, index)
                              } : null}
                              value={ItemRows[index].discountPerPercentage}
                            // value={calculatePerDiscountPercentage(index)}
                            />
                            <div>%</div>
                          </div>
                        </div>
                      </td>
                      <td> {/** Tax and Taxamount */}
                        <div className='flex flex-col gap-2'>
                          <SelectPicker
                            onChange={(v) => {
                              let item = [...ItemRows];
                              item[index].tax = v;
                              setItemRows(item);
                              setPerTax('')
                            }}
                            value={ItemRows[index].tax}
                            data={taxData}
                          />
                          <input type="text"
                            onChange={(e) => {
                              let item = [...ItemRows];
                              item[index].taxAmount = e.target.value;
                              setItemRows(item);
                            }}
                            value={calculatePerTaxAmount(index)}
                          />
                        </div>
                      </td>
                      <td align='center'>
                        <div>
                          <input type="text"
                            value={calculatePerAmount(index)}
                            className='bg-gray-100 custom-disabled'
                            disabled
                          />
                        </div>
                      </td>
                      <td align='center' className='w-[20px]'>
                        <Icons.DELETE
                          className='cursor-pointer text-[16px]'
                          onClick={() => ItemRows.length > 1 && deleteItem(1, index, setItemRows, setFormData, setAdditionalRow)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={9}>
                      <Button
                        color='blue' className='float-right w-full font-bold'
                        onClick={() => addItem(1, itemRowSet, setItemRows, setFormData, additionalRowSet, setAdditionalRow)}
                      >
                        <Icons.ADD_LIST className='text-lg mr-1' />
                        Add Item
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} align='right'>
                      <p className='py-2 font-bold'>Sub-Total</p>
                    </td>
                    <td>{subTotal()('discount')}</td>
                    <td>{subTotal()('tax')}</td>
                    <td>{subTotal()('amount')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* --------- Tax amount table ------- */}
            <div className='overflow-x-auto rounded' id='taxAmountTable'>
              <table className='table-style w-full'>
                <thead>
                  <tr>
                    <td className='font-bold'>Total Taxable Amount</td>
                    <td className='font-bold'>Total Tax Amount</td>
                    <td>
                      <span className='font-bold mr-1'>Discount Type</span>
                      <span>(Additional)</span>
                    </td>
                    <td>
                      <span className='font-bold mr-1'>Discount Amount</span>
                      <span>(Additional)</span>
                    </td>
                    <td>
                      <span className='font-bold mr-1'>Discount Percentage</span>
                      <span>(Additional)</span>
                    </td>
                    <td className='font-bold'>Total Amount</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='min-w-[150px]'>
                      <input type="text" name="total_taxable_amount"
                        value={(subTotal()('amount') - subTotal()('tax')).toFixed(2)}
                        className='bg-gray-100 custom-disabled'
                        disabled
                      />
                    </td>
                    <td className='min-w-[150px]'>
                      <input type="text" name='total_tax_amount'
                        value={subTotal()('tax')}
                        className='bg-gray-100 custom-disabled'
                        disabled
                      />
                    </td>
                    <td className='min-w-[180px]'>
                      <select name="discount_type" value={formData.discountType} onChange={(e) => {
                        changeDiscountType(e, ItemRows, formData, setFormData, setDiscountToggler, toast)
                      }}>
                        <option value="no">No Discount</option>
                        <option value="before">Before Tax</option>
                        <option value="after">After Tax</option>
                      </select>
                    </td>

                    <td className='min-w-[180px]'>
                      <div className='add-table-discount-input' >
                        <input
                          id='discountAmount'
                          type="text"
                          className={`${discountToggler ? 'bg-gray-100 custom-disabled' : ''}`}
                          disabled={discountToggler ? true : false}
                          onChange={(e) => discountToggler ? null : onDiscountAmountChange(e)}
                          value={formData.discountAmount}
                        />
                        <div><Icons.RUPES /></div>
                      </div>
                    </td>
                    <td className='min-w-[200px]'>
                      <div className='add-table-discount-input'>
                        <input
                          type="text"
                          id='discountPercentage'
                          className={`${discountToggler ? 'bg-gray-100 custom-disabled' : ''}`}
                          disabled={discountToggler ? true : false}
                          onChange={discountToggler ? null : (e) => {
                            let amount = ((subTotal()('amount') / 100) * e.target.value).toFixed(2);
                            setFormData({
                              ...formData, discountPercentage: e.target.value, discountAmount: amount,
                            })

                            if (formData.discountType === "before") {
                              let items = [...ItemRows];
                              items.forEach((i, _) => {
                                // i.discountPerAmount = amount / parseFloat(items.length);
                                i.discountPerPercentage = e.target.value;
                              })

                              setItemRows([...items]);
                            }
                          }}
                          value={formData.discountPercentage}
                        />
                        <div>%</div>
                      </div>
                    </td>
                    <td className='min-w-[150px]'>
                      <input type="text" name="total_amount"
                        className='bg-gray-100 custom-disabled'
                        disabled
                        value={subTotal()('amount')}
                        onChange={null}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* ------- Note and Additional charges ------- */}
            <div className='w-full flex flex-col lg:flex-row justify-between gap-4 mt-3'>
              <div className='flex flex-col w-full gap-3'>
                <div>
                  <p>Note: </p>
                  <input type="text"
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    value={formData.note}
                  />
                </div>
                <div>
                  <p>Terms:</p>
                  <input type="text"
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    value={formData.terms}
                  />
                </div>
                <div>
                  <p>Payment Status:</p>
                  <select
                    onChange={(e) => {
                      setFormData({ ...formData, paymentStatus: e.target.value })
                    }}
                    value={formData.paymentStatus}
                  >
                    <option value="0">Not Paid</option>
                    <option value="1">Full Paid</option>
                    <option value="2">Partial Paid</option>
                  </select>
                </div>
                {
                  formData.paymentStatus === "1" || formData.paymentStatus === "2" ?
                    <div className='flex items-center gap-2'>
                      <div className='w-full'>
                        <p>Amount:</p>
                        <input type="text"
                          onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                          value={formData.paymentAmount}
                        />
                      </div>

                      <div className='w-full'>
                        <p>Select Account:</p>
                        <select
                          onChange={(e) => {
                            setFormData({ ...formData, paymentAccount: e.target.value })
                          }}
                          value={formData.paymentAccount}
                        >
                          <option value="">--Select Account--</option>
                          {
                            account.map((a, _) => {
                              return <option value={a._id} key={_}>{a.title}</option>
                            })
                          }
                        </select>
                      </div>
                    </div>
                    : null
                }
              </div>
              <div className='w-full'>
                <div className='uppercase font-bold border border-dashed p-2 rounded'>
                  Additional Charges
                </div>
                <div className='overflow-x-auto rounded mt-3' id='addtionalChargeTable'>
                  <table className='table-style w-full'>
                    <thead className='bg-gray-100'>
                      <tr>
                        <td>Particular</td>
                        <td>Amount</td>
                        <td>Actions</td>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        additionalRows.map((i, index) => (
                          <tr key={i.additionalRowsItem}>
                            <td>
                              <input type="text"
                                onChange={(e) => {
                                  let item = [...additionalRows];
                                  item[index].particular = e.target.value;
                                  setAdditionalRow(item);
                                }}
                                value={additionalRows[index].particular}
                              />
                            </td>
                            <td>
                              <input type="text"
                                onChange={(e) => {
                                  let item = [...additionalRows];
                                  item[index].amount = e.target.value;
                                  setAdditionalRow(item);
                                }}
                                value={additionalRows[index].amount}
                              />
                            </td>
                            <td align='center'>
                              <Icons.DELETE
                                className='cursor-pointer text-lg'
                                onClick={() => deleteItem(2, index, setItemRows, setFormData, setAdditionalRow)}
                              />
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}>
                          <Button color='blue' className='float-right w-full font-bold' onClick={() => addItem(2, itemRowSet, setItemRows, setFormData, additionalRowSet, setAdditionalRow)}>
                            <Icons.ADD_LIST className='text-lg mr-1' />
                            Add Item
                          </Button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {/* Round Off Section */}
                <div className='flex justify-between items-center w-full mt-4 round__off__section'>
                  <div className='flex items-center gap-1'>
                    <input type="checkbox"
                      onChange={(e) => setFormData({ ...formData, autoRoundOff: e.target.checked })}
                      checked={formData.autoRoundOff}
                    />
                    <p>Auto Round Off</p>
                  </div>

                  {!formData.autoRoundOff && <div>
                    <div className='flex items-center text-sm'>
                      <button
                        onClick={() => {
                          setFormData({ ...formData, roundOffType: '1' })
                        }}
                        className={`flex items-center text-[10px] border ${formData.roundOffType === "1" ? 'border-blue-700' : ''} p-[2px]`}>
                        Add <span>(+)</span>
                      </button>
                      <input type="text" className='w-[100px]'
                        value={formData.roundOffAmount}
                        onChange={(e) => setFormData({ ...formData, roundOffAmount: e.target.value })}
                      />
                      <button
                        onClick={() => {
                          setFormData({ ...formData, roundOffType: '0' })
                        }}
                        className={`flex items-center text-[10px] border ${formData.roundOffType === "0" ? 'border-blue-700' : ''} p-[2px]`}>
                        Reduce <span>(-)</span>
                      </button>
                    </div>
                  </div>}
                </div>

                <p className='font-bold mt-4 mb-2'>Final Amount</p>
                <input type="text" name="final_amount"
                  className='bg-gray-100 custom-disabled w-full'
                  disabled
                  value={formData.finalAmount}
                />
              </div>
            </div>

            <div className='w-full flex justify-center gap-3 my-3 mt-5'>
              <button
                onClick={saveBill}
                className='add-bill-btn'>
                <Icons.CHECK />
                {!mode || mode === "convert" ? "Save" : "Update"}
              </button>
              <button className='reset-bill-btn' onClick={clearForm}>
                <Icons.RESET />
                Reset
              </button>
            </div>

          </div>
          {/* Content Body Main Close */}
        </div>
        {/* Content Body Close */}
      </main>
    </>
  )
}

export default SalesInvoice;
