import React, { useEffect, useState } from 'react'
import { FaRegFilePdf } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { toWords } from 'number-to-words';
import { Document, Page, View, Text, Image, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import downloadPdf from '../../helper/downloadPdf';
import useMyToaster from '../../hooks/useMyToaster';
import MailModal from '../../components/MailModal';
import { useDispatch, useSelector } from 'react-redux';
import { toggle } from '../../store/mailSlice';
import { Drawer, Modal, Popover, Sidebar, Whisper } from 'rsuite';
import { MdOutlineArrowDropDown } from "react-icons/md";
import { IoIosShareAlt } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { MdOutlineWhatsapp } from "react-icons/md";
import swal from 'sweetalert';
import { Icons } from '../../helper/icons';
import { AddPaymentOutComponent } from '../paymentout/AddPayment';
import { AddPaymentInComponent } from '../paymentin/AddPayment';






document.title = "Invoice";
const Invoice = () => {
  const navigate = useNavigate();
  const { id, bill } = useParams();
  const [billData, setBillData] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [hsnData, setHsnData] = useState([]);
  const [billDetails, setBillDetails] = useState({})
  const [totalAmountInText, setTotalAmountInText] = useState("");
  const [urlRoute, setUrlRoute] = useState("");
  const toast = useMyToaster();

  const openModal = useSelector((state) => state.mailModalSlice.show)
  const dispatch = useDispatch();
  const [pdfData, setPdfData] = useState(null);
  const [billName, setBillName] = useState('');
  const [shareDrpdwn, setShareDrpdwn] = useState(false);
  const [route, setRoute] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false)




  useEffect(() => {
    if (bill === "quotation") {
      setUrlRoute("quotation");
      setBillName("Qutation");
      setRoute("quotation-estimate");
    } else if (bill === "proforma") {
      setUrlRoute('proforma');
      setBillName("Proforma");
      setRoute("proforma-invoice");
    } else if (bill === 'po') {
      setUrlRoute('po')
      setBillName("Purchase Order");
      setRoute("purchase-order");
    } else if (bill === 'purchaseinvoice') {
      setUrlRoute("purchaseinvoice");
      setBillName("Purchase Invoice");
      setRoute("purchase-invoice");
    } else if (bill === "purchasereturn") {
      setUrlRoute('purchasereturn');
      setBillName("Purchase Return");
      setRoute("purchase-return");
    } else if (bill === 'debitnote') {
      setUrlRoute("debitnote");
      setBillName("Debitnote");
      setRoute("debit-note");
    } else if (bill === 'salesinvoice') {
      setUrlRoute("salesinvoice");
      setBillName("Sales Invoice");
      setRoute("sales-invoice");
    } else if (bill === 'salesreturn') {
      setUrlRoute("salesreturn");
      setBillName("Sales Return");
      setRoute("sales-return");
    } else if (bill === 'creditnote') {
      setUrlRoute("creditnote");
      setBillName("Creditnote");
      setRoute("credit-note");
    } else if (bill === 'deliverychalan') {
      setUrlRoute("deliverychalan");
      setBillName("Delivery Chalan");
      setRoute("delivery-chalan");
    }
  }, [bill])



  useEffect(() => {

    // Get bill information
    const getData = async () => {
      try {

        if (urlRoute) {
          const url = process.env.REACT_APP_API_URL + `/${urlRoute}/get`;
          const req = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": 'application/json'
            },
            body: JSON.stringify({ token: Cookies.get("token"), id: id })
          });
          const res = await req.json();
          setBillData(res.data)
          return res;
        }

      } catch (error) {
        console.log(error)
        return error;
      }
    }

    // Get company information;
    const getCompanyDetails = async () => {
      try {
        const url = process.env.REACT_APP_API_URL + `/company/get`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: Cookies.get("token") })
        });
        const res = await req.json();
        setCompanyDetails(res);
        return res;

      } catch (error) {
        console.log(error)
        return error;
      }
    }

    getCompanyDetails()
    getData();

  }, [urlRoute])


  useEffect(() => {
    let data = [];

    billData && billData.items.forEach((b, _) => {
      let obj = {};

      obj['hsn'] = b.hsn;
      obj['rate'] = b.tax;

      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (obj.hsn == data[i].hsn) {
            data[i]['price'] += parseInt(b.price);
            obj['price'] = parseInt(data[i].price);

            data[i]['taxAmount'] += (parseInt(b.qun) * parseInt(b.price)) / 100 * parseInt(b.tax);
            obj['taxAmount'] = parseInt(data[i]['taxAmount']);

            break;
          } else {
            obj['price'] = parseInt(b.price);
            obj['taxAmount'] = (parseInt(b.qun) * parseInt(b.price)) / 100 * parseInt(b.tax);
          }

        }

      } else {
        obj['price'] = parseInt(b.price);
        obj['taxAmount'] = (parseInt(b.qun) * parseInt(b.price)) / 100 * parseInt(b.tax)
      }

      data.push(obj)
    })

    setHsnData([...data]);
  }, [billData]);



  useEffect(() => {
    let qun = 0;
    let taxAmount = 0;
    let discount = 0;
    let amount = 0;

    billData && billData.items.map((b, _) => {
      qun += parseInt(b.qun)
      taxAmount += (parseInt(b.qun) * parseInt(b.price)) / 100 * b.tax;
      discount += parseInt(b.discountPerAmount || 0);

      let a = ((parseInt(b.qun) * parseInt(b.price)) + (parseInt(b.qun) * parseInt(b.price)) / 100 * b.tax);
      amount += a - parseInt(b.discountPerAmount || 0);
    })

    setBillDetails({
      ...billDetails, qun, taxAmount: (taxAmount).toFixed(2), discount, amount: (amount).toFixed(2)
    })

    setTotalAmountInText(toWords(amount || 0));

  }, [billData])



  const sendViaMail = async () => {
    function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });
    }


    try {
      const blob = await pdf(
        InvoicePdf({
          companyDetails, billData, billDetails,
          hsnData, totalAmountInText, billname: urlRoute.toUpperCase()
        })
      ).toBlob();

      let pdfData = await blobToBase64(blob);
      setPdfData(pdfData)

      dispatch(toggle(true)) //open modal


    } catch (error) {
      toast("Something went wrong", 'error')
      return error;
    }
  }

  const openPaymentSideBar = async () => {
    setDrawerOpen(true);
  }


  return (

    <>
      <Nav />
      <main id='main'>
        <SideNav />

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} >
          <Drawer.Header>
            <Drawer.Actions>
              Make Payment
            </Drawer.Actions>
          </Drawer.Header>
          <Drawer.Body>
            {
              urlRoute === "purchaseinvoice" && <AddPaymentOutComponent
                partyId={billData?.party?._id}
                invoiceNumber={billData?.purchaseInvoiceNumber}
                due={billData?.dueAmount}
              />
            }

            {
              urlRoute === "salesinvoice" && <AddPaymentInComponent
                partyId={billData?.party?._id}
                invoiceNumber={billData?.purchaseInvoiceNumber}
                due={billData?.dueAmount}
              />
            }
          </Drawer.Body>
        </Drawer>
        {/* Payment drawer close */}
        <MailModal open={openModal} pdf={pdfData} email={billData?.party?.email} />

        <div className="content__body">
          <div id='invoice' className='content__body__main w-[100%] min-h-[100vh] bg-gray-100 flex justify-center'>
            <div className='bg-white /*w-[190mm]*/ w-[80%]  p-5'>

              {/* Action buttons */}
              <div id='invoiceBtn' className='flex gap-2 w-full justify-end mb-5'>
                {((urlRoute === "purchaseinvoice" || urlRoute === "salesinvoice") && billData?.dueAmount > 0) &&
                  <button
                    onClick={openPaymentSideBar}
                    className='bg-[#003E32] text-white rounded-[5px] px-2 py-[5px] gap-1'>
                    Make Payment
                  </button>
                }
                <button
                  onClick={() => {
                    swal({
                      title: "Are you sure?",
                      icon: "warning",
                      buttons: true,
                    })
                      .then((cnv) => {
                        if (cnv) {
                          swal("Quotation successfully duplicate", {
                            icon: "success",
                          });
                          navigate(`/admin/${route}/add/${id}`)
                        }
                      });
                  }}
                  title='Duplicate'
                  className='bg-[#003E32] text-white rounded-[5px] flex justify-center items-center px-2 py-[5px] gap-1'
                >
                  <Icons.COPY />
                  Duplicate
                </button>

                <button
                  onClick={() => {
                    downloadPdf(
                      InvoicePdf({
                        companyDetails, billData, billDetails, hsnData,
                        totalAmountInText, billname: billName.toUpperCase()
                      })
                    );
                  }}
                  title='PDF'
                  className='bg-[#003E32] text-white rounded-[5px] flex justify-center items-center px-2 py-[5px]'>
                  <FaRegFilePdf className="text-white text-[15px] mr-1" />
                  Download
                </button>

                <Whisper
                  trigger={'click'}
                  enterable
                  placement='bottomEnd'
                  open={shareDrpdwn}
                  onClick={() => setShareDrpdwn(!shareDrpdwn)}
                  speaker={<Popover>
                    <div
                      onClick={() => {
                        sendViaMail()
                        setShareDrpdwn(false)
                      }}
                      className='flex items-center gap-2 w-[120px] p-1 cursor-pointer hover:bg-gray-100 rounded'>
                      <HiOutlineMail className='text-[16px]' />
                      Email
                    </div>
                    <div className='flex items-center gap-2 w-[120px] p-1 cursor-pointer hover:bg-gray-100 rounded'>
                      <MdOutlineWhatsapp className='text-[16px]' />
                      WhatsApp
                    </div>
                  </Popover>}
                >
                  <div
                    className='flex items-center gap-3 bg-[#003E32] text-white rounded-[5px] px-2 py-[5px] cursor-pointer'>
                    <div className='flex items-center gap-1'>
                      <IoIosShareAlt />
                      Share
                    </div>
                    <MdOutlineArrowDropDown />
                  </div>
                </Whisper>

                <button
                  onClick={() => {
                    const printContents = document.getElementById('mainBill').innerHTML;
                    document.body.innerHTML = printContents;
                    window.print();
                    window.location.reload();
                  }}
                  title='Print Bill'
                  className='bg-[#003E32] text-white rounded-[5px] flex justify-center items-center px-2 py-[5px]'>
                  <Icons.PRINTER className="text-white text-[15px] mr-1" />
                  Print
                </button>
              </div>

              <div id='mainBill'>
                <div className='border border-black p-4'>
                  <p className='font-semibold text-center uppercase'>{urlRoute.toUpperCase()} Invoice</p>
                  <div className='border border-b-0 w-full mt-3'>
                    <div className='flex w-full border-b h-[130px]'>
                      <div className='p-3 w-[60%] flex items-center gap-5 border-r'>
                        <div>
                          <img src={companyDetails?.invoiceLogo} className='h-[100px]' />
                        </div>
                        <div className='flex flex-col gap-1 text-[12px]'>
                          <p className='text-blue-700 font-semibold text-[16px] leading-[0]'>
                            {companyDetails?.name}
                          </p>
                          <p>{companyDetails?.address}</p>
                          <p className='leading-[0]'>
                            <span className='font-semibold'>GSTIN</span>:  {companyDetails?.gst}
                          </p>
                          <p><span className='font-semibold'>PAN</span>: {companyDetails?.pan}</p>
                          <p className='leading-[0]'>
                            <span className='font-semibold'>Mobile</span>:  {companyDetails?.phone}
                          </p>
                        </div>
                      </div>
                      <div className='w-[40%] flex flex-col justify-center px-3 text-[12px]'>
                        <p><span className='font-semibold'>{billName} No: </span>{
                          billData?.quotationNumber || billData?.proformaNumber || billData?.poNumber || billData?.purchaseInvoiceNumber ||
                          billData?.purchaseReturnNumber || billData?.debitNoteNumber ||
                          billData?.salesInvoiceNumber || billData?.salesReturnNumber || billData?.creditNoteNumber ||
                          billData?.deliveryChalanNumber
                        }</p>
                        <p><span className='font-semibold'>{billName} Date: </span>
                          {
                            new Date(
                              billData?.estimateDate || billData?.invoiceDate || billData?.debitNoteDate ||
                              billData?.returnDate || billData?.poDate || billData?.purchaseInvoiceDate
                              || billData?.creditNoteDate || billData?.purchaseReturnDate
                              || billData?.chalanDate
                            ).toLocaleDateString()
                          }
                        </p>
                      </div>
                    </div>

                    <div className='p-3'>
                      <p className='text-[12px]'>TO</p>
                      <p className='text-black font-semibold text-[12px] uppercase'>{billData?.party.name}</p>
                      <p className='text-[12px]'><span className='text-black font-semibold'>Address:</span> {billData?.party.billingAddress}</p>
                      <p className='text-[12px]'><span className='text-black font-semibold'>Mobile:</span> {billData?.party.contactNumber}</p>
                      <p className='text-[12px] uppercase text-black'>
                        <span className='font-semibold'>GSTIN:</span> {billData?.party.gst}
                        <span className='font-semibold ml-2'>PAN:</span> {billData?.party.pan}
                      </p>
                    </div>
                  </div>
                  <div className='table__wrapper items-page'>
                    <table className='w-full text-[12px] border item__table'>
                      <thead className='bg-gray-100'>
                        <tr>
                          <td align='center' valign='center' className='p-2' width={"5%"}>SL.NO.</td>
                          <td align='center' width={"49%"}>ITEM</td>
                          <td align='center' width={"7%"}>HSN/SAC</td>
                          <td align='center' width={"7%"}>QTY.</td>
                          <td align='center' width={"7%"}>RATE</td>
                          <td align='center' width={"8%"}>DISCOUNT</td>
                          <td align='center' width={"7%"}>TAX</td>
                          <td align='center' width={"10%"}>AMOUNT(INR.)</td>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          billData && billData.items.map((data, index) => {
                            return <tr key={index} >
                              <td valign='top' align='center' className='p-2 border'>{index + 1}</td>
                              <td valign='top' align='left'>{data.itemName}</td>
                              <td valign='top' align='right'>{data.hsn}</td>
                              <td valign='top' align='right'>{data.qun} <sub>{data.selectedUnit}</sub></td>
                              <td valign='top' align='right'>{data.price}</td>
                              <td valign='top' align='right'>
                                {data.discountPerAmount || "0.00"}
                                <div className='discount-font text-gray-500'>
                                  {
                                    isNaN(parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun)) * 100)
                                      ? "(0.00%)"
                                      : `(${((parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun))) * 100).toFixed(2)}%)`
                                  }
                                </div>
                              </td>
                              <td valign='top' align='right'>
                                {((data.qun * data.price) / 100 * data.tax).toFixed(2)}
                                <div className='text-gray-500 discount-font'>{`(${data.tax || '0.00'}%)`}</div>
                              </td>
                              <td valign='top' align='right'> {
                                (parseFloat(data.price) * parseFloat(data.qun) - parseFloat(data.discountPerAmount || 0) + ((data.qun * data.price) / 100 * data.tax)).toFixed(2)
                              }</td>
                            </tr>
                          })
                        }
                        {
                          Array.from({
                            length: Math.max(0, 8 - (billData?.items?.length || 0))
                          }).map((_, i) => (
                            <tr key={i + 100} className='without__border'>
                              <td className='p-2 border without__border'>&nbsp;</td>
                              <td className='without__border'>&nbsp;</td>
                              <td className='without__border'>&nbsp;</td>
                              <td className='without__border'>&nbsp;</td>
                              <td className='without__border'>&nbsp;</td>
                              <td className='without__border'>&nbsp;</td>
                              <td className='without__border'>&nbsp;</td>
                              <td className='without__border'>&nbsp;</td>
                            </tr>
                          ))
                        }
                      </tbody>
                      <tfoot className='w-full'>
                        <tr className='font-bold bg-[#F3F4F6]'>
                          <td colSpan={3} align='right'>TOTAL</td>
                          <td>{billDetails.qun}</td>
                          <td></td>
                          <td>INR. {billDetails.discount}</td>
                          <td>INR. {billDetails.taxAmount}</td>
                          <td>INR. {billDetails.amount}</td>
                        </tr>
                        {billData?.roundOffAmount && <tr className='font-bold bg-[#F3F4F6]'>
                          <td colSpan={7} align='right' className='italic'>Round Off</td>
                          <td>{billData?.roundOffAmount}</td>
                        </tr>}
                        {billData?.roundOffAmount && <tr className='font-bold bg-[#F3F4F6]'>
                          <td colSpan={7} align='right' className='font-semibold'>SUB TOTAL</td>
                          <td>{billDetails.amount - billData?.roundOffAmount}</td>
                        </tr>}
                      </tfoot>
                    </table>
                  </div>

                  {/* ===============================[HSN AND TAX TYPES TABLE] ======================== */}
                  {/* ================================================================================= */}
                  <div className="print-page-break mt-2 ">
                    <table className='w-full text-[12px] ' >
                      <thead className='bg-gray-100'>
                        <tr>
                          <td>HSN Code</td>
                          <td>Tax Type</td>
                          <td>Rate</td>
                          <td>Amount</td>
                          <td>Total Tax Amount</td>
                        </tr>
                      </thead>
                      <tbody>
                        {hsnData && (
                          [...new Map(hsnData.map(item => [item.hsn, item]))].map(([hsn, data], i) => {
                            return <>
                              <tr key={`${i}-sgst`}>
                                <td rowSpan={2}>{data.hsn}</td>
                                <td>SGST</td>
                                <td>{data.rate / 2}%</td>
                                <td>{data.price / 2}</td>
                                <td>{(data.taxAmount).toFixed(2)}</td>
                              </tr>
                              <tr key={`${i}-cgst`}>
                                <td>CGST</td>
                                <td>{data.rate / 2}%</td>
                                <td>{data.price / 2}</td>
                                <td>{(data.taxAmount).toFixed(2)}</td>
                              </tr>
                            </>
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className='border w-full mt-2'>
                    <div className='w-full border-b'>
                      <p className='text-[12px] p-1'>
                        <span className='font-bold '>Total Amount (in words) : </span>
                        {/* five hundred and fifty four Rupees .six Paise */}
                        {totalAmountInText}
                      </p>
                    </div>
                    <div className='w-full flex'>
                      <div className='w-full p-2'>
                        <p className='font-semibold text-md'>Note:</p>
                        <p>{billData?.note}</p>
                        <br />

                        <p className='font-semibold text-md'>Terms:</p>
                        <p>{billData?.terms}</p>
                      </div>
                      <div className='border-l w-full text-center p-2'>
                        <img src={companyDetails?.signature} alt="signature" className='mx-auto h-[30px]' />
                        <p className='text-[10px] leading-[0] mt-5'>Authorised Signatory For</p>
                        <p className='text-[10px]'>{companyDetails?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>

  );
}




// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ==================================== [PDF Generate component] ===================================
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

const InvoicePdf = ({ companyDetails, billData, billDetails, hsnData, totalAmountInText, billname }) => {
  const styles = StyleSheet.create({
    page: { padding: 20 },
    section: { marginBottom: 0 },
    bold: { fontWeight: 'bold' },
    flexRow: { flexDirection: 'row' },
    flexCol: { flexDirection: 'column' },
    border: { border: '1px solid black' },
    table: { display: 'table', width: 'auto' },
    tableRow: { flexDirection: 'row' },
    tableCol: {
      borderBottom: '1px solid black', padding: 2,
      borderRight: '0px solid black',
      borderLeft: '1px solid black',
    },
    header: { backgroundColor: '#f0f0f0' },
    textSmall: { fontSize: 10 },
    textXSmall: { fontSize: 5 },
    partyText: { paddingTop: 3, paddingBottom: 3 }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={[styles.bold, { marginBottom: 10, textAlign: 'center' }]}>{billname}</Text>
          <View style={[styles.border, { borderBottomWidth: 0 }]}>
            <View style={[styles.flexRow, { borderBottom: '1px solid black', height: 90 }]}>
              <View style={{ width: '60%', padding: 10, flexDirection: 'row', borderRight: '1px solid black' }}>
                <Image src={companyDetails?.invoiceLogo} style={{ height: 35, marginRight: 10, marginTop: 15 }} />
                <View style={[styles.flexCol, styles.textSmall]}>
                  <Text style={[{ color: '#2202D0', fontWeight: '800', fontSize: 14, }, styles.partyText]}>
                    {companyDetails?.name}
                  </Text>
                  <Text style={styles.partyText}>{companyDetails?.address}</Text>
                  {/* <Text> */}
                  <Text style={[styles.bold, styles.partyText]}>GSTIN: {companyDetails?.gst}</Text>
                  <Text style={[styles.bold, styles.partyText]}>Mobile: {companyDetails?.phone}</Text>
                  {/* </Text> */}
                  <Text style={styles.partyText}><Text style={[styles.bold]}>PAN Number:</Text> {companyDetails?.pan}</Text>
                </View>
              </View>
              <View style={[styles.flexCol, { width: '40%', padding: 10, justifyContent: 'center' }, styles.textSmall]}>
                <Text style={styles.partyText}><Text style={styles.bold}>{billname} No: </Text>{
                  billData?.quotationNumber || billData?.proformaNumber || billData?.poNumber || billData?.purchaseInvoiceNumber ||
                  billData?.purchaseReturnNumber || billData?.debitNoteNumber ||
                  billData?.salesInvoiceNumber || billData?.salesReturnNumber || billData?.creditNoteNumber ||
                  billData?.deliveryChalanNumber
                }</Text>
                <Text style={styles.partyText}><Text style={styles.bold}>{billname} Date: </Text>  {
                  new Date(
                    billData?.estimateDate || billData?.invoiceDate || billData?.debitNoteDate ||
                    billData?.returnDate || billData?.poDate || billData?.purchaseInvoiceDate
                    || billData?.creditNoteDate || billData?.purchaseReturnDate
                    || billData?.chalanDate
                  ).toLocaleDateString()
                }
                </Text>
              </View>
            </View>

            {/* Party Details */}
            <View style={{ padding: 10 }}>
              <Text style={[styles.textSmall, styles.partyText]}>TO</Text>
              <Text style={[styles.bold, styles.textSmall, styles.partyText]}>{billData?.party.name?.toUpperCase()}</Text>
              <Text style={[styles.textSmall, styles.partyText, { flexWrap: 'wrap' }]}>
                <Text>Address:</Text> {billData?.party.address}
              </Text>
              <Text style={[styles.textSmall, styles.partyText, { textTransform: 'uppercase' }]}>
                <Text>GSTIN:</Text> {billData?.party.gst}
                <Text> State:</Text> {billData?.party.state}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={[styles.table, { borderTop: "1px solid black", borderRight: "1px solid black" }]}>
          <View style={[styles.tableRow, styles.header]}>
            {['S.NO.', 'ITEM', 'HSN/SAC', 'QTY.', 'RATE', 'DISCOUNT', 'TAX', 'AMOUNT'].map((header, i) => (
              <View key={i} style={[styles.tableCol, { width: i === 1 ? '30%' : '10%' }]}>
                <Text style={styles.textSmall}>{header}</Text>
              </View>
            ))}
          </View>
          {billData?.items.map((data, index) => (
            <View style={[styles.tableRow]} key={index}>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>{index + 1}</Text></View>
              <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.textSmall}>{data.itemName}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>{data.hsn}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>{data.qun}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>{data.price}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.textSmall}>{data.discountPerAmount || "0.00"}</Text>
                <Text style={[styles.textSmall, { color: '#666' }]}>
                  {isNaN(parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun)) * 100)
                    ? "(0.00%)"
                    : `(${((parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun))) * 100).toFixed(2)}%)`}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.textSmall}>{((data.qun * data.price) / 100 * data.tax).toFixed(2)}</Text>
                <Text style={[styles.textSmall, { color: '#666' }]}>{`(${data.tax || '0.00'}%)`}</Text>
              </View>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.textSmall}>
                  {(parseFloat(data.price) * parseFloat(data.qun) - parseFloat(data.discountPerAmount || 0) + ((data.qun * data.price) / 100 * data.tax)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          <View style={[styles.tableRow, styles.bold, { backgroundColor: '#F3F4F6' }]}>
            <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.textSmall}>TOTAL</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>{billDetails.qun}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}></Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>INR. {billDetails.discount}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>INR. {billDetails.taxAmount}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.textSmall}>INR. {billDetails.amount}</Text></View>
          </View>
        </View>

        {/* HSN Table */}
        <View style={[styles.table, { marginTop: 10, borderTop: "1px solid black", borderRight: "1px solid black" }]}>
          <View style={[styles.tableRow, styles.header]}>
            {['HSN Code', 'Tax Type', 'Rate', 'Amount', 'Total Tax Amount'].map((header, i) => (
              <View key={i} style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.textSmall}>{header}</Text>
              </View>
            ))}
          </View>
          {hsnData && [...new Map(hsnData.map(item => [item.hsn, item]))].map(([hsn, data], i) => (
            <>
              <View style={styles.tableRow} key={`${i}-sgst`}>
                <View style={[styles.tableCol, { width: '20%', borderBottom: '0' }]}>
                  <Text style={styles.textSmall}>{data.hsn}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>SGST</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>{data.rate / 2}%</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>{data.price}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>{(data.taxAmount).toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.tableRow} key={`${i}-cgst`}>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}></Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>CGST</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>{data.rate / 2}%</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>{data.price}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.textSmall}>{(data.taxAmount).toFixed(2)}</Text>
                </View>
              </View>
            </>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.border, { marginTop: 10 }]}>
          <View style={{ borderBottom: '1px solid black', padding: 3 }}>
            <Text style={styles.textSmall}>
              <Text style={styles.bold}>Total Amount (in words) :</Text> {totalAmountInText}
            </Text>
          </View>
          <View style={styles.flexRow}>
            <View style={{ width: '50%', padding: 5 }}>
              <Text style={styles.textSmall}>Note:</Text>
              <Text style={styles.textSmall}>{billData?.note}</Text>

              <Text style={[styles.textSmall, { marginTop: '10px' }]}>Terms:</Text>
              <Text style={styles.textSmall}>{billData?.terms}</Text>
            </View>
            <View style={{ width: '50%', borderLeft: '1px solid black', textAlign: 'center', padding: 5 }}>
              <Image src={companyDetails?.signature} style={{ height: 30, marginBottom: 10 }} />
              <Text style={styles.textSmall}>Authorised Signatory For</Text>
              <Text style={styles.textSmall}>{companyDetails?.name}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}


export {
  InvoicePdf
}
export default Invoice