import { Modal } from 'rsuite'
import { Icons } from '../helper/icons'
import { useDispatch, useSelector } from 'react-redux';
import { toggleModal } from '../store/deleteModalSlice';



const DeleteConfirmModal = ({ title, onYesFunc }) => {
    const dispatch = useDispatch();
    const deleteModal = useSelector(state => state.deleteModal.show);


    return (
        <Modal
            open={deleteModal}
            size={'xs'}
            onClose={() => dispatch(toggleModal(false))}
        >
            <Modal.Header className='pb-2'>
                <p className='flex items-center gap-1'>
                    <Icons.DELETE className='bg-red-400 rounded-full w-[17px] h-[17px] text-white p-[2px]' />
                    <span className='text-xs'>Delete {title}</span>
                </p>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='flex flex-col items-center justify-center text-center'>
                    <Icons.DELETE className='text-2xl text-red-400 ' />
                    <p className='text-xl mt-2 font-semibold'>Are You Sure?</p>
                    <p className='mt-6 text-xs'>Do you really want to delete these records? This process cannot be undone.</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className='w-full flex gap-2 items-center mt-6'>
                    <button
                        onClick={() => dispatch(toggleModal(false))}
                        className='w-full bg-red-300 hover:bg-red-200 text-white rounded p-2'>
                        No
                    </button>
                    <button
                        onClick={() => {
                            onYesFunc();
                            dispatch(toggleModal(false));
                        }}
                        className='w-full bg-red-500 hover:bg-red-400 text-white rounded p-2'>
                        Yes
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteConfirmModal;