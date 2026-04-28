<?php
// api/data.php

// Set response headers
header('Content-Type: application/json; charset=utf-8');

// Security: Disable caching for dynamic requests
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Validate request type
if (!isset($_GET['type'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required query parameter: type'
    ]);
    exit;
}

$type = $_GET['type'];

// ------------------------------------------------------------------
// Backend Sensitive Logic & Credentials
// ------------------------------------------------------------------

// RSS feed URLs map
$rssFeeds = [
    'home'    => 'https://rss.app/feeds/v1.1/teH1Z3tRjJEnx5ES.json',
    'invest'  => 'https://rss.app/feeds/v1.1/tOw246CM8onzm3S2.json',
    'banking' => 'https://rss.app/feeds/v1.1/tULGe9Mv7Ygjsw56.json',
    'tax'     => 'https://rss.app/feeds/v1.1/tSm3lDxFDWGxXbPS.json',
    'crypto'  => 'https://rss.app/feeds/v1.1/tydxLpjI170g5wYa.json'
];


// ------------------------------------------------------------------
// Handle Request Type
// ------------------------------------------------------------------

if ($type === 'rss') {
    // Accept optional page parameter for RSS mapping (defaults to 'home')
    $page = isset($_GET['page']) ? $_GET['page'] : 'home';
    
    if (!array_key_exists($page, $rssFeeds)) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid page parameter for RSS feed'
        ]);
        exit;
    }
    
    $rssUrl = $rssFeeds[$page];
    
    $response = false;

    // Method 1: Use file_get_contents if allow_url_fopen is enabled
    if (ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => [
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n",
                'timeout' => 10
            ]
        ]);
        $response = @file_get_contents($rssUrl, false, $context);
    }

    // Method 2: Use cURL fallback if file_get_contents fails or is blocked
    if ($response === false && function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $rssUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        $response = curl_exec($ch);
        curl_close($ch);
    }
    
    if ($response === false) {
        http_response_code(502); // Bad Gateway
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch the requested RSS feed from upstream'
        ]);
        exit;
    }
    
    echo $response;
    exit;
    
} elseif ($type === 'subscribe') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method Not Allowed. Use POST.'
        ]);
        exit;
    }

    $jsonInput = file_get_contents('php://input');
    $inputData = json_decode($jsonInput, true);
    $email = isset($inputData['email']) ? filter_var($inputData['email'], FILTER_VALIDATE_EMAIL) : null;

    if (!$email) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid or missing email address.'
        ]);
        exit;
    }

    $supabaseUrl = 'https://rxqfvkspkkreykzsoegt.supabase.co/rest/v1/fintech';
    $supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cWZ2a3Nwa2tyZXlrenNvZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODA5MTAsImV4cCI6MjA4Mzg1NjkxMH0.8-kOuWbTdEN5T0AxX9yPiU3E1KWWrh4-GSAxRmdDqtk';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $supabaseUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey,
        'Content-Type: application/json',
        'Prefer: return=minimal'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Email successfully subscribed!'
        ]);
    } else {
        http_response_code($httpCode ?: 500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to store email in Supabase',
            'details' => $response
        ]);
    }
    exit;

} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request type'
    ]);
    exit;
}
