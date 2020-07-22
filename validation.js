const Joi = require("@hapi/joi");
const bycrypt = require("bcrypt");

function registerValidation(dataObject) {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(/(?=.*\d)(?=.*[a-z])(?=.*[~`!@#\\$%^&*()_\-+=<>,.?/:;"'])/i)
      .required(),
  });

  return schema.validate(dataObject);
}

function loginValidation(dataObject) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(dataObject);
}

async function encryptData(string) {
  const salt = await bycrypt.genSalt(10);
  const hashedString = await bycrypt.hash(string, salt);
  return hashedString;
}

async function decryptData(string, hashedString) {
  const isValid = await bycrypt.compare(string, hashedString);
  return isValid;
}

module.exports = {
  loginValidation,
  registerValidation,
  encryptData,
  decryptData,
};
