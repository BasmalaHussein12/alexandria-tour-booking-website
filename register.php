<?php
/* ============================================
   ALEXANDRIA GUIDE - USER REGISTRATION
   ============================================ */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Get input data
$name = isset($_POST['name']) ? sanitize($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// Validation
if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(false, 'All fields are required');
}

if (strlen($name) < 2) {
    jsonResponse(false, 'Name must be at least 2 characters');
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address');
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters');
}

try {
    // Check if users table exists, create if not
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        jsonResponse(false, 'Email address is already registered');
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert user
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $hashedPassword]);
    
    $userId = $pdo->lastInsertId();
    
    // Start session
    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email'] = $email;
    
    jsonResponse(true, 'Account created successfully!', [
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email
        ]
    ]);
    
} catch (PDOException $e) {
    jsonResponse(false, 'Registration failed: ' . $e->getMessage());
}
