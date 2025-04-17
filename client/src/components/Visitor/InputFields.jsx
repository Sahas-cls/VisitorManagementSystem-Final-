import React from 'react'

const InputFields = () => {
  return (
    <input
      type={type}
      className="bg-white text-gray-700 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  );
}

export default InputFields
