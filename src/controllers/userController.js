const db = require("../config/db");
const bcrypt = require("bcrypt");

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM user");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Respond with user details (excluding passwordHash)
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST create user (registration of user -- still address is required)
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await db.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ message: "User already exists with this email." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    // Insert new user
    const [result] = await db.query(
      "INSERT INTO user (name, email, passwordHash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update user (physicalAddress and contactNumber)
exports.updateUserContact = async (req, res) => {
  const { email, address, contact } = req.body;

  try {
    // Check if user exists
    const [existingUser] = await db.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (existingUser.length === 0) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist." });
    }

    // Update user with address and contact
    await db.query(
      "UPDATE user SET physicalAddress = ?, contactNumber = ? WHERE email = ?",
      [address, contact, email]
    );

    res
      .status(200)
      .json({ message: "Contact information updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
