<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$file = __DIR__ . '/backend/data.txt';

if (!file_exists($file)) {
    echo json_encode(["error" => "data.txt not found"]);
    exit;
}

// Get the latest contents
$line = trim(file_get_contents($file));
$values = explode(',', $line);

// Ensure there are 3 numeric values
if (count($values) == 3 && is_numeric($values[0]) && is_numeric($values[1]) && is_numeric($values[2])) {
    echo json_encode([
        "temperature" => floatval($values[0]),
        "humidity" => floatval($values[1]),
        "distance" => floatval($values[2]),
        "timestamp" => filemtime($file)
    ]);
} else {
    echo json_encode(["error" => "Invalid data format", "raw" => $line]);
}
?>
