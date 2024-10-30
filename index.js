const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


// Buat koneksi ke MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Sesuaikan dengan user MySQL Anda, defaultnya adalah 'root' di Laragon
  password: '',        // Jika ada password, tambahkan di sini, defaultnya biasanya kosong di Laragon
  database: 'film' // Ganti dengan nama database yang Anda gunakan
});

// Cek koneksi ke MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve file statis hasil build Vue.js
app.use('/admin', express.static(path.join(__dirname, 'admin-dashboard/dist')));

// Mengarahkan route root (/) langsung ke halaman register
app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  // Simpan user ke database (ganti dari console.log menjadi insert ke database)
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Error inserting user into database:", err);
      return res.status(500).send("Error occurred");
    }
    console.log("New User added:", { username, password });
    res.redirect("/login");
  });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Cek user dari database untuk login
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("Error fetching user from database:", err);
      return res.status(500).send("Error occurred");
    }

    if (results.length > 0) {
      console.log("User authenticated:", { username, password });
      res.redirect(`/dashboard?username=${username}`);
    } else {
      console.log("Invalid credentials");
      res.status(401).send("Invalid credentials");
    }
  });
});

app.get("/dashboard", (req, res) => {
  const username = req.query.username;
  res.render("dashboard", { title: "Dashboard", username });
});

app.get("/api/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users from database:", err);
      return res.status(500).send("Error occurred");
    }
    res.json(results); // Mengirim data dalam format JSON
  });
});

app.post("/api/users", (req, res) => {
  const { username, password } = req.body;
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Error adding user:", err);
      return res.status(500).send("Error occurred");
    }
    res.json({ id: result.insertId, username, password });
  });
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const sql = "UPDATE users SET username = ?, password = ? WHERE id = ?";
  db.query(sql, [username, password, id], (err) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("User updated successfully");
  });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("User deleted successfully");
  });
});


app.get("/api/movies", (req, res) => {
  const sql = "SELECT * FROM movies";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching movies from database:", err);
      return res.status(500).send("Error occurred");
    }
    res.json(results);
  });
});

app.post("/api/movies", (req, res) => {
  const { title, genre, release_year, rating, description } = req.body;
  const sql = "INSERT INTO movies (title, genre, release_year, rating, description) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [title, genre, release_year, rating, description], (err, result) => {
    if (err) {
      console.error("Error adding movie:", err);
      return res.status(500).send("Error occurred");
    }
    res.json({ id: result.insertId, title, genre, release_year, rating, description });
  });
});


app.put("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, genre, release_year, rating, description } = req.body;
  const sql = "UPDATE movies SET title = ?, genre = ?, release_year = ?, rating = ?, description = ? WHERE id = ?";
  db.query(sql, [title, genre, release_year, rating, description, id], (err) => {
    if (err) {
      console.error("Error updating movie:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Movie updated successfully");
  });
});


app.delete("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM movies WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting movie:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Movie deleted successfully");
  });
});

app.get("/api/theaters", (req, res) => {
  const sql = "SELECT * FROM theaters";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching theaters from database:", err);
      return res.status(500).send("Error occurred");
    }
    res.json(results);
  });
});

app.post("/api/theaters", (req, res) => {
  const { name, location, capacity, description } = req.body;
  const sql = "INSERT INTO theaters (name, location, capacity, description) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, location, capacity, description], (err, result) => {
    if (err) {
      console.error("Error adding theater:", err);
      return res.status(500).send("Error occurred");
    }
    res.json({ id: result.insertId, name, location, capacity, description });
  });
});


app.put("/api/theaters/:id", (req, res) => {
  const { id } = req.params;
  const { name, location, capacity, description } = req.body;
  const sql = "UPDATE theaters SET name = ?, location = ?, capacity = ?, description = ? WHERE id = ?";
  db.query(sql, [name, location, capacity, description, id], (err) => {
    if (err) {
      console.error("Error updating theater:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Theater updated successfully");
  });
});

app.delete("/api/theaters/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM theaters WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting theater:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Theater deleted successfully");
  });
});

app.get("/api/bookings", (req, res) => {
  const sql = `
    SELECT bookings.id, bookings.name, movies.title AS movie_title, theaters.name AS theater_name, 
           bookings.booking_date, bookings.seats
    FROM bookings
    JOIN movies ON bookings.movie_id = movies.id
    JOIN theaters ON bookings.theater_id = theaters.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching bookings from database:", err);
      return res.status(500).send("Error occurred");
    }
    res.json(results);
  });
});

app.post("/api/bookings", (req, res) => {
  const { name, movie_id, theater_id, booking_date, seats } = req.body;
  const sql = "INSERT INTO bookings (name, movie_id, theater_id, booking_date, seats) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, movie_id, theater_id, booking_date, seats], (err, result) => {
    if (err) {
      console.error("Error adding booking:", err);
      return res.status(500).send("Error occurred");
    }
    res.json({ id: result.insertId, name, movie_id, theater_id, booking_date, seats });
  });
});

app.put("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { name, movie_id, theater_id, booking_date, seats } = req.body;
  const sql = "UPDATE bookings SET name = ?, movie_id = ?, theater_id = ?, booking_date = ?, seats = ? WHERE id = ?";
  db.query(sql, [name, movie_id, theater_id, booking_date, seats, id], (err) => {
    if (err) {
      console.error("Error updating booking:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Booking updated successfully");
  });
});

app.delete("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM bookings WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting booking:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Booking deleted successfully");
  });
});

app.get("/api/payments", (req, res) => {
  const sql = `
    SELECT payments.id, payments.amount, payments.payment_date, payments.status, 
           bookings.name AS booking_name, bookings.booking_date
    FROM payments
    JOIN bookings ON payments.booking_id = bookings.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching payments from database:", err);
      return res.status(500).send("Error occurred");
    }
    res.json(results);
  });
});

app.post("/api/payments", (req, res) => {
  const { booking_id, amount, payment_date, status } = req.body;
  const sql = "INSERT INTO payments (booking_id, amount, payment_date, status) VALUES (?, ?, ?, ?)";
  db.query(sql, [booking_id, amount, payment_date, status], (err, result) => {
    if (err) {
      console.error("Error adding payment:", err);
      return res.status(500).send("Error occurred");
    }
    res.json({ id: result.insertId, booking_id, amount, payment_date, status });
  });
});

app.put("/api/payments/:id", (req, res) => {
  const { id } = req.params;
  const { booking_id, amount, payment_date, status } = req.body;
  const sql = "UPDATE payments SET booking_id = ?, amount = ?, payment_date = ?, status = ? WHERE id = ?";
  db.query(sql, [booking_id, amount, payment_date, status, id], (err) => {
    if (err) {
      console.error("Error updating payment:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Payment updated successfully");
  });
});

app.delete("/api/payments/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM payments WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting payment:", err);
      return res.status(500).send("Error occurred");
    }
    res.send("Payment deleted successfully");
  });
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});