const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

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

    //  Create JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "24h",
    });

    // Respond with user details (excluding passwordHash)
    res.status(200).json({
      token,
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
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
  const { address, contact } = req.body;
  const email = req.user?.email;

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
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

// GET check whether user has address or not
exports.checkDeliveryInfo = async (req, res) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [rows] = await db.query(
      "SELECT physicalAddress, contactNumber FROM user WHERE email = ?",
      [userEmail]
    );

    // const user = rows[0];

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    const hasDeliveryInfo =
      Boolean(user?.physicalAddress) && Boolean(user?.contactNumber);

    return res.json({ hasDeliveryInfo });
  } catch (error) {
    console.error("Error checking delivery info:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET user contact info (physicalAddress and contactNumber)
exports.getUserContact = async (req, res) => {
  const email = req.user?.email;

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [rows] = await db.query(
      "SELECT physicalAddress, contactNumber FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { physicalAddress, contactNumber } = rows[0];

    res.status(200).json({ physicalAddress, contactNumber });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ message: "Server error" });
  }
};
