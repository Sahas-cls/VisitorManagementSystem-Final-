import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import 'react-datepicker/dist/react-datepicker.css';

const PopupBox = () => {

  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
    console.log(open);
  }

  return (
    <div>
      <button onClick={() => { console.log("hello"); toggleOpen() }} className='btn'>click here to popup</button>

      <Modal isOpen={open} className='bg-blue-400' style={{ width: "50%", height: "50vh" }}>
        <h1>Model body</h1>
        <input type="date" className='input' name="" id="" />
        <button className='btn' onClick={() => { toggleOpen() }}>Close model</button>

      </Modal>
    </div>
  )
}

export default PopupBox
