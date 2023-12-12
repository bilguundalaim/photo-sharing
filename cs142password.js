const {randomBytes, createHash} = require("node:crypto"); 

/**
 * Return a salted and hashed password entry from a clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry where passwordEntry is an object with two
 * string properties:
 *    salt - The salt used for the password.
 *    hash - The sha1 hash of the password and salt.
 */
function makePasswordEntry(clearTextPassword) {
  const salt = randomBytes(8).toString('hex');
  clearTextPassword = clearTextPassword.concat(salt);
  const hash = createHash("sha1").update(clearTextPassword).digest('hex');

  return {
    salt: salt,
    hash: hash,
  };
}

/**
 * Return true if the specified clear text password and salt generates the
 * specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
  clearTextPassword = clearTextPassword.concat(salt.toString());
  const newHash = createHash("sha1").update(clearTextPassword).digest('hex');

  return hash === newHash;
}

const cs142password = {
  makePasswordEntry: makePasswordEntry,
  doesPasswordMatch: doesPasswordMatch,
};

module.exports = cs142password;