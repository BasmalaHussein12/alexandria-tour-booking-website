<?php
/* ============================================
   ALEXANDRIA GUIDE - SAVE TOUR BOOKING
   ============================================ */

require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    jsonResponse(false, 'Invalid request data');
}

$user_id = isset($input['user_id']) ? (int)$input['user_id'] : 0;
$places = isset($input['places']) && is_array($input['places']) ? $input['places'] : [];

if ($user_id <= 0) {
    jsonResponse(false, 'User authentication required');
}

if (empty($places)) {
    jsonResponse(false, 'No places selected for the tour');
}

try {
    // Create bookings table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        place_name VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    
    // Insert each place as a booking
    $stmt = $pdo->prepare("INSERT INTO bookings (user_id, place_name) VALUES (?, ?)");
    
    foreach ($places as $place) {
        $stmt->execute([$user_id, sanitize($place)]);
    }
    
    jsonResponse(true, 'Tour saved successfully!');
    
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to save tour: ' . $e->getMessage());
}
