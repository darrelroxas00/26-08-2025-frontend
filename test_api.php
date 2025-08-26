<?php
/**
 * Simple API Test Script
 * Run this to test if your API endpoints are working
 */

// Test the beneficiary details endpoint
function testBeneficiaryDetailsAPI() {
    $baseUrl = 'http://localhost:8000/api';
    $userId = 1; // Change this to an actual user ID
    
    echo "Testing Beneficiary Details API...\n";
    echo "URL: {$baseUrl}/beneficiary-details/user/{$userId}\n\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "{$baseUrl}/beneficiary-details/user/{$userId}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    curl_close($ch);
    
    echo "HTTP Status Code: {$httpCode}\n";
    echo "Response Headers:\n{$headers}\n";
    echo "Response Body:\n{$body}\n";
    
    if ($httpCode === 200) {
        echo "\n✅ API call successful!\n";
    } else {
        echo "\n❌ API call failed!\n";
    }
}

// Test the test endpoint
function testTestEndpoint() {
    $baseUrl = 'http://localhost:8000/api';
    $userId = 1; // Change this to an actual user ID
    
    echo "\n\nTesting Test Endpoint...\n";
    echo "URL: {$baseUrl}/test/beneficiary-details/{$userId}\n\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "{$baseUrl}/test/beneficiary-details/{$userId}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    curl_close($ch);
    
    echo "HTTP Status Code: {$httpCode}\n";
    echo "Response Headers:\n{$headers}\n";
    echo "Response Body:\n{$body}\n";
    
    if ($httpCode === 200) {
        echo "\n✅ Test endpoint successful!\n";
    } else {
        echo "\n❌ Test endpoint failed!\n";
    }
}

// Run tests
echo "=== API TESTING SCRIPT ===\n";
echo "Make sure your Laravel server is running on localhost:8000\n\n";

testBeneficiaryDetailsAPI();
testTestEndpoint();

echo "\n=== TESTING COMPLETE ===\n";
echo "If you see errors, check:\n";
echo "1. Laravel server is running\n";
echo "2. Database is connected\n";
echo "3. Routes are properly defined\n";
echo "4. Controllers exist and are working\n";
?>