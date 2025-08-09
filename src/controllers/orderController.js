const db = require("../config/db");

// Create orders (bulk insert)
exports.createOrder = async (req, res) => {
  const orderedItems = req.body;
  const userID = req.user?.id; // <- updated based on token payload

  if (!userID) {
    return res.status(401).json({ message: "Unauthorized: User ID not found" });
  }

  if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  const safeItems = orderedItems.map((item) => ({
    ...item,
    userID,
  }));

  
  const keys = Object.keys(safeItems[0]);
  const values = safeItems.map((item) => keys.map((key) => item[key]));

  const sql = `
    INSERT INTO orderedItems (${keys.join(", ")})
    VALUES ${values.map(() => `(${keys.map(() => "?").join(", ")})`).join(", ")}
  `;

  try {
    await db.query(sql, values.flat());
    res.status(201).json({ message: "Orders saved successfully" });
  } catch (error) {
    console.error("Create order error:", error.sqlMessage || error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orderedItems");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get orders by userID (from token or query param)
exports.getOrdersByUserID = async (req, res) => {
  const userID = req.user?.id;

  if (!userID) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const [orders] = await db.query(
      "SELECT * FROM orderedItems WHERE userID = ?",
      [userID]
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders by user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
