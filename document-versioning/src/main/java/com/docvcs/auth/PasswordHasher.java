package com.docvcs.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Прост хешер за пароли — SHA-256 + случайна сол.
 *
 * Формат на съхранените хешове: "sha256$<base64-salt>$<base64-hash>"
 *
 * Защо не BCrypt/Argon2:
 *   - Те са по-сигурни (умишлено бавни → brute-force е труден), но изискват
 *     нова зависимост. SHA-256+salt работи с вградените Java класове.
 *   - Всеки е много по-добре от plaintext.
 *
 * Миграция от plaintext:
 *   - verify() връща true и за стари plaintext пароли (сравнение по стойност).
 *   - needsRehash() показва кои записи са още plaintext и трябва да се
 *     презапишат при първо валидно влизане.
 */
public class PasswordHasher {

    private static final String ALGO = "SHA-256";
    private static final String PREFIX = "sha256$";
    private static final SecureRandom RNG = new SecureRandom();

    /** Хешира нова парола със случайна 16-байтова сол. */
    public static String hash(String password) {
        byte[] salt = new byte[16];
        RNG.nextBytes(salt);
        byte[] digest = digest(password, salt);
        return PREFIX
                + Base64.getEncoder().encodeToString(salt)
                + "$"
                + Base64.getEncoder().encodeToString(digest);
    }

    /**
     * Проверява дали подадената парола отговаря на съхранения запис.
     * Ако записът е plaintext (без префикс) — сравнява директно (за миграция).
     */
    public static boolean verify(String password, String stored) {
        if (password == null || stored == null) return false;

        // Legacy: стари потребители с plaintext пароли
        if (!stored.startsWith(PREFIX)) {
            return stored.equals(password);
        }

        String[] parts = stored.split("\\$");
        if (parts.length != 3) return false;

        try {
            byte[] salt = Base64.getDecoder().decode(parts[1]);
            byte[] expected = Base64.getDecoder().decode(parts[2]);
            byte[] actual = digest(password, salt);
            return constantTimeEquals(expected, actual);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /** True, ако записът е още в плейнтекст формат и трябва миграция. */
    public static boolean needsRehash(String stored) {
        return stored != null && !stored.startsWith(PREFIX);
    }

    private static byte[] digest(String password, byte[] salt) {
        try {
            MessageDigest md = MessageDigest.getInstance(ALGO);
            md.update(salt);
            return md.digest(password.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 не е наличен", e);
        }
    }

    /** Сравнение в константно време — срещу timing атаки. */
    private static boolean constantTimeEquals(byte[] a, byte[] b) {
        if (a.length != b.length) return false;
        int result = 0;
        for (int i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }
}
