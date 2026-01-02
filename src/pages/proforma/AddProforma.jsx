import React, { useCallback, useEffect, useState } from 'react';
import { SelectPicker, DatePicker, Button } from 'rsuite';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import useBillPrefix from '../../hooks/useBillPrefix';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { useDispatch, useSelector } from 'react-redux';
import AddPartyModal from '../../components/AddPartyModal';
import AddItemModal from '../../components/AddItemModal';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';
import useFormHandle from '../../hooks/useFormHandle';





document.title = "Proforma";
const Proforma = ({ mode }) => {
  const toast = useMyToaster();
  const { id } = useParams()
  const getBillPrefix = useBillPrefix("proforma");
  const { getApiData } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getPartyModalState = useSelector((store) => store.partyModalSlice.show);
  const getItemModalState = useSelector((store) => store.itemModalSlice.show);
  const itemRowSet = {
    QuotaionItem: 1, itemName: '', description: '', hsn: '', qun: '1',
    unit: [], selectedUnit: "", price: '', discountPerAmount: '', discountPerPercentage: '',
    tax: '', taxAmount: '', amount: '', perDiscountType: "", //for checking purpose only
  }
  const additionalRowSet = {
    additionalRowsItem: 1, particular: '', amount: ''
  }
  const [ItemRows, setItemRows] = useState([itemRowSet]);
  const [additionalRows, setAdditionalRow] = useState([additionalRowSet]); //{ additionalRowsItem: 1 }
  const [formData, setFormData] = useState({
    party: '', proformaNumber: '', estimateDate: new Date().toISOString().split('T')[0], validDate: '', items: ItemRows,
    additionalCharge: additionalRows, note: '', terms: '',
    discountType: '', discountAmount: '', discountPercentage: '', finalAmount: '', autoRoundOff: false,
    roundOffAmount: null, roundOffType: '0' //1 =`add` | 0 =`reduce`

  })

  const [perPrice, setPerPrice] = useState(null);
  const [perTax, setPerTax] = useState(null);
  const [perDiscount, setPerDiscount] = useState(null);
  const [perQun, setPerQun] = useState(null)
  const [partyDetails, setPartyDetails] = useState(null);

  // When change discount type;
  const [discountToggler, setDiscountToggler] = useState(true);

  // Store all items without filter
  const [items, setItems] = useState([]);
  // Store taxes
  const [tax, setTax] = useState([]);


  // store item label and value pair for dropdown
  const [itemData, setItemData] = useState([])
  const [taxData, setTaxData] = useState([]);

  // Form hook;
  const {
    onItemChange, addItem, deleteItem, changeDiscountType,
    calculateFinalAmount
  } = useFormHandle();


  // Get data for update mode
  const get = async () => {
    let url;
    if (mode === "edit") {
      url = process.env.REACT_APP_API_URL + "/proforma/get";
    } else {
      url = process.env.REACT_APP_API_URL + "/quotation/get";
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

    const removeQuotationNumber = { ...res.data };
    delete removeQuotationNumber.quotationNumber;

    const cleanedData = {
      ...removeQuotationNumber,
      estimateDate: res.data.estimateDate
        ? new Date(res.data.estimateDate).toISOString().split("T")[0]
        : "",
    };

    setFormData(prev => ({
      ...prev,
      ...cleanedData
    }));

    setAdditionalRow([...res.data.additionalCharge])
    setItemRows([...res.data.items]);

    if (res.data.discountType != "no") {
      setDiscountToggler(false);
    }
  }
  useEffect(() => {
    if (id) {
      get();
    }
  }, [id])


  // Set Party Details when select party
  useEffect(() => {
    (async () => {
      if (formData.party) {
        const { data } = await getApiData("party", formData.party);
        setPartyDetails(data);
      }
    })()
  }, [formData.party]);


  useEffect(() => {
    if ((getBillPrefix && mode === "convert") || (getBillPrefix && !mode)) {
      setFormData(prev => ({ ...prev, proformaNumber: getBillPrefix[0] + getBillPrefix[1] }));
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
        const data = await getApiData("tax");
        const tax = data.data.map(d => ({ label: d.title, value: d.gst }));
        setTax([...data.data]);
        setTaxData([...tax]);
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

    // if ([formData.party, formData.proformaNumber, formData.estimateDate]
    //   .some((field) => field === "")) {
    //   return toast("Fill the blank", "error");
    // }

    if (formData.party === "") {
      return toast("Please select party", "error")
    } else if (formData.estimateDate === "") {
      return toast("Please enter sales return number", "error")
    } else if (formData.proformaNumber === "") {
      return toast("Please enter proforma number", "error")
    }


    for (let row of ItemRows) {
      if (row.itemName === "") {
        return toast("Please select item", "error")
      } else if (row.qun === "") {
        return toast("Please enter quantity", "error")
      } else if (row.unit === "") {
        return toast("Please select unit", "error")
      } else if (row.price === "") {
        return toast("Please enter price", "error")
      }
    }


    // Add Per Item Tax and Amound before save
    ItemRows.forEach((row, index) => {
      row.taxAmount = calculatePerTaxAmount(index);
      row.amount = calculatePerAmount(index);
    });
    setItemRows([...ItemRows]);

    try {
      const url = process.env.REACT_APP_API_URL + "/proforma/add";
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

      if (mode === 'edit') {
        toast('Proforma update successfully', 'success');
        navigate(-1);
        return;
      }

      // if this is converted by quotation then update the quotation status;
      // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
      if (mode === "convert") {
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

      clearForm();

      toast('Proforma add successfully', 'success');
      navigate('/admin/proforma-invoice');
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
      party: '', proformaNumber: getBillPrefix, estimateDate: '', validDate: '', items: ItemRows,
      additionalCharge: additionalRows, note: '', terms: '',
      discountType: '', discountAmount: '', discountPercentage: '',
    });

  }


  return (
    <>
      <Nav title={mode === "edit" ? "Update Proforma" : "Add Proforma"} />
      <main id='main'>
        <SideNav />
        <AddPartyModal open={getPartyModalState} />
        <AddItemModal open={getItemModalState} />

        <div className='content__body'>
          <div className='content__body__main bg-white' id='addQuotationTable'>

            <div className='top__btn__grp'>
              {/* <div className='add__btns'>
                <button onClick={() => {
                  dispatch(toggle(!getPartyModalState))
                }}><MdOutlineAdd /> Add Party</button>

                <button onClick={() => {
                  dispatch(itemToggle(!getItemModalState))
                }}><MdOutlineAdd /> Add Item</button>
              </div> */}

              {
                <div className='extra__btns'>
                  {mode === "edit" && <button onClick={() => {
                    swal({
                      title: "Are you sure?",
                      icon: "warning",
                      buttons: true,
                    })
                      .then((cnv) => {
                        if (cnv) {
                          swal("Proforma successfully duplicate", {
                            icon: "success",
                          });
                          navigate(`/admin/proforma-invoice/add/${id}`)
                        }
                      });
                  }}><Icons.COPY />Duplicate invoice</button>}
                  {/* <button onClick={saveBill}>
                    <Icons.CHECK />{mode === "edit" ? "Update" : "Save"}
                  </button> */}
                </div>
              }
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
              <div className='flex flex-col gap-2 w-full lg:w-1/3'>
                <p className='text-xs'>Proforma Number <span className='required__text'>*</span></p>
                <input type="text"
                  onChange={(e) => setFormData({ ...formData, proformaNumber: e.target.value })}
                  value={formData.proformaNumber}
                />
              </div>
              <div className='flex flex-col gap-2 w-full lg:w-1/3'>
                <p className='text-xs'>Proforma Date <span className='required__text'>*</span></p>
                <input
                  type='date'
                  onChange={(e) => {
                    setFormData({ ...formData, estimateDate: e.target.value })
                  }}
                  value={formData.estimateDate}
                />
              </div>
              <div className='flex flex-col gap-2 w-full lg:w-1/3'>
                <p className='text-xs'>Valid To</p>
                <input type="date"
                  onChange={(e) => {
                    setFormData({ ...formData, validDate: e.target.value })
                  }}
                  value={formData.validDate}
                />
              </div>
            </div>

            {/* --------------------------- [Party Phone and Address] ------------------- */}
            {partyDetails !== null && <div className='text-[10px] mt-2'>
              <p><span className='font-semibold'>Phone</span>: {partyDetails?.contactNumber}</p>
              <p><span className='font-semibold'>Address</span>: {partyDetails?.billingAddress}</p>
            </div>}

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
                    <tr key={i.QuotaionItem} className='border-b'>

                      {/* Item name and description */}
                      <td>
                        <div className='flex flex-col gap-2'>
                          <MySelect2
                            model={"item"}
                            onType={(v) => onItemChange(v, index, tax, ItemRows, setItemRows, setItems, 'sale')}
                            value={ItemRows[index].itemId}
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
                      <Button color='blue' className='float-right w-full font-bold' onClick={() => addItem(1, itemRowSet, setItemRows, setFormData, additionalRowSet, setAdditionalRow)}>
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
                      <input type="text"
                        name="total_amount"
                        className='bg-gray-100 custom-disabled'
                        disabled
                        value={subTotal()('amount')}
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
                {!mode ? "Save" : "Update"}
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

export default Proforma;