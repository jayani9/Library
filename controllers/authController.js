import userModel from "../models/user.model.js"; // import user model
import bcrypt from "bcrypt"; // import password encorder
import jwt from "jsonwebtoken";

const userNameExist = (userName) => {
  return userModel.findOne({ userName }).exec();
};

const emailExist = (email) => {
  return userModel.findOne({ email }).exec();
};

const hashPassword = async (password) => {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return hashedPassword;
};

const registerUser = async (req, res) => {
  try {
    const { userName, password, email, firstName, address, role } = req.body;

    // check username already exist
    const existingUser = await userNameExist(userName);
    if (existingUser) {
      return res.status(401).send({ message: "User is already exists." });
    }

    // check email already exist
    const existingEmail = await emailExist(email);
    if (existingEmail) {
      return res.status(401).send({ message: "Email is already use." });
    }

    const hashedPassword = await hashPassword(password); // hash password

    const newUser = new userModel({
      userName,
      password: hashedPassword,
      email,
      firstName,
      address,
      role,
    });

    // Save the new user to the database
    await newUser.save();

    return res.status(200).send({ message: "User registered successfully." });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const compareHashPassword = (password, hashPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashPassword, (error, passwordMatch) => {
      if (error) reject(error);
      resolve(passwordMatch);
    });
  });
};

const generateToken = (user, key, time) => {
  const token = jwt.sign({ userId: user._id }, key, {
    expiresIn: time,
  });
  return token;
};

const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Find user by username
    const user = await userNameExist(userName);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Compare the provided password with the hashed password
    const isMatch = await compareHashPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    // Generate access and refresh tokens
    const accessToken = generateToken(user, process.env.ACCESS_KEY, "10m");
    const refreshToken = generateToken(user, process.env.REFRESH_KEY, "1h");

    // Save refresh token to the user's document
    user.refreshToken = refreshToken;
    await user.save();

    // Return the login response without exposing the password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.status(200).send({
      message: "Login successful.",
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const getToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    // Find the user with the provided refresh token
    const user = await userModel.findOne({ refreshToken });
    if (!user) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Forbidden" });
      }

      // Generate a new access token
      const accessToken = generateToken(user, process.env.ACCESS_KEY, "10m");
      return res.status(200).send({ accessToken });
    });
  } catch (error) {
    console.error("Get Token Error:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const logOut = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is missing" });
    }
    const user = await userModel.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: "" } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found or already logged out" });
    }

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const result = await userModel.find({});

    if (result.length === 0) {
      return res.status(204).json({ message: "No users found" });
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  registerUser,
  loginUser,
  getToken,
  logOut,
  getAllUsers,
};
