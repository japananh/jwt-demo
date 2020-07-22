const router = require("express").Router();
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
  if (error) return res.status(401).send({ error });

  const userExist = await User.findOne({ email });
  if (userExist)
    return res.status(400).send({ error: "This email already exists." });

  const hashedPassword = await encryptData(password);

  try {
    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();

    res.status(200).send({ success: true, data: { id: savedUser._id } });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginValidation(req.body);
  if (error) return res.status(401).send({ error });

  const userExist = await User.findOne({ email });
  if (!userExist)
    return res.status(401).send({ error: "Invalid email or password." });

  const isValidPassword = await decryptData(password, userExist.password);
  if (!isValidPassword || !userExist.email)
    return res.status(401).send({ error: "Invalid email or password." });

  const { name, email: userEmail, _id: id } = userExist;
  return res.status(200).send({ id, name, email: userEmail });
});

module.exports = router;
