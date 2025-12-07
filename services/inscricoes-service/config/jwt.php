<?php

function validarTokenJWT($token) {
    $secret = getenv('JWT_SECRET') ?: 'MinhaChaveSecretaSuperSeguraParaJWT2024!@#$%';
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    list($header, $payload, $signature) = $parts;

    $expectedSignature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)));

    if ($signature !== $expectedSignature) {
        return null;
    }

    $decoded = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    if (isset($decoded['exp']) && $decoded['exp'] < time()) {
        return null;
    }

    return $decoded;
}

function obterTokenDoHeader() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    
    if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}

function obterUsuarioIdDoToken() {
    $token = obterTokenDoHeader();
    if (!$token) {
        return null;
    }
    
    $decoded = validarTokenJWT($token);
    if (!$decoded || !isset($decoded['userId'])) {
        return null;
    }
    
    return (int)$decoded['userId'];
}







