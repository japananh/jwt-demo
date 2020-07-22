const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const {
  registerValidation,
  encryptData,
  loginValidation,
  decryptData,
} = require("../validation");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  const userExist = await User.findOne({ email });
  if (userExist)
    return res.status(409).send({ error: "This email already exists." });

  const hashedPassword = await encryptData(password);

  try {
    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();

    res.status(200).send({ success: true, data: { id: savedUser._id } });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginValidation(req.body);
  if (error) return res.status(404).send({ error: error.details[0].message });

  const userExist = await User.findOne({ email });
  if (!userExist)
    return res.status(400).send({ error: "Invalid email or password." });

  const isValidPassword = await decryptData(password, userExist.password);
  if (!isValidPassword || !userExist.email)
    return res.status(400).send({ error: "Invalid email or password." });

  const token = jwt.sign({ id: userExist._id }, process.env.SECRET_TOKEN);
  res.header("auth-token", token);
  res.status(200).send({ token });
});

module.exports = router;
