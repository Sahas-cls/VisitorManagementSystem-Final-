import React from 'react'

const CReport = () => {
  return (
    <div className="cContainer">
      <div className="cContainer-wrapper">

        <table className="tblReport">
          <thead>
            <th>Name</th>
            <th>NIC/DL No/PP No</th>
            <th>Vehicle No</th>
            <th>Requested Dept</th>
            <th>Meal</th>
            <th>Status</th>
            <th>Date</th>
          </thead>

          <tr>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
          </tr>
          <tr>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
          </tr>
        </table>
      </div>
    </div>
  )
}

export default CReport
