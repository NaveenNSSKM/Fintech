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
    
    // Fetch using file_get_contents
    $context = stream_context_create([
        'http' => [
            'header' => "User-Agent: PHP Proxy Service\r\n",
            'timeout' => 10 // Timeout in seconds
        ]
    ]);
    
    $response = @file_get_contents($rssUrl, false, $context);
    
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
    
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request type'
    ]);
    exit;
}
