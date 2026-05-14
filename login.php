<?php
/* ============================================
   ALEXANDRIA GUIDE - USER LOGIN
   ============================================ */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Get input data
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// Validation
if (empty($email) || empty($password)) {
    jsonResponse(false, 'Email and password are required');
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address');
}

try {
    // Check if users table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    
    // Find user by email
    $stmt = $pdo->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        jsonResponse(false, 'Invalid email or password');
    }
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        jsonResponse(false, 'Invalid email or password');
    }
    
    // Start session
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    
    jsonResponse(true, 'Login successful!', [
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email']
        ]
    ]);
    
} catch (PDOException $e) {
    jsonResponse(false, 'Login failed: ' . $e->getMessage());
}
