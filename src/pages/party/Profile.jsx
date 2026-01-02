import React, { useEffect, useState } from 'react'
import { Icons } from '../../helper/icons'
import useApi from '../../hooks/useApi'
import { useNavigate, useParams } from 'react-router-dom'


const Profile = () => {
  const { getApiData } = useApi();
  const { id } = useParams();
  const [data, setData] = useState();
  const navigate = useNavigate();


  useEffect(() => {
    const get = async () => {
      const res = await getApiData("party", id);
      setData(res.data);
    }
    get()
  }, [])

  return (
    <div className='flex justify-between gap-5'>
      <div className='content__body__main w-full'>
        <div className='details__header'>
          <p className='font-bold flex items-center gap-1'>
            <Icons.INVOICE />
            General Details
          </p>

          <Icons.PENCIL
            className='pencil'
            onClick={() => navigate(`/admin/party/edit/${id}`)} />
        </div>
        <hr />

        <div className='flex  gap-2 pl-4'>
          <div className='w-full flex flex-col justify-between gap-5 text-xs'>
            <div>
              <p className='text-gray-400'>Party Name</p>
              <p>{data?.name}</p>
            </div>
            <div>
              <p className='text-gray-400'>Mobile Number</p>
              <p>{data?.contactNumber}</p>
            </div>
            <div>
              <p className='text-gray-400'>Email</p>
              <p>{data?.email || "--"}</p>
            </div>
            <div>
              <p className='text-gray-400'>Opening Balance</p>
              <p className='flex items-center gap-1'><Icons.RUPES /> {data?.openingBalance || 0.00}</p>
            </div>
          </div>
          <div className='w-full flex flex-col justify-start gap-5 text-xs'>
            <div>
              <p className='text-gray-400'>Party Type</p>
              <p>{data?.type}</p>
            </div>
            <div>
              <p className='text-gray-400'>Party Category</p>
              <p>{data?.partyCategory?.name || "--"}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Party details close here ::::::::::::::::: */}

      <div className='content__body__main w-full '>
        <div className='details__header'>
          <p className='font-bold flex items-center gap-1'>
            <Icons.BUSINESS />
            Buisness Details
          </p>
          <Icons.PENCIL
            className='pencil'
            onClick={() => navigate(`/admin/party/edit/${id}`)} />
        </div>
        <hr />

        <div className='pl-4'>
          <div className='flex justify-between gap-2'>
            <div className='w-full'>
              <p className='text-gray-400'>GSTIN</p>
              <p>{data?.gst || "--"}</p>
            </div>
            <div className='w-full'>
              <p className='text-gray-400'>PAN Number</p>
              <p>{data?.pan || "--"}</p>
            </div>
          </div>

          <div className='my-5'>
            <p className='text-gray-400'>Billing Address</p>
            <p>{data?.billingAddress}</p>
          </div>
          <div>
            <p className='text-gray-400'>Shipping Address</p>
            <p>{data?.shippingAddress}</p>
          </div>
        </div>
      </div>
      {/* Business details close here :::::::::::::: */}
    </div>
  )
}

export default Profile