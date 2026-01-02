import React, { Suspense, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ProtectRoute, UnProtectRoute } from "./components/ProtectRoute";
import ProtectCP from "./components/ProtectCP";

const Login = React.lazy(() => import("./pages/Auth/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const AddQutation = React.lazy(() => import("./pages/quotation/AddQuotation"));
const Quotation = React.lazy(() => import("./pages/quotation/Quotation"));
const Profile = React.lazy(() => import("./pages/Auth/Profile"));
const Signup = React.lazy(() => import("./pages/Auth/Signup"));
const Accounts = React.lazy(() => import("./pages/accounts/Accounts"));
const AddAccount = React.lazy(() => import("./pages/accounts/AddAccount"));
const Setting = React.lazy(() => import("./pages/Setting"));
const Party = React.lazy(() => import("./pages/party/Party"));
const AddParty = React.lazy(() => import('./pages/party/AddParty'));
const TransactionAdd = React.lazy(() => import("./pages/Transactions/TransactionAdd"));
const Transaction = React.lazy(() => import("./pages/Transactions/Transaction"));
const UnitAdd = React.lazy(() => import("./pages/Unit/UnitAdd"));
const Unit = React.lazy(() => import("./pages/Unit/Unit"));
const Tax = React.lazy(() => import("./pages/Tax/Tax"));
const TaxAdd = React.lazy(() => import("./pages/Tax/TaxAdd"));
const CategoryAdd = React.lazy(() => import("./pages/Item/CategoryAdd"));
const Category = React.lazy(() => import("./pages/Item/Category"));
const ItemAdd = React.lazy(() => import("./pages/Items/ItemAdd"));
const Item = React.lazy(() => import("./pages/Items/Item"));
const AddCompany = React.lazy(() => import("./pages/company/AddCompany"));
const Forgot = React.lazy(() => import("./pages/Auth/Forgot"));
const Otp = React.lazy(() => import("./pages/Auth/Otp"));
const ChangePassword = React.lazy(() => import("./pages/Auth/ChangePassword"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Invoice = React.lazy(() => import("./pages/details/Invoice"));
const AddPaymentOut = React.lazy(() => import("./pages/paymentout/AddPayment"));
const AddPaymentIn = React.lazy(() => import("./pages/paymentin/AddPayment"));
const PaymentIn = React.lazy(() => import("./pages/paymentin/PaymentIn"));
const PaymentOut = React.lazy(() => import("./pages/paymentout/PaymentOut"));
const AddProforma = React.lazy(() => import("./pages/proforma/AddProforma"));
const Proforma = React.lazy(() => import("./pages/proforma/Proforma"));
const Po = React.lazy(() => import("./pages/po/Po"));
const AddPo = React.lazy(() => import("./pages/po/AddPo"));
const PurchaseInvoice = React.lazy(() => import("./pages/purchaseinvoice/PurchaseInvoice"));
const AddPurchaseInvoice = React.lazy(() => import("./pages/purchaseinvoice/AddPurchaseInvoice"));
const PurchaseReturn = React.lazy(() => import("./pages/purchasereturn/PurchaseReturn"));
const AddPurchaseReturn = React.lazy(() => import("./pages/purchasereturn/AddPurchaseReturn"));
const DebitNote = React.lazy(() => import("./pages/debitnote/DebitNote"));
const AddDebitNote = React.lazy(() => import("./pages/debitnote/AddDebitNote"));
const SalesInvoice = React.lazy(() => import("./pages/salesinvoice/SalesInvoice"));
const AddSalesInvoice = React.lazy(() => import("./pages/salesinvoice/AddSalesInvoice"));
const SalesReturn = React.lazy(() => import("./pages/salesreturn/SalesReturn"));
const AddSalesReturn = React.lazy(() => import("./pages/salesreturn/AddSalesReturn"));
const CreditNote = React.lazy(() => import("./pages/creditnote/CreditNote"));
const AddCreditNote = React.lazy(() => import("./pages/creditnote/AddCreditNote"));
const DeliveryChalan = React.lazy(() => import("./pages/deliverychalan/DeliveryChalan"));
const AddDeliveryChalan = React.lazy(() => import("./pages/deliverychalan/AddDeliveryChalan"));
const Ladger = React.lazy(() => import("./pages/party/Ladger"));
const PartyDetails = React.lazy(() => import("./pages/party/Details"));
const ItemDetails = React.lazy(() => import("./pages/Items/Details"));
const CategoryDetails = React.lazy(() => import("./pages/Item/Details"));

// Report
const DayBook = React.lazy(()=>import('./pages/Report/Daybook'));




const App = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        navigate(-1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);


  return (
    <Suspense fallback={<div className="grid place-items-center w-full min-h-[100vh]">
      <div className="flex flex-row gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>}>
      <Routes>
        <Route path="/admin" element={<UnProtectRoute login={true}><Login /></UnProtectRoute>} />
        <Route path="/" element={<UnProtectRoute login={true}><Login /></UnProtectRoute>} />
        <Route path="/admin/signup" element={<UnProtectRoute login={true}><Signup /></UnProtectRoute>} />
        <Route path="/admin/forget" element={<UnProtectRoute login={true}><Forgot /></UnProtectRoute>} />
        <Route path="/admin/otp" element={<UnProtectRoute login={true}><Otp /></UnProtectRoute>} />
        <Route path="/admin/change-password" element={<ProtectCP><ChangePassword /></ProtectCP>} />

        <Route path="/admin" element={<ProtectRoute />}>
          <Route path="profile" element={<Profile />} />
          <Route path="site" element={<Setting />} />
          <Route path="company" element={<AddCompany />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Print part */}
          <Route path="bill/details/:bill/:id" element={<Invoice />} />

          {/* Quotation route */}
          <Route path="quotation-estimate" element={<Quotation />} />
          <Route path="quotation-estimate/add/:id?" element={<AddQutation />} />
          <Route path="quotation-estimate/edit/:id" element={<AddQutation mode={"edit"} />} />

          {/* Proforma route */}
          <Route path="proforma-invoice" element={<Proforma />} />
          <Route path="proforma-invoice/add/:id?" element={<AddProforma />} />
          <Route path="proforma-invoice/convert/add/:id" element={<AddProforma mode={'convert'} />} />
          <Route path="proforma-invoice/edit/:id" element={<AddProforma mode={"edit"} />} />

          {/* PO route */}
          <Route path="purchase-order" element={<Po />} />
          <Route path="purchase-order/add/:id?" element={<AddPo />} />
          <Route path="purchase-order/edit/:id" element={<AddPo mode={"edit"} />} />

          {/* Purchase Invoice route */}
          <Route path="purchase-invoice" element={<PurchaseInvoice />} />
          <Route path="purchase-invoice/add/:id?" element={<AddPurchaseInvoice />} />
          <Route path="purchase-invoice/convert/add/:id" element={<AddPurchaseInvoice mode={"convert"} />} />
          <Route path="purchase-invoice/edit/:id" element={<AddPurchaseInvoice mode={"edit"} />} />

          {/* Purchase Return route */}
          <Route path="purchase-return" element={<PurchaseReturn />} />
          <Route path="purchase-return/add/:id?" element={<AddPurchaseReturn />} />
          <Route path="purchase-return/edit/:id" element={<AddPurchaseReturn mode={"edit"} />} />

          {/* Debit Note route */}
          <Route path="debit-note" element={<DebitNote />} />
          <Route path="debit-note/add/:id?" element={<AddDebitNote />} />
          <Route path="debit-note/edit/:id" element={<AddDebitNote mode={"edit"} />} />

          {/* Sales Invoice route */}
          <Route path="sales-invoice" element={<SalesInvoice />} />
          <Route path="sales-invoice/add/:id?" element={<AddSalesInvoice />} />
          <Route path="sales-invoice/convert/add/:id" element={<AddSalesInvoice mode={"convert"} />} />
          <Route path="sales-invoice/edit/:id" element={<AddSalesInvoice mode={"edit"} />} />

          {/* Sales Return route */}
          <Route path="sales-return" element={<SalesReturn />} />
          <Route path="sales-return/add/:id?" element={<AddSalesReturn />} />
          <Route path="sales-return/edit/:id" element={<AddSalesReturn mode={"edit"} />} />

          {/* Credit Note route */}
          <Route path="credit-note" element={<CreditNote />} />
          <Route path="credit-note/add/:id?" element={<AddCreditNote />} />
          <Route path="credit-note/edit/:id" element={<AddCreditNote mode={"edit"} />} />

          {/* Delivery Chalan route */}
          <Route path="delivery-chalan" element={<DeliveryChalan />} />
          <Route path="delivery-chalan/add/:id?" element={<AddDeliveryChalan />} />
          <Route path="delivery-chalan/edit/:id" element={<AddDeliveryChalan mode={"edit"} />} />

          {/* Account */}
          <Route path="account/add" element={<AddAccount />} />
          <Route path="account/edit/:id" element={<AddAccount mode="edit" />} />
          <Route path="account" element={<Accounts />} />

          <Route path="party" element={<Party />} />
          <Route path="party/add" element={<AddParty />} />
          <Route path="party/edit/:id" element={<AddParty mode={"edit"} />} />
          <Route path="party/details/:id" element={<PartyDetails />} />

          <Route path="other-transaction/add" element={<TransactionAdd />} />
          <Route path="other-transaction/edit/:id" element={<TransactionAdd mode="edit" />} />
          <Route path="other-transaction" element={<Transaction />} />

          <Route path="unit" element={<Unit />} />
          <Route path="unit/add" element={<UnitAdd />} />
          <Route path="unit/edit/:id" element={<UnitAdd mode="edit" />} />

          <Route path="other-transaction" element={<Transaction />} />
          <Route path="other-transaction/add" element={<TransactionAdd />} />
          <Route path="other-transaction/edit" element={<TransactionAdd mode="edit" />} />

          <Route path="tax" element={<Tax />} />
          <Route path="tax/add" element={<TaxAdd />} />
          <Route path="tax/edit/:id" element={<TaxAdd mode="edit" />} />

          <Route path="item-category" element={<Category />} />
          <Route path="item-category/add" element={< CategoryAdd />} />
          <Route path="item-category/edit/:id" element={< CategoryAdd mode="edit" />} />
          <Route path="item-category/details/:id" element={<CategoryDetails />} />

          <Route path="item" element={<Item />} />
          <Route path="item/add" element={<ItemAdd />} />
          <Route path="item/edit/:id" element={<ItemAdd mode="edit" />} />
          <Route path="item/details/:id" element={<ItemDetails />} />

          <Route path="payment-out/add" element={<AddPaymentOut />} />
          <Route path="payment-out/edit/:id" element={<AddPaymentOut mode={"edit"} />} />
          <Route path="payment-out" element={<PaymentOut />} />

          <Route path="payment-in/add" element={<AddPaymentIn />} />
          <Route path="payment-in/edit/:id" element={<AddPaymentIn mode={"edit"} />} />
          <Route path="payment-in" element={<PaymentIn />} />

          <Route path="report/daybook" element={<DayBook/>}/>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>

  )
}

export default App;
