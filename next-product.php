<?php
// Shared product-image counter for all users accessing this same PHP server.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$productsDir = __DIR__ . DIRECTORY_SEPARATOR . 'Products';
$counterFile = $productsDir . DIRECTORY_SEPARATOR . '.download-counter.txt';

if (!is_dir($productsDir) || !is_writable($productsDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'The Products folder must exist and be writable by PHP.']);
    exit;
}

$fp = fopen($counterFile, 'c+');
if (!$fp) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not open the shared product counter.']);
    exit;
}

// Lock while reading/updating so two users downloading at once do not get the same number.
if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    http_response_code(500);
    echo json_encode(['error' => 'Could not lock the shared product counter.']);
    exit;
}

rewind($fp);
$stored = trim(stream_get_contents($fp));
$index = ($stored === '' || !ctype_digit($stored)) ? 0 : (int)$stored;

if ($index > 20) {
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(409);
    echo json_encode(['error' => 'All 21 product images have been assigned. Add more product images before downloading again.']);
    exit;
}

$filename = $index === 0 ? 'product.jfif' : 'product(' . $index . ').jfif';
if (!is_file($productsDir . DIRECTORY_SEPARATOR . $filename)) {
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(404);
    echo json_encode(['error' => 'Missing image: Products/' . $filename]);
    exit;
}

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, (string)($index + 1));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['filename' => $filename]);
