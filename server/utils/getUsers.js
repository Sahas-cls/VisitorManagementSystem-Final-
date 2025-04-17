// !this function for select all users to send email to them using their factory id and department id
const { Op } = require("sequelize");
const db = require("../models");
const { department_Users } = db;

async function findUsers(factoryId, departmentId) {
  const usersList = await department_Users.findAll({
    where: {
      [Op.and]: [{ factory_Id: factoryId }, { department_Id: departmentId }],
    },
  });

  let emailAddresses = "";

  if (usersList && usersList.length > 0) {
    emailAddresses = usersList
      .map((user) => user.dataValues.user_email)
      .join(",");
    console.log(emailAddresses);
  } else {
    console.log("Cannot find users");
  }
  return emailAddresses;
}

module.exports = findUsers;
