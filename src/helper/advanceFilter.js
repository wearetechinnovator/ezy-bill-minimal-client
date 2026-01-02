/** 
 * @params filterUnit: today | previousday etc.
 * @params model: modelname, quotation | proforma etc.
 */


import moment from 'moment';
import Cookies from 'js-cookie';
import toast from '../hooks/useMyToaster'


export const getAdvanceFilterData = async (filterUnit, model, activePage, dataLimit) => {
  let today = moment();
  let singleDate;
  let fromDate;
  let toDate;


  switch (filterUnit) {
    case 'today':
      singleDate = today.format('YYYY-MM-DD');
      break;

    case 'yesterday':
      singleDate = today.clone().subtract(1, 'day').format('YYYY-MM-DD');
      break;

    case 'last7day':
      fromDate = today.clone().subtract(7, 'days').format('YYYY-MM-DD');
      toDate = today.format('YYYY-MM-DD');
      break;

    case 'last30day':
      fromDate = today.clone().subtract(30, 'days').format('YYYY-MM-DD');
      toDate = today.format('YYYY-MM-DD');
      break;

    case 'last365day':
      fromDate = today.clone().subtract(365, 'days').format('YYYY-MM-DD');
      toDate = today.format('YYYY-MM-DD');
      break;

    case 'thisweek':
      fromDate = today.clone().startOf('isoWeek').format('YYYY-MM-DD');  // Monday
      toDate = today.clone().endOf('isoWeek').format('YYYY-MM-DD');      // Sunday
      break;

    case 'lastweek':
      fromDate = today.clone().subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD');
      toDate = today.clone().subtract(1, 'week').endOf('isoWeek').format('YYYY-MM-DD');
      break;

    case 'thismonth':
      fromDate = today.clone().startOf('month').format('YYYY-MM-DD');
      toDate = today.clone().endOf('month').format('YYYY-MM-DD');
      break;

    case 'prevmonth':
      fromDate = today.clone().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      toDate = today.clone().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      break;

    case 'thisquarter':
      fromDate = today.clone().startOf('quarter').format('YYYY-MM-DD');
      toDate = today.clone().endOf('quarter').format('YYYY-MM-DD');
      break;

    case 'lastquarter':
      fromDate = today.clone().subtract(1, 'quarter').startOf('quarter').format('YYYY-MM-DD');
      toDate = today.clone().subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD');
      break;

    case 'currentfiscal': {
      const fiscalStartMonth = 3; // April
      if (today.month() < fiscalStartMonth) {
        fromDate = today.clone().subtract(1, 'year').month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      } else {
        fromDate = today.clone().month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().add(1, 'year').month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      }
      break;
    }

    case 'lastfiscal': {
      const fiscalStartMonth = 3; // April
      if (today.month() < fiscalStartMonth) {
        fromDate = today.clone().subtract(2, 'year').month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().subtract(1, 'year').month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      } else {
        fromDate = today.clone().subtract(1, 'year').month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      }
      break;
    }

    default:
      console.warn('Invalid filterUnit:', filterUnit);
  }


  // Api call
  try {
    const url = process.env.REACT_APP_API_URL + `/${model}/filter?page=${activePage}&limit=${dataLimit}`;

    const req = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({ token: Cookies.get("token"), fromDate, toDate, billDate: singleDate })
    });
    const res = await req.json();


    return {
      totalData: res?.totalData,
      data: res?.data
    }

  } catch (error) {
    console.log(error)
    return toast("Something went wrong", 'error')
  }


}