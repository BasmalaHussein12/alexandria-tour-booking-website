<?php
/* ============================================
   ALEXANDRIA GUIDE - CONTACT FORM PROCESSING
   ============================================ */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Get input data
$name = isset($_POST['name']) ? sanitize($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$message = isset($_POST['message']) ? sanitize($_POST['message']) : '';

// Validation
if (empty($name) || empty($email) || empty($message)) {
    jsonResponse(false, 'All fields are required');
}

if (strlen($name) < 2) {
    jsonResponse(false, 'Name must be at least 2 characters');
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address');
}

if (strlen($message) < 10) {
    jsonResponse(false, 'Message must be at least 10 characters');
}

try {
    // Create messages table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    
    // Insert message
    $stmt = $pdo->prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $message]);
    
    jsonResponse(true, 'Message sent successfully! We will get back to you soon.');
    
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to send message: ' . $e->getMessage());
}
