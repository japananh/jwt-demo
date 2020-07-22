const router = require("express").Router();
const User = require("../model/User");
const { registerValidation, bycryptData } = require("../validation");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const { error } = registerValidation(req.body);
  if (error) return res.status(401).send({ error });

  const emailExist = await User.findOne({ email });
  if (emailExist)
    return res.status(400).send({ error: "This email already exists." });

  const hashedPassword = await bycryptData(password);

  try {
    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();

    res.status(200).send({ success: true, data: { id: savedUser._id } });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
