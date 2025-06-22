<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

try {
    $data = getJsonInput();
    
    // Validate required fields
    $required = ['id', 'name', 'code'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            sendResponse(['error' => "Field '$field' is required"], 400);
        }
    }

    // Check if field exists
    $stmt = $pdo->prepare("SELECT id FROM fields WHERE id = ?");
    $stmt->execute([$data['id']]);
    if (!$stmt->fetch()) {
        sendResponse(['error' => 'Field not found'], 404);
    }

    // Check if name or code already exists for other fields
    $stmt = $pdo->prepare("SELECT id FROM fields WHERE (name = ? OR code = ?) AND id != ?");
    $stmt->execute([$data['name'], $data['code'], $data['id']]);
    if ($stmt->fetch()) {
        sendResponse(['error' => 'A field with this name or code already exists'], 400);
    }

    // Update field
    $stmt = $pdo->prepare("
        UPDATE fields 
        SET name = ?, code = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['name'],
        $data['code'],
        $data['description'] ?? null,
        $data['id']
    ]);
    
    sendResponse([
        'success' => true,
        'message' => 'Field updated successfully'
    ]);

} catch (Exception $e) {
    sendResponse(['error' => 'Failed to update field: ' . $e->getMessage()], 500);
}
?>