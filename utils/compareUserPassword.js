const bcrypt = require("bcrypt");

async function comparePasswords(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = comparePasswords;
