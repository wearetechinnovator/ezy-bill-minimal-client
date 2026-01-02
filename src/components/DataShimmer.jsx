import React from 'react'

const DataShimmer = () => {
  return (
    <div className='shimmer__parent'>
      {/* table text */}
      <div>
        <div className='flex flex-col gap-2'>
          {Array.from({ length: 8 }).map((i, _) =>
            <div key={i} className='animate w-full h-[20px] rounded'></div>)}
        </div>
      </div>
    </div>
  )
}

export default DataShimmer;
